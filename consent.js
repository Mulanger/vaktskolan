/**
 * Vaktskolan – cookie-samtycke med Google Consent Mode v2.
 *
 * Filen är avsiktligt självbärande vanilla JS utan beroenden, eftersom den
 * laddas på två helt separata CSS-världar: den publika Next-sajten och
 * legacy-plattformen i `index.html`. Stilarna injiceras därför härifrån och
 * ärver respektive ytas egna CSS-tokens via variabelkedjor.
 *
 * Filen äger HELA gtag-bootstrappen: den sätter consent-defaults och laddar
 * därefter själv in gtag.js. Det är medvetet. Tidigare låg gtag i en egen
 * script-tagg och den här filen måste råka köra först – men Next lägger båda
 * i RSC-payloaden utan garanterad ordning, så samtyckesspärren kunde tyst
 * sluta gälla vid en ombyggnad. Nu är ordningen en följd av satsordningen i
 * en och samma fil och går inte att bryta av misstag.
 *
 * Google-taggen laddas alltså som vanligt – den skriver bara inga cookies
 * förrän besökaren har godkänt.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "vakt-cookie-consent-v1";
  var CONSENT_VERSION = 1;
  var POLICY_URL = "/integritet";
  var GA_MEASUREMENT_ID = "G-FGHQ62P8QY";
  var ADS_CONVERSION_ID = "AW-18345242280";

  var DENIED = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  };

  var GRANTED = {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  };

  /* ---------------------------------------------------------------- gtag */

  // Replikerar Googles egen stub exakt: det är `arguments`-objektet, inte en
  // array, som ska pushas till dataLayer.
  window.dataLayer = window.dataLayer || [];
  function gtagPush() {
    window.dataLayer.push(arguments);
  }

  // app.js skickar köp-konverteringen via window.gtag, så stubben måste
  // exponeras globalt precis som Googles egen snippet gör.
  window.gtag = window.gtag || gtagPush;

  function assign(target, source) {
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
    }
    return target;
  }

  /* -------------------------------------------------------------- storage */

  function readStoredChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== CONSENT_VERSION) return null;
      if (parsed.choice !== "granted" && parsed.choice !== "denied") return null;
      return parsed.choice;
    } catch {
      return null;
    }
  }

  function writeStoredChoice(choice) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: CONSENT_VERSION,
          choice: choice,
          // Tidsstämpeln är det som gör samtycket möjligt att visa upp
          // enligt GDPR art. 7.1.
          decidedAt: new Date().toISOString(),
        }),
      );
    } catch {
      /* Privat läge eller full kvot: valet gäller då bara sessionen. */
    }
  }

  /* -------------------------------------------------------------- cookies */

  // Besökare som var inne innan samtyckeslösningen fanns kan redan ha
  // analys-/annonscookies på sin enhet. Väljer de "endast nödvändiga" ska de
  // faktiskt tas bort, inte bara sluta förnyas.
  function clearTrackingCookies() {
    var hostname = window.location.hostname;
    var domains = [null, hostname, "." + hostname];
    var parts = hostname.split(".");
    for (var i = 1; i < parts.length - 1; i += 1) {
      domains.push("." + parts.slice(i).join("."));
    }

    var names = document.cookie.split(";").map(function (entry) {
      return entry.split("=")[0].trim();
    });

    names.forEach(function (name) {
      if (!/^(_ga(_.*)?|_gid|_gat.*|_gcl_.*)$/.test(name)) return;
      domains.forEach(function (domain) {
        var cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        if (domain) cookie += "; domain=" + domain;
        document.cookie = cookie;
      });
    });
  }

  /* --------------------------------------------------------------- consent */

  // Alltid neka som utgångsläge. Har besökaren redan sagt ja skickas en
  // update synkront direkt efteråt, så det uppstår inget mätglapp.
  gtagPush("consent", "default", assign({ wait_for_update: 500 }, DENIED));
  gtagPush("set", "ads_data_redaction", true);
  gtagPush("set", "url_passthrough", true);

  var storedChoice = readStoredChoice();
  if (storedChoice === "granted") {
    gtagPush("consent", "update", GRANTED);
  }

  // Först nu laddas Google-taggen. Allt ovanför ligger redan i dataLayer, så
  // gtag.js kan aldrig hinna sätta en cookie innan samtyckesläget är känt.
  gtagPush("js", new Date());
  gtagPush("config", GA_MEASUREMENT_ID);
  gtagPush("config", ADS_CONVERSION_ID);

  var googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  (document.head || document.documentElement).appendChild(googleTag);

  /* -------------------------------------------------------------- markup */

  var STYLES =
    ".vk-consent{" +
    "position:fixed;left:0;right:0;bottom:0;z-index:10000;" +
    "display:flex;justify-content:center;" +
    "padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));" +
    "font-family:var(--font-inter,Inter),Inter,system-ui,-apple-system,'Segoe UI',sans-serif;" +
    "animation:vk-consent-rise 260ms cubic-bezier(0.22,1,0.36,1);}" +
    ".vk-consent[hidden]{display:none;}" +
    ".vk-consent *{box-sizing:border-box;}" +
    ".vk-consent__card{" +
    "display:flex;align-items:center;gap:28px;" +
    "width:min(1160px,100%);padding:20px 24px;" +
    "background:var(--paper,var(--surface,#ffffff));" +
    "border:1px solid var(--line,var(--border,#dfe4eb));border-radius:18px;" +
    "box-shadow:0 18px 50px rgba(15,23,42,0.16);}" +
    ".vk-consent__body{flex:1 1 auto;min-width:0;}" +
    ".vk-consent__eyebrow{" +
    "display:block;margin-bottom:4px;" +
    "color:var(--blue,var(--primary,#075fea));" +
    "font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;}" +
    ".vk-consent__title{" +
    "margin:0 0 6px;font-size:17px;font-weight:800;letter-spacing:-0.01em;" +
    "color:var(--ink,var(--text,#101318));}" +
    ".vk-consent__title:focus{outline:none;}" +
    ".vk-consent__text{" +
    "margin:0;font-size:14px;line-height:1.55;color:var(--muted,#5c6675);" +
    "overflow-wrap:anywhere;}" +
    ".vk-consent__text a{" +
    "color:var(--blue,var(--primary,#075fea));font-weight:600;text-underline-offset:2px;}" +
    ".vk-consent__actions{" +
    "display:flex;align-items:center;gap:10px;flex:0 0 auto;}" +
    ".vk-consent__btn{" +
    "min-height:46px;padding:0 22px;border-radius:12px;cursor:pointer;" +
    "font-family:inherit;font-size:14.5px;font-weight:700;white-space:nowrap;" +
    "transition:transform 140ms ease,box-shadow 140ms ease,background 140ms ease;}" +
    ".vk-consent__btn:hover{transform:translateY(-1px);}" +
    ".vk-consent__btn--primary{" +
    "border:1px solid var(--blue,var(--primary,#075fea));" +
    "background:var(--blue,var(--primary,#075fea));color:#ffffff;" +
    "box-shadow:0 6px 18px rgba(7,95,234,0.22);}" +
    ".vk-consent__btn--primary:hover{filter:brightness(0.94);}" +
    ".vk-consent__btn--ghost{" +
    "border:1px solid var(--line,var(--border,#dfe4eb));" +
    "background:var(--paper,var(--surface,#ffffff));" +
    "color:var(--ink,var(--text,#101318));}" +
    ".vk-consent__btn--ghost:hover{background:var(--soft,var(--surface-soft,#f3f5f8));}" +
    "@keyframes vk-consent-rise{from{opacity:0;transform:translateY(20px);}" +
    "to{opacity:1;transform:none;}}" +
    "@media (max-width:860px){" +
    ".vk-consent{padding:12px 12px calc(12px + env(safe-area-inset-bottom,0px));}" +
    ".vk-consent__card{display:block;padding:18px 18px 16px;border-radius:16px;}" +
    ".vk-consent__actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:16px;}" +
    ".vk-consent__btn{width:100%;min-height:48px;}" +
    "}" +
    "@media (prefers-reduced-motion:reduce){" +
    ".vk-consent{animation:none;}" +
    ".vk-consent__btn{transition:none;}" +
    ".vk-consent__btn:hover{transform:none;}" +
    "}";

  var bannerElement = null;
  var titleElement = null;

  function injectStyles() {
    if (document.getElementById("vk-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "vk-consent-styles";
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function buildBanner() {
    if (bannerElement) return bannerElement;
    injectStyles();

    var root = document.createElement("div");
    root.className = "vk-consent";
    root.setAttribute("role", "dialog");
    // Medvetet icke-modal: bannern ska informera och erbjuda ett val, inte
    // låsa in besökaren bakom en spärr.
    root.setAttribute("aria-modal", "false");
    root.setAttribute("aria-labelledby", "vk-consent-title");
    root.setAttribute("aria-describedby", "vk-consent-text");
    root.innerHTML =
      '<div class="vk-consent__card">' +
      '<div class="vk-consent__body">' +
      '<span class="vk-consent__eyebrow">Integritet</span>' +
      '<h2 class="vk-consent__title" id="vk-consent-title" tabindex="-1">Vi använder kakor</h2>' +
      '<p class="vk-consent__text" id="vk-consent-text">' +
      "Nödvändiga kakor får sajten och inloggningen att fungera. Vi vill också " +
      "använda kakor för analys och marknadsföring – men bara om du godkänner. " +
      '<a href="' +
      POLICY_URL +
      '">Läs mer i integritetspolicyn</a>' +
      "</p>" +
      "</div>" +
      '<div class="vk-consent__actions">' +
      '<button type="button" class="vk-consent__btn vk-consent__btn--ghost" data-consent-reject>Endast nödvändiga</button>' +
      '<button type="button" class="vk-consent__btn vk-consent__btn--primary" data-consent-accept>Godkänn alla</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(root);
    bannerElement = root;
    titleElement = root.querySelector(".vk-consent__title");
    return root;
  }

  function hideBanner() {
    if (bannerElement) bannerElement.hidden = true;
  }

  function openBanner(options) {
    var banner = buildBanner();
    banner.hidden = false;
    // Fokus flyttas bara när besökaren själv har öppnat panelen igen. Att
    // kapa fokus vid första sidladdningen vore påträngande.
    if (options && options.focus && titleElement) titleElement.focus();
  }

  function accept() {
    writeStoredChoice("granted");
    gtagPush("consent", "update", GRANTED);
    hideBanner();
  }

  function reject() {
    writeStoredChoice("denied");
    gtagPush("consent", "update", DENIED);
    clearTrackingCookies();
    hideBanner();
  }

  /* --------------------------------------------------------------- events */

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") return;

    if (target.closest("[data-consent-accept]")) {
      event.preventDefault();
      accept();
      return;
    }
    if (target.closest("[data-consent-reject]")) {
      event.preventDefault();
      reject();
      return;
    }
    if (target.closest("[data-cookie-settings]")) {
      event.preventDefault();
      openBanner({ focus: true });
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!bannerElement || bannerElement.hidden) return;
    // Escape stänger bara när ett val redan finns sparat. Utan sparat val
    // vore det en tyst dismiss, och då ska bannern ligga kvar.
    if (readStoredChoice()) hideBanner();
  });

  function start() {
    if (!readStoredChoice()) openBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.vaktskolanConsent = {
    open: function () {
      openBanner({ focus: true });
    },
    accept: accept,
    reject: reject,
    get: function () {
      return readStoredChoice() || "unset";
    },
  };
})();
