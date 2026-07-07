(function () {
  const DEFAULT_REDIRECT = "/platform";
  const CLERK_ROOT_SELECTOR = "[data-auth-clerk-root]";
  const MOUNT_HEALTH_DELAY_MS = 1800;
  const MAX_RECOVERY_ATTEMPTS = 3;
  const params = new URLSearchParams(window.location.search);
  let activeMode = getModeFromParams();
  const redirectUrl = normalizeRedirect(params.get("redirect_url") || DEFAULT_REDIRECT);
  let authClient = null;
  let mountedMode = null;
  let mountedElement = null;
  let mountSerial = 0;
  let mountHealthTimer = null;
  let mountObserver = null;
  let lastMountAt = 0;
  let recoveryAttempts = 0;
  const els = {
    title: document.querySelector("#authTitle"),
    subtitle: document.querySelector("#authSubtitle"),
    authMount: document.querySelector("#authMount"),
    mobileTitle: document.querySelector("#authMobileTitle"),
    mobileSubtitle: document.querySelector("#authMobileSubtitle"),
    switchSignIn: document.querySelector("[data-auth-mode='sign-in']"),
    switchSignUp: document.querySelector("[data-auth-mode='sign-up']"),
    statusDot: document.querySelector("#authStatusDot"),
    statusText: document.querySelector("#authStatusText"),
  };

  function getModeFromParams(search = window.location.search) {
    return new URLSearchParams(search).get("mode") === "sign-up" ? "sign-up" : "sign-in";
  }

  function normalizeRedirect(value) {
    const fallback = DEFAULT_REDIRECT;
    const url = String(value || "").trim();
    if (!url || url.startsWith("//")) return fallback;

    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.origin !== window.location.origin) return fallback;
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
    } catch {
      return fallback;
    }
  }

  function authUrl(nextMode) {
    const query = `mode=${nextMode}&redirect_url=${encodeURIComponent(redirectUrl)}`;
    return window.location.protocol === "file:" ? `login.html?${query}` : `/login.html?${query}`;
  }

  function setModeCopy() {
    const isSignUp = activeMode === "sign-up";
    document.body.dataset.authMode = activeMode;

    els.title.textContent = isSignUp ? "Skapa ett konto" : "Välkommen tillbaka";
    els.subtitle.textContent = isSignUp
      ? "Innan du börjar behöver du skapa ett konto."
      : "Logga in för att fortsätta din väktarutbildning.";

    if (els.mobileTitle && els.mobileSubtitle) {
      els.mobileTitle.innerHTML = isSignUp ? "Skapa ett <span>konto.</span>" : "Fortsätt där <span>du slutade.</span>";
      els.mobileSubtitle.textContent = isSignUp
        ? "Innan du börjar behöver du skapa ett konto."
        : "Logga in för att nå VU1, VU2, övningsquiz och slutprov.";
    }

    els.switchSignIn.href = authUrl("sign-in");
    els.switchSignUp.href = authUrl("sign-up");
    els.switchSignIn.classList.toggle("is-active", !isSignUp);
    els.switchSignUp.classList.toggle("is-active", isSignUp);
    els.switchSignIn.setAttribute("aria-current", isSignUp ? "false" : "page");
    els.switchSignUp.setAttribute("aria-current", isSignUp ? "page" : "false");
  }

  function clearMountHealthCheck() {
    if (!mountHealthTimer) return;
    window.clearTimeout(mountHealthTimer);
    mountHealthTimer = null;
  }

  function disconnectMountObserver() {
    if (!mountObserver) return;
    mountObserver.disconnect();
    mountObserver = null;
  }

  function getMountedRoot() {
    if (mountedElement?.isConnected) return mountedElement;
    return els.authMount.querySelector(CLERK_ROOT_SELECTOR);
  }

  function hasAuthComponentContent() {
    const root = getMountedRoot();
    if (!root) return false;

    return Boolean(
      root.querySelector(".cl-rootBox, .cl-cardBox, .cl-card, form, input, button") ||
        root.textContent.trim().length
    );
  }

  function unmountAuthComponent({ clearMount = true } = {}) {
    clearMountHealthCheck();
    const target = getMountedRoot();

    const unmountMethod = mountedMode === "sign-up" ? "unmountSignUp" : "unmountSignIn";
    if (authClient && target && typeof authClient[unmountMethod] === "function") {
      try {
        authClient[unmountMethod](target);
      } catch (error) {
        console.warn("Auth-komponenten kunde inte avmonteras rent.", error);
      }
    }

    if (clearMount) els.authMount.replaceChildren();
    mountedMode = null;
    mountedElement = null;
  }

  function renderMountFailure() {
    disconnectMountObserver();
    setConnectionStatus("warning", "Inloggning ej tillgÃ¤nglig");
    renderStatus(
      "Inloggningen kunde inte visas",
      "Ladda om sidan och fÃ¶rsÃ¶k igen. Om problemet kvarstÃ¥r kan auth-tjÃ¤nsten vara blockerad eller tillfÃ¤lligt otillgÃ¤nglig."
    );
  }

  function scheduleMountHealthCheck(serial = mountSerial) {
    clearMountHealthCheck();
    mountHealthTimer = window.setTimeout(() => {
      if (serial !== mountSerial || !authClient || authClient.isSignedIn) return;
      if (hasAuthComponentContent()) return;

      if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
        renderMountFailure();
        return;
      }

      recoveryAttempts += 1;
      mountAuthComponent({ recovery: true });
    }, MOUNT_HEALTH_DELAY_MS);
  }

  function ensureAuthComponent(reason) {
    if (!authClient || authClient.isSignedIn) return;
    if (hasAuthComponentContent()) return;

    const elapsed = Date.now() - lastMountAt;
    if (elapsed < MOUNT_HEALTH_DELAY_MS) {
      scheduleMountHealthCheck(mountSerial);
      return;
    }

    if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
      renderMountFailure();
      return;
    }

    console.warn(`Auth-formulÃ¤ret saknades och monteras om (${reason}).`);
    recoveryAttempts += 1;
    mountAuthComponent({ recovery: true });
  }

  function observeAuthMount() {
    disconnectMountObserver();
    mountObserver = new MutationObserver(() => {
      if (!authClient || authClient.isSignedIn) return;
      window.setTimeout(() => ensureAuthComponent("tom mount-container"), 250);
    });
    mountObserver.observe(els.authMount, {
      childList: true,
      subtree: true,
    });
  }

  function mountAuthComponent({ recovery = false } = {}) {
    if (!authClient) return;

    if (!recovery) recoveryAttempts = 0;
    const serial = ++mountSerial;
    lastMountAt = Date.now();
    disconnectMountObserver();
    unmountAuthComponent();

    const root = document.createElement("div");
    root.className = "auth-clerk-root";
    root.dataset.authClerkRoot = "";
    root.dataset.authMode = activeMode;
    els.authMount.replaceChildren(root);
    mountedElement = root;

    const commonOptions = {
      routing: "hash",
      fallbackRedirectUrl: redirectUrl,
      forceRedirectUrl: redirectUrl,
    };

    try {
      if (activeMode === "sign-up") {
        const result = authClient.mountSignUp(root, {
          ...commonOptions,
          signInUrl: authUrl("sign-in"),
          signInFallbackRedirectUrl: redirectUrl,
          signInForceRedirectUrl: redirectUrl,
        });
        if (result && typeof result.catch === "function") {
          result.catch((error) => {
            console.warn("Auth-komponenten kunde inte monteras.", error);
            ensureAuthComponent("mountSignUp-fel");
          });
        }
        mountedMode = "sign-up";
        observeAuthMount();
        scheduleMountHealthCheck(serial);
        return;
      }

      const result = authClient.mountSignIn(root, {
        ...commonOptions,
        signUpUrl: authUrl("sign-up"),
        signUpFallbackRedirectUrl: redirectUrl,
        signUpForceRedirectUrl: redirectUrl,
      });
      if (result && typeof result.catch === "function") {
        result.catch((error) => {
          console.warn("Auth-komponenten kunde inte monteras.", error);
          ensureAuthComponent("mountSignIn-fel");
        });
      }
      mountedMode = "sign-in";
      observeAuthMount();
      scheduleMountHealthCheck(serial);
    } catch (error) {
      console.warn("Auth-komponenten kunde inte monteras.", error);
      ensureAuthComponent("mount-undantag");
    }
  }

  function setActiveMode(nextMode, options = {}) {
    const normalizedMode = nextMode === "sign-up" ? "sign-up" : "sign-in";
    const modeChanged = normalizedMode !== activeMode;
    activeMode = normalizedMode;
    setModeCopy();

    if (options.updateHistory) {
      const nextUrl = authUrl(activeMode);
      try {
        if (options.replace) {
          window.history.replaceState({ authMode: activeMode }, "", nextUrl);
        } else if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
          window.history.pushState({ authMode: activeMode }, "", nextUrl);
        }
      } catch (error) {
        console.warn("Auth-URL:en kunde inte uppdateras i historiken.", error);
      }
    }

    if (authClient && (modeChanged || !hasAuthComponentContent())) mountAuthComponent();
  }

  function bindModeSwitching() {
    [els.switchSignIn, els.switchSignUp].forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveMode(link.dataset.authMode, { updateHistory: true });
      });
    });

    window.addEventListener("popstate", () => {
      setActiveMode(getModeFromParams(), { updateHistory: false });
      window.setTimeout(() => ensureAuthComponent("historiknavigering"), 0);
    });

    window.addEventListener("hashchange", () => window.setTimeout(() => ensureAuthComponent("hashnavigering"), 0));
    window.addEventListener("pageshow", () => window.setTimeout(() => ensureAuthComponent("pageshow"), 0));
    window.addEventListener("focus", () => window.setTimeout(() => ensureAuthComponent("fokus"), 0));
  }

  function setConnectionStatus(status, text) {
    if (!els.statusDot || !els.statusText) return;

    els.statusDot.classList.remove("is-loading", "is-warning");
    if (status === "loading") els.statusDot.classList.add("is-loading");
    if (status === "warning") els.statusDot.classList.add("is-warning");
    els.statusText.textContent = text;
  }

  function renderStatus(title, copy) {
    disconnectMountObserver();
    clearMountHealthCheck();
    mountedMode = null;
    mountedElement = null;
    els.authMount.innerHTML = `
      <div class="auth-status">
        <strong>${title}</strong>
        <p>${copy}</p>
      </div>
    `;
  }

  function renderLoading() {
    disconnectMountObserver();
    clearMountHealthCheck();
    mountedMode = null;
    mountedElement = null;
    els.authMount.innerHTML = `
      <div class="auth-status">
        <span class="auth-loader" aria-hidden="true"></span>
        <strong>Laddar säker inloggning</strong>
        <p>Vänta ett ögonblick medan inloggningen startas.</p>
      </div>
    `;
  }

  async function initAuthPage() {
    bindModeSwitching();
    setActiveMode(activeMode, { updateHistory: true, replace: true });
    setConnectionStatus("loading", "Säker anslutning");
    renderLoading();

    try {
      authClient = await window.vaktskolanAuthProvider.ready;
      if (!authClient) {
        setConnectionStatus("warning", "Inloggning ej tillgänglig");
        renderStatus(
          "Inloggningen är inte tillgänglig just nu",
          "Kontrollera att du använder rätt portaladress eller försök igen senare."
        );
        return;
      }

      if (authClient.isSignedIn) {
        disconnectMountObserver();
        clearMountHealthCheck();
        window.location.replace(redirectUrl);
        return;
      }

      setConnectionStatus("ready", "Redo för inloggning");
      mountAuthComponent();
    } catch (error) {
      console.error(error);
      setConnectionStatus("warning", "Inloggning ej tillgänglig");
      renderStatus(
        "Inloggningen kunde inte startas",
        "Försök igen om en stund eller kontakta support om problemet kvarstår."
      );
    }
  }

  initAuthPage();
})();
