/* projects.js — renders sections/cards AND optional product hero from JSON

Usage:
  1) Templates present in HTML:
     <template id="section-heading">
       <div class="span-12 center"><h1></h1></div>
     </template>
     <template id="card-template">
       <div class="span-4 m-span-6 s-span-12">
         <a href="">
           <img src="" alt="">
           <h3></h3>
           <p></p>
         </a>
       </div>
     </template>
     <!-- Optional (for detail pages): -->
     <template id="hero-template">
       <div class="product-hero"><img src="" alt=""></div>
     </template>

  2) Include script (defer recommended):
     <script src="projects.js" defer></script>

  Optional data- attributes on the <script> tag:
    data-json       — JSON path (default "data/projects.json")
    data-grid       — grid selector (default ".grid.div-max-width")
    data-base-path  — prefix for href/img (e.g., "../" on subpages)
    data-hero-sel   — container selector to insert hero into (default ".content-wrapper")
    data-project    — explicit project key/slug for detail page lookup

  JSON shape (per card), new "hero" block is optional:
    {
      "href": "PacFrens/index.html",
      "img": "PacFrens/product_thumbnail.jpg",
      "alt": "Pac Frens",
      "title": "Pac Frens",
      "desc": "NFT Collectibles",
      "classes": "span-6 m-span-6 s-span-12",
      "slug": "pacfrens",                 // recommended for stable lookup
      "hero": { "src": "PacFrens/product_hero.gif", "alt": "PacFrens", "loading": "eager" }
    }
*/

(function () {
  // --- Config from the current <script> tag ---
  const thisScript = document.currentScript;
  const JSON_PATH  = thisScript?.getAttribute("data-json") || "projects.json";
  const GRID_SEL   = thisScript?.getAttribute("data-grid") || ".grid .div-max-width";
  const BASE_PATH  = thisScript?.getAttribute("data-base-path") || "";
  const HERO_SEL   = thisScript?.getAttribute("data-hero-sel") || ".content-wrapper";
  const EXPLICIT_PROJECT = thisScript?.getAttribute("data-project") || "";

  // --- Helpers ---
  const qs = (sel, root = document) => {
    const el = root.querySelector(sel);
    if (!el) throw new Error(`Missing required element: ${sel}`);
    return el;
  };

  const exists = (sel, root = document) => !!root.querySelector(sel);

  function buildImg(imgEl, src, alt, opts = {}) {
    imgEl.src = BASE_PATH + (src || "");
    imgEl.alt = alt || "";
    imgEl.loading  = opts.loading || "lazy";
    imgEl.decoding = "async";
    if (opts.width)  imgEl.width  = opts.width;
    if (opts.height) imgEl.height = opts.height;
  }

  function buildLink(aEl, href, opts = {}) {
    aEl.href = BASE_PATH + (href || "#");
    if (opts.target) aEl.target = opts.target;
    if (opts.rel)    aEl.rel    = opts.rel;
  }

  async function fetchJSON(path) {
    const res = await fetch(path, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
    return res.json();
  }

  // --- Render Sections + Cards (for list pages) ---
  async function renderGrid(sections) {
    if (!exists(GRID_SEL)) return; // grid not on this page -> skip
    const grid = qs(GRID_SEL);
    const tplHead = qs("#section-heading");
    const tplCard = qs("#card-template");
    const frag = document.createDocumentFragment();

    for (const section of sections) {
      // Heading
      const headNode = tplHead.content.cloneNode(true);
      headNode.querySelector("h1").textContent = section.title || "";
      frag.appendChild(headNode);

      // Cards
      for (const c of section.cards || []) {
        const node = tplCard.content.cloneNode(true);
        const wrapper = node.firstElementChild;
        const a   = node.querySelector("a");
        const img = node.querySelector("img");
        const h3  = node.querySelector("h3");
        const p   = node.querySelector("p");

        if (c.classes) wrapper.className = c.classes;
        if (c.slug) wrapper.classList.add(normalize(c.slug));

        buildLink(a, c.href, { target: c.target, rel: c.rel });
        buildImg(img, c.img, c.alt, { width: c.width, height: c.height });
        h3.textContent = c.title || "";
        p.textContent  = c.desc  || "";

        frag.appendChild(node);
      }
    }
    grid.appendChild(frag);
  }

  // --- Hero injection (for detail pages) ---
  function inferProjectKeyFromPage() {
    if (EXPLICIT_PROJECT) return EXPLICIT_PROJECT.toLowerCase();

    // 1) body id
    const bodyId = document.body?.id?.toLowerCase?.() || "";
    if (bodyId) return bodyId;

    // 2) folder name from URL: /Something/Project/index.html -> "project"
    try {
      const parts = location.pathname.split("/").filter(Boolean);
      if (parts.length) {
        const last = parts[parts.length - 1];
        // if ends with .html, take parent folder; else use last part
        if (last.endsWith(".html") && parts.length >= 2) {
          return parts[parts.length - 2].toLowerCase();
        }
        return last.toLowerCase();
      }
    } catch {}
    return "";
  }

  function normalize(str = "") {
    return String(str).toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_-]/g, "");
  }

  function matchProjectCard(allCards, key) {
    const k = normalize(key);
    if (!k) return null;

    // 1) Prefer explicit slug match
    let found = allCards.find(c => normalize(c.slug || "") === k);
    if (found) return found;

    // 2) Match by title (normalized)
    found = allCards.find(c => normalize(c.title || "") === k);
    if (found) return found;

    // 3) Match by href folder name
    found = allCards.find(c => {
      const href = String(c.href || "");
      const folder = href.split("/").filter(Boolean).slice(-2, -1)[0]; // parent folder
      return normalize(folder || "") === k;
    });
    return found || null;
  }

  function renderHeroIfPresent(sections) {
    if (!exists("#hero-template")) return; // no hero template -> skip

    const heroTpl = qs("#hero-template");
    const heroContainer = document.querySelector(HERO_SEL) || document.body;

    // flatten cards
    const allCards = sections.flatMap(s => s.cards || []);
    const key = inferProjectKeyFromPage();
    const project = matchProjectCard(allCards, key);

    if (project?.hero) {
      const node = heroTpl.content.cloneNode(true);
      const img = node.querySelector("img");
      const h   = project.hero;

      buildImg(img, h.src, h.alt || project.title, { loading: h.loading, width: h.width, height: h.height });

      // insert hero at top of the container
      heroContainer.prepend(node);
    }
  }

  // --- Boot ---
  async function boot() {
    try {
      const sections = await fetchJSON(JSON_PATH);
      // Try both: if the page has a grid, render it. If it has hero template, inject hero.
      await renderGrid(sections);
      renderHeroIfPresent(sections);
    } catch (err) {
      console.error("[projects.js]", err);
      // Optional UI fallback
      try {
        const grid = document.querySelector(GRID_SEL);
        if (grid) {
          const fallback = document.createElement("p");
          fallback.style.color = "#c00";
          fallback.textContent = "Sorry—projects failed to load.";
          grid.appendChild(fallback);
        }
      } catch {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
