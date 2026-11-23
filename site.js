/* Foco — shared page behaviour (language switch, booking links, contour art). */

// Booking link for every element marked data-book. Paste your Google Calendar
// appointment schedule link here (calendar.app.google/... or
// calendar.google.com/calendar/appointments/schedules/...).
var FOCO_BOOKING_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hys4-vYH0p6JiP1E88CDM4xvwd8mkeZA96j-dxtdYf2SvU6gEb1Xh38McmitKabGKI6x2yvz_";

(function () {
  var NS = "http://www.w3.org/2000/svg";

  // Topographic contour rings converging on a focal point.
  // <svg data-contours="cx,cy"> with a 1200x700 viewBox.
  document.querySelectorAll("svg[data-contours]").forEach(function (svg) {
    var c = svg.getAttribute("data-contours").split(",").map(Number);
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "focal");
    g.style.transformOrigin = c[0] + "px " + c[1] + "px";
    for (var i = 0; i < 16; i++) {
      var rx = 46 + i * 62 + Math.pow(i, 1.6) * 6;
      var e = document.createElementNS(NS, "ellipse");
      e.setAttribute("cx", c[0] + Math.sin(i * 0.9) * 10);
      e.setAttribute("cy", c[1] + Math.cos(i * 0.7) * 6);
      e.setAttribute("rx", rx);
      e.setAttribute("ry", rx * 0.46);
      e.setAttribute("stroke-width", i < 3 ? 1.3 : 1);
      e.setAttribute("stroke-opacity", Math.max(0.06, 0.32 - i * 0.017));
      (i < 4 ? g : svg).appendChild(e);
    }
    svg.appendChild(g);
  });

  // Booking links: open the calendar in the same tab once a URL is set
  // (new tabs get blocked by in-app browsers like LinkedIn or WhatsApp).
  var url = (FOCO_BOOKING_URL || "").trim();
  if (url) {
    document.querySelectorAll("[data-book]").forEach(function (a) {
      a.setAttribute("href", url);
      a.removeAttribute("target");
    });
  }

  // Language switch.
  var root = document.documentElement;
  var buttons = document.querySelectorAll("[data-set-lang]");
  var meta = document.querySelector('meta[name="description"]');
  var titleEl = document.querySelector("title");
  var titles = { en: titleEl.getAttribute("data-en") || document.title, es: titleEl.getAttribute("data-es") || document.title };
  var descs = { en: meta && meta.getAttribute("data-en"), es: meta && meta.getAttribute("data-es") };

  function setLang(lang, save) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.title = titles[lang];
    if (meta && descs[lang]) meta.setAttribute("content", descs[lang]);
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)); });
    if (save) { try { localStorage.setItem("foco-lang", lang); } catch (e) {} }
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.setLang, true); });
  });
  setLang(root.getAttribute("data-lang") || "en", false);

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
