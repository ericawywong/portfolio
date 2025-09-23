// /_protect/protect.js
(function () {
  // ---- Config from <meta> tags on the gate page ----
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content || "";
  const SLUG     = meta("protected:slug");          // e.g., "braintest"
  const REDIRECT = meta("protected:redirect") || "./content.html";
  const HASH     = meta("protected:hash");          // SHA-256 hex of the password
  const STORAGE  = meta("protected:storage") || "session"; // "session" or "local"
  const storage  = STORAGE === "local" ? localStorage : sessionStorage;

  if (!SLUG || !HASH) {
    console.error("Protect: Missing required meta config (protected:slug, protected:hash).");
    return;
  }

  const FLAG_KEY = `protect:${SLUG}:unlocked`;

  // If tab/session already unlocked → skip to content
  if (storage.getItem(FLAG_KEY) === "1") {
    window.location.replace(REDIRECT);
    return;
  }

  // Wire up the form (if present). If this script is included on content.html by mistake, it will just no-op.
  const form = document.getElementById("gate-form");
  const input = document.getElementById("password");
  const error = document.getElementById("error");

  if (!form) return; // nothing to do on non-gate pages

  async function sha256Hex(str) {
    const enc = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error && (error.textContent = "");
    const pwd = (input?.value || "").trim();
    if (!pwd) {
      if (error) error.textContent = "Please enter a password.";
      input?.focus();
      return;
    }
    try {
      const hash = await sha256Hex(pwd);
      if (hash === HASH) {
        storage.setItem(FLAG_KEY, "1");
        window.location.replace(REDIRECT);
      } else {
        if (error) error.textContent = "Incorrect password. Please try again.";
        input?.select();
        input?.focus();
      }
    } catch (err) {
      if (error) error.textContent = "Something went wrong. Please try again.";
      console.error(err);
    }
  });
})();
