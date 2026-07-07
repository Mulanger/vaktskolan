(function () {
  const CONFIG_ENDPOINT = "/api/clerk/config";
  const CLERK_JS_VERSION = "6";
  const CLERK_UI_VERSION = "1";
  const apiState = {
    config: null,
    configured: false,
    error: null,
  };

  function decodeBase64Url(value) {
    const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return atob(padded);
  }

  function getClerkDomain(publishableKey) {
    const encodedDomain = String(publishableKey || "").split("_").slice(2).join("_");
    if (!encodedDomain) throw new Error("Clerk publishable key is not valid.");

    return decodeBase64Url(encodedDomain)
      .replace(/\$$/, "")
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");
  }

  function loadScript(src, attributes = {}) {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      return existing.dataset.loaded === "true"
        ? Promise.resolve()
        : new Promise((resolve, reject) => {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", reject, { once: true });
          });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null) script.setAttribute(key, value);
      });
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          resolve();
        },
        { once: true }
      );
      script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  async function loadConfig() {
    let config = { ok: false, publishableKey: "" };

    try {
      const response = await fetch(CONFIG_ENDPOINT, {
        headers: { Accept: "application/json" },
      });
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        config = await response.json();
      }
    } catch (error) {
      apiState.error = error;
    }

    apiState.config = config;
    apiState.configured = Boolean(config?.ok && config?.publishableKey);
    return config;
  }

  async function initialize() {
    try {
      const config = await loadConfig();
      if (!config.ok || !config.publishableKey) return null;

      const clerkDomain = getClerkDomain(config.publishableKey);
      await loadScript(`https://${clerkDomain}/npm/@clerk/ui@${CLERK_UI_VERSION}/dist/ui.browser.js`);
      await loadScript(`https://${clerkDomain}/npm/@clerk/clerk-js@${CLERK_JS_VERSION}/dist/clerk.browser.js`, {
        "data-clerk-publishable-key": config.publishableKey,
      });

      if (!window.Clerk) throw new Error("ClerkJS did not initialize.");

      await window.Clerk.load({
        ui: { ClerkUI: window.__internal_ClerkUICtor },
        appearance: {
          variables: {
            colorPrimary: "#2563eb",
            colorText: "#0f172a",
            colorTextSecondary: "#64748b",
            colorBackground: "#ffffff",
            colorInputBackground: "#ffffff",
            colorInputText: "#0f172a",
            borderRadius: "0.75rem",
            fontFamily: "Inter, system-ui, sans-serif",
          },
          elements: {
            cardBox: "box-shadow: none; border: 0;",
            card: "box-shadow: none; border: 0;",
            footer: "display: none;",
          },
        },
      });

      return window.Clerk;
    } catch (error) {
      apiState.error = error;
      console.warn("Clerk kunde inte initieras. Dashboarden fortsätter utan auth-gate.", error);
      return null;
    }
  }

  window.vaktskolanClerk = {
    ready: initialize(),
    getConfig: () => apiState.config,
    getError: () => apiState.error,
    isConfigured: () => apiState.configured,
  };
})();
