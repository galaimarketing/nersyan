(function () {
  function apply() {
  try {
    var raw = localStorage.getItem("nersian-settings");
    if (!raw) return;
    var s = JSON.parse(raw);
    var title = (s.seoTitle && s.seoTitle.trim()) || "Nersian Taiba Hotel | نرسيان طيبة - Hotels in Madinah";
    var desc = (s.seoDescription && s.seoDescription.trim()) || "Luxurious hotel accommodation near Al-Masjid an-Nabawi in Madinah, Saudi Arabia.";
    var keywords = (s.seoKeywords && s.seoKeywords.trim()) || "Hotels in Madinah, Nersian Taiba, فنادق المدينة المنورة, نرسيان طيبة";
    document.title = title;
    var el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", desc);
    el = document.querySelector('meta[name="keywords"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "keywords");
      document.head.appendChild(el);
    }
    el.setAttribute("content", keywords);
    el = document.querySelector('meta[property="og:title"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", "og:title");
      document.head.appendChild(el);
    }
    el.setAttribute("content", title);
    el = document.querySelector('meta[property="og:description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", "og:description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", desc);
  } catch (e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
