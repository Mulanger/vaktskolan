(function () {
  const DEFAULT_REDIRECT = "/index.html";
  const params = new URLSearchParams(window.location.search);
  let activeMode = getModeFromParams();
  const redirectUrl = normalizeRedirect(params.get("redirect_url") || DEFAULT_REDIRECT);
  let authClient = null;
  let mountedMode = null;
  const els = {
    title: document.querySelector("#authTitle"),
    subtitle: document.querySelector("#authSubtitle"),
    authMount: document.querySelector("#authMount"),
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
    els.title.textContent = isSignUp ? "Skapa ett konto" : "Välkommen tillbaka";
    els.subtitle.textContent = isSignUp
      ? "Börja träna och spara dina framsteg i plattformen."
      : "Logga in för att fortsätta din väktarutbildning.";

    els.switchSignIn.href = authUrl("sign-in");
    els.switchSignUp.href = authUrl("sign-up");
    els.switchSignIn.classList.toggle("is-active", !isSignUp);
    els.switchSignUp.classList.toggle("is-active", isSignUp);
    els.switchSignIn.setAttribute("aria-current", isSignUp ? "false" : "page");
    els.switchSignUp.setAttribute("aria-current", isSignUp ? "page" : "false");
  }

  function unmountAuthComponent() {
    if (!authClient || !mountedMode) {
      els.authMount.innerHTML = "";
      return;
    }

    const unmountMethod = mountedMode === "sign-up" ? "unmountSignUp" : "unmountSignIn";
    if (typeof authClient[unmountMethod] === "function") {
      try {
        authClient[unmountMethod](els.authMount);
      } catch (error) {
        console.warn("Auth-komponenten kunde inte avmonteras rent.", error);
      }
    }
    els.authMount.innerHTML = "";
    mountedMode = null;
  }

  function mountAuthComponent() {
    if (!authClient) return;

    unmountAuthComponent();
    const commonOptions = {
      routing: "hash",
      fallbackRedirectUrl: redirectUrl,
      forceRedirectUrl: redirectUrl,
    };

    if (activeMode === "sign-up") {
      authClient.mountSignUp(els.authMount, {
        ...commonOptions,
        signInUrl: authUrl("sign-in"),
        signInFallbackRedirectUrl: redirectUrl,
        signInForceRedirectUrl: redirectUrl,
      });
      mountedMode = "sign-up";
      return;
    }

    authClient.mountSignIn(els.authMount, {
      ...commonOptions,
      signUpUrl: authUrl("sign-up"),
      signUpFallbackRedirectUrl: redirectUrl,
      signUpForceRedirectUrl: redirectUrl,
    });
    mountedMode = "sign-in";
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

    if (authClient && modeChanged) mountAuthComponent();
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
    });
  }

  function setConnectionStatus(status, text) {
    if (!els.statusDot || !els.statusText) return;

    els.statusDot.classList.remove("is-loading", "is-warning");
    if (status === "loading") els.statusDot.classList.add("is-loading");
    if (status === "warning") els.statusDot.classList.add("is-warning");
    els.statusText.textContent = text;
  }

  function renderStatus(title, copy) {
    els.authMount.innerHTML = `
      <div class="auth-status">
        <strong>${title}</strong>
        <p>${copy}</p>
      </div>
    `;
  }

  function renderLoading() {
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
