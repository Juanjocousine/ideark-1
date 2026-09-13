/* Ideark consent + tags (Consent Mode v2) */
(function () {
  var KEY = "id_consent";
  var cfg = window.IDEARK_CONFIG || {};

  if (cfg.gscVerification) {
    var meta = document.createElement("meta");
    meta.name = "google-site-verification";
    meta.content = cfg.gscVerification;
    document.head.appendChild(meta);
  }

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  var tagsLoaded = false;
  function loadTags() {
    if (tagsLoaded) return;
    tagsLoaded = true;

    if (cfg.gtm) {
      var gtm = document.createElement("script");
      gtm.async = true;
      gtm.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.gtm);
      document.head.appendChild(gtm);
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    }

    if (cfg.ga4 || cfg.googleAdsId) {
      var ga = document.createElement("script");
      ga.async = true;
      ga.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4 || cfg.googleAdsId);
      document.head.appendChild(ga);
      gtag("js", new Date());
      if (cfg.ga4) gtag("config", cfg.ga4, { anonymize_ip: true });
      if (cfg.googleAdsId) gtag("config", cfg.googleAdsId);
    }
  }

  function loadMeta() {
    if (!cfg.metaPixel || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", cfg.metaPixel);
    fbq("track", "PageView");
  }

  function apply(granted) {
    gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied"
    });
    loadTags();
    if (granted) loadMeta();
  }

  var saved = localStorage.getItem(KEY);
  if (saved === "1") { apply(true); return; }
  if (saved === "0") { apply(false); return; }

  loadTags();

  var b = document.createElement("div");
  b.id = "id-cookie-banner";
  b.setAttribute("role", "dialog");
  b.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:300;background:rgba(8,12,20,.96);border-top:1px solid rgba(255,255,255,.08);padding:16px 20px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-family:DM Sans,sans-serif;font-size:.84rem;color:#e8edf5";
  b.innerHTML = '<span style="flex:1;min-width:220px;line-height:1.55;color:#8a96a8">Usamos cookies para medir visitas y anuncios de Ideark. <a href="/cookies" style="color:#00e5ff">Política de cookies</a></span><div style="display:flex;gap:8px;flex-shrink:0"><button type="button" id="id-consent-reject" style="background:transparent;border:1px solid rgba(255,255,255,.2);color:#e8edf5;padding:9px 16px;border-radius:8px;font-weight:600;cursor:pointer">Rechazar</button><button type="button" id="id-consent-accept" style="background:#00e5ff;border:none;color:#080c14;padding:9px 18px;border-radius:8px;font-weight:700;cursor:pointer">Aceptar</button></div>';
  function mount() {
    if (!document.body) return document.addEventListener("DOMContentLoaded", mount);
    document.body.appendChild(b);
    document.getElementById("id-consent-accept").onclick = function () {
      localStorage.setItem(KEY, "1"); apply(true); b.remove();
    };
    document.getElementById("id-consent-reject").onclick = function () {
      localStorage.setItem(KEY, "0"); apply(false); b.remove();
    };
  }
  mount();
})();
