// site.js — clean (no CSS injection), smooth page enter/leave, Nav, Footer, ProjectNav
;(() => {
  // -------- utils --------
  const once = (fn) => {
    let called = false;
    return (...args) => { if (called) return; called = true; return fn(...args); };
  };

  const ensure = (tag, attrs = {}, where = document.head) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    where.appendChild(el);
    return el;
  };

  const sameOrigin = (url) => {
    try { return new URL(url, location.href).origin === location.origin; }
    catch { return false; }
  };

  const isModifiedClick = (e) =>
    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  const normalize = (str = "") =>
    String(str).toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_-]/g, "");

  const qs = (sel, root = document) => root.querySelector(sel);

  // -------- HEAD --------
  const Head = (() => {
    const init = once((opts = {}) => {
      const {
        title = "Erica Wong | UX/UI Designer — Portfolio",
        description = "UX/UI designer in Vancouver, BC. Case studies across product design, newsletters, and illustration. Front-end experience and human-centered design.",
        ogImage = "og-card-home.jpg",
        basePath = "", // e.g. "../" on subpages
      } = opts;

      // Preload -> Ready toggle (CSS lives in styles.css, anti-FOUC inline in HTML)
      document.documentElement.classList.add("preload");
      window.addEventListener("load", () => {
        document.documentElement.classList.remove("preload");
        document.documentElement.classList.add("ready");
      });

      // Title & basic meta (safe to keep here — not render-blocking)
      document.title = title;
      ensure("meta", { charset: "UTF-8" });
      ensure("meta", { name: "viewport", content: "width=device-width, initial-scale=1" });
      ensure("meta", { name: "description", content: description });

      // Icons / OG / Twitter (optional centralization)
      ensure("link", { rel: "icon", href: basePath + "favicon.png" });
      ensure("meta", { property: "og:title", content: "Erica Wong | UX/UI Designer" });
      ensure("meta", { property: "og:description", content: "Human-centered UX/UI work with measurable impact." });
      ensure("meta", { property: "og:image", content: basePath + ogImage });
      ensure("meta", { property: "og:type", content: "website" });

      // IMPORTANT: Do NOT inject fonts or CSS here — load them in HTML to avoid flicker.
    });
    return { init };
  })();

  // -------- NAV --------
  const Nav = (() => {
    const init = once((opts = {}) => {
      const { basePath = "" } = opts;

      const navHTML = `
        <nav>
          <div class="nav-container">
            <a class="logo" href="${basePath}index.html"></a>
          </div>
          <div class="nav-container">
            <ul>
              <li><a class="instagram" href="https://www.instagram.com/littleinkventure/" target="_blank" rel="noopener noreferrer"></a></li>
              <li><a class="email" href="mailto:ericawyw@gmail.com"></a></li>
            </ul>
            <button class="menu-icon" aria-label="Toggle menu" aria-expanded="false" aria-controls="primary-nav">&#9776;</button>
          </div>
        </nav>
      `;
      document.body.insertAdjacentHTML("afterbegin", navHTML);

      // simple toggle for small screens
      const menuIcon = document.querySelector(".menu-icon");
      const navUl = document.querySelector("nav ul");
      if (menuIcon && navUl) {
        menuIcon.addEventListener("click", () => {
          navUl.classList.toggle("active");
          const expanded = menuIcon.getAttribute("aria-expanded") === "true";
          menuIcon.setAttribute("aria-expanded", String(!expanded));
        });
      }
    });
    return { init };
  })();

  // -------- FOOTER --------
  const Footer = (() => {
    const init = once(() => {
      const footerHTML = `
        <footer>
          <p class="copyright">© ${new Date().getFullYear()} Erica Wong</p>
        </footer>
      `;
      document.body.insertAdjacentHTML("beforeend", footerHTML);
    });
    return { init };
  })();

  // -------- PAGE TRANSITIONS (ease-out on nav) --------
  const Transitions = (() => {
    const init = once(() => {
      document.addEventListener("click", (e) => {
        const a = e.target.closest && e.target.closest("a[href]");
        if (!a) return;

        const href = a.getAttribute("href") || "";

        // Ignore hash links, downloads, targets, external URLs, or modified clicks
        if (
          href.startsWith("#") ||
          a.hasAttribute("download") ||
          (a.target && a.target !== "_self") ||
          !sameOrigin(href) ||
          isModifiedClick(e)
        ) {
          return;
        }

        e.preventDefault();

        // Trigger CSS leave animation (html.leaving affects body per styles.css)
        document.documentElement.classList.add("leaving");

        // Navigate after body transition (fallback timeout just in case)
        let navigated = false;
        const go = () => { if (!navigated) { navigated = true; window.location.href = href; } };
        const onEnd = (evt) => {
          if (evt.target !== document.body) return;
          document.body.removeEventListener("transitionend", onEnd);
          go();
        };
        document.body.addEventListener("transitionend", onEnd);
        setTimeout(go, 650); // match your CSS timings
      });
    });
    return { init };
  })();

  // -------- PROJECT NAV (Prev / Next) --------
  const ProjectNav = (() => {
    async function fetchJSON(path) {
      const res = await fetch(path, { headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
      return res.json();
    }

    function inferProjectKeyFromPage() {
      // 1) body id (e.g., <body id="bestbuy">)
      const bodyId = document.body?.id?.toLowerCase?.() || "";
      if (bodyId) return bodyId;

      // 2) folder name: /Something/Project/index.html -> "project"
      try {
        const parts = location.pathname.split("/").filter(Boolean);
        if (parts.length) {
          const last = parts[parts.length - 1];
          if (last.endsWith(".html") && parts.length >= 2) {
            return parts[parts.length - 2].toLowerCase();
          }
          return last.toLowerCase();
        }
      } catch {}
      return "";
    }

    function matchProjectCard(allCards, key) {
      const k = normalize(key);
      if (!k) return null;

      // 1) slug
      let found = allCards.find(c => normalize(c.slug || "") === k);
      if (found) return found;

      // 2) title
      found = allCards.find(c => normalize(c.title || "") === k);
      if (found) return found;

      // 3) href folder name
      found = allCards.find(c => {
        const href = String(c.href || "");
        const folder = href.split("/").filter(Boolean).slice(-2, -1)[0]; // parent folder
        return normalize(folder || "") === k;
      });
      return found || null;
    }

    function flattenSections(sections) {
      const all = [];
      const sectionIndex = new Map(); // card -> section idx
      sections.forEach((section, sIdx) => {
        (section.cards || []).forEach(card => {
          all.push(card);
          sectionIndex.set(card, sIdx);
        });
      });
      return { all, sectionIndex };
    }

    function findNeighbors(list, idx, loop) {
      const prevIdx = idx > 0 ? idx - 1 : (loop ? list.length - 1 : -1);
      const nextIdx = idx < list.length - 1 ? idx + 1 : (loop ? 0 : -1);
      return {
        prev: prevIdx >= 0 ? list[prevIdx] : null,
        next: nextIdx >= 0 ? list[nextIdx] : null
      };
    }

    function buildLink(card, rel, basePath) {
      if (!card) return "";
      const title = card.title || "Untitled";
      const href  = basePath + (card.href || "#");
      const img   = card.img ? (basePath + card.img) : "";
      const alt   = card.alt || title;

      return `
        <a class="project-nav__link project-nav__link--${rel}" href="${href}" aria-label="${rel} project: ${title}">
          ${img ? `<img class="project-nav__thumb" src="${img}" alt="${alt}" loading="lazy" decoding="async">` : ""}
          <span class="project-nav__meta">
            <small>${rel === "prev" ? "←" : "→"}</small>
            <p>${title}</p>
          </span>
        </a>
      `;
    }

    const init = once(async (opts = {}) => {
      const {
        container = ".project-nav",   // where to render
        jsonPath  = "projects.json",  // path to your projects.json
        basePath  = "",               // prefix for href/img (e.g., "../" from subpages)
        scope     = "all",            // "all" | "section"
        loop      = true,             // wrap at ends
      } = opts;

      const containerEl = qs(container);
      if (!containerEl) return;

      try {
        const sections = await fetchJSON(jsonPath);
        const { all, sectionIndex } = flattenSections(sections);

        const key = inferProjectKeyFromPage();
        const current = matchProjectCard(all, key);
        if (!current) return;

        // choose the working list
        let workingList = all;
        if (String(scope).toLowerCase() === "section") {
          const sIdx = sectionIndex.get(current);
          const cardsInSection = (sections[sIdx]?.cards || []);
          workingList = cardsInSection.length ? cardsInSection : all;
        }

        const idx = workingList.indexOf(current);
        if (idx === -1) return;

        const { prev, next } = findNeighbors(workingList, idx, !!loop);

        // render
        containerEl.innerHTML = `
          <div class="project-nav__inner">
            ${buildLink(prev, "prev", basePath)}
            ${buildLink(next, "next", basePath)}
          </div>
        `;
      } catch (err) {
        console.error("[ProjectNav]", err);
      }
    });

    return { init };
  })();

  // -------- expose + auto-init --------
  window.Site = { Head, Nav, Footer, Transitions, ProjectNav };

  // Auto-init common parts; ProjectNav left for explicit init (so you can pass paths)
  document.addEventListener("DOMContentLoaded", () => {
    window.Site.Head.init({});
    window.Site.Nav.init({});
    window.Site.Footer.init({});
    window.Site.Transitions.init({});
    // window.Site.ProjectNav.init({ jsonPath: "...", basePath: "..." }); // call this per-page
  });
})();
