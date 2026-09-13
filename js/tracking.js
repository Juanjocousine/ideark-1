(function () {
  var cfg = window.IDEARK_CONFIG || {};
  var params = new URLSearchParams(location.search);
  var utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"];
  var stored = {};
  try { stored = JSON.parse(sessionStorage.getItem("id_utm") || "{}"); } catch (e) { stored = {}; }
  utmKeys.forEach(function (k) {
    var v = params.get(k);
    if (v) stored[k] = v;
  });
  sessionStorage.setItem("id_utm", JSON.stringify(stored));

  function fire(name, data) {
    var payload = data || {};
    if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, payload));
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
      if (name === "generate_lead" && cfg.googleAdsId && cfg.googleAdsLead) {
        window.gtag("event", "conversion", { send_to: cfg.googleAdsId + "/" + cfg.googleAdsLead });
      }
      if (name === "contact" && cfg.googleAdsId && cfg.googleAdsWhatsapp) {
        window.gtag("event", "conversion", { send_to: cfg.googleAdsId + "/" + cfg.googleAdsWhatsapp });
      }
    }
    if (typeof window.fbq === "function") {
      if (name === "generate_lead") window.fbq("track", "Lead");
      if (name === "contact") window.fbq("track", "Contact");
    }
  }

  document.querySelectorAll("form[name='contacto-ideark']").forEach(function (form) {
    Object.keys(stored).forEach(function (k) {
      if (form.querySelector('[name="' + k + '"]')) return;
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = stored[k];
      form.appendChild(input);
    });
    if (!form.querySelector('[name="origen"]')) {
      var origen = document.createElement("input");
      origen.type = "hidden";
      origen.name = "origen";
      origen.value = location.pathname;
      form.appendChild(origen);
    }
    form.addEventListener("submit", function () {
      fire("generate_lead", { method: "form", page: location.pathname });
    });
  });

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest("a");
    if (!a || !a.href) return;
    if (a.href.indexOf("wa.me") !== -1 || a.href.indexOf("whatsapp") !== -1) {
      fire("contact", { method: "whatsapp", page: location.pathname });
    } else if (a.href.indexOf("tel:") === 0) {
      fire("contact", { method: "phone", page: location.pathname });
    }
  });

  if (location.pathname.replace(/\/$/, "") === "/gracias") {
    fire("generate_lead", { method: "form_thanks" });
  }
})();
