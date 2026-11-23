/* Foco — shared page behaviour (language switch, booking links, contour art). */

// Cal.com event to book, as "username/event-slug" (e.g. "foco/intro-call").
// When set, the booking window shows Cal.com, styled in Foco's colours.
// When empty, it falls back to the Google Calendar link below.
var FOCO_CAL_LINK = "tomas-ploquin-ebghp6/30min";

// Google Calendar appointment schedule (fallback when FOCO_CAL_LINK is empty).
var FOCO_GOOGLE_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hys4-vYH0p6JiP1E88CDM4xvwd8mkeZA96j-dxtdYf2SvU6gEb1Xh38McmitKabGKI6x2yvz_";

(function () {
  var NS = "http://www.w3.org/2000/svg";

  // Topographic contour rings converging on a focal point.
  // <svg data-contours="cx,cy"> with a 1200x700 viewBox.
  function drawContours(svg) {
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
  }
  document.querySelectorAll("svg[data-contours]").forEach(drawContours);

  // Booking: every [data-book] opens the Google Calendar booking page embedded
  // in an on-page dialog, so visitors never leave the site. The plain link
  // stays as the href, as a fallback when dialogs or JS aren't available.
  var calLink = (FOCO_CAL_LINK || "").trim().replace(/^https?:\/\/(app\.)?cal\.com\//, "");
  var url = calLink ? "https://cal.com/" + calLink : (FOCO_GOOGLE_URL || "").trim();
  if (url) {
    var embedUrl = url + (url.indexOf("?") > -1 ? "&" : "?") + "gv=true";
    var dialog = null, frame = null;

    function buildDialog() {
      dialog = document.createElement("dialog");
      dialog.className = "book";
      dialog.setAttribute("aria-labelledby", "book-title");
      dialog.innerHTML = `
        <aside class="book-panel">
        <svg class="contours" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" data-contours="600,690"></svg>
        <span class="logo"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".55"/><circle cx="11" cy="11" r="2.4" fill="currentColor"/></svg>Foco</span>
        <div class="book-intro">
        <p class="label mono"><span data-l="en">Intro call · 30 min</span><span data-l="es">Llamada inicial · 30 min</span></p>
        <h2 class="book-title" id="book-title"><span data-l="en">Book a call with Foco</span><span data-l="es">Agenda una llamada con Foco</span></h2>
        <p class="book-sub"><span data-l="en">Talk directly with the engineers who would build it.</span><span data-l="es">Habla directo con los ingenieros que lo construirían.</span></p>
        <ol class="book-points">
        <li><span class="mono">01</span><span data-l="en">How your operation runs today</span><span data-l="es">Cómo funciona hoy tu operación</span></li>
        <li><span class="mono">02</span><span data-l="en">Where AI pays off first</span><span data-l="es">Dónde la IA rinde primero</span></li>
        <li><span class="mono">03</span><span data-l="en">What a first sprint looks like</span><span data-l="es">Cómo sería un primer sprint</span></li>
        </ol>
        </div>
        <p class="book-foot mono"><span data-l="en">30 min · Video call</span><span data-l="es">30 min · Videollamada</span></p>
        </aside>
        <div class="book-main">
        <div class="book-bar">
        <p class="label mono"><span data-l="en">Pick a time</span><span data-l="es">Elige un horario</span></p>
        <button type="button" class="book-close" aria-label="Close / Cerrar"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.6"/></svg>
        </button>
        </div>
        <div class="book-body">
        <p class="book-loading mono"><span data-l="en">Loading calendar…</span><span data-l="es">Cargando calendario…</span></p>
        <iframe title="Book a call with Foco"></iframe>
        <div class="book-cal" id="book-cal"></div>
        </div>
        </div>`;
      document.body.appendChild(dialog);
      frame = dialog.querySelector("iframe");
      drawContours(dialog.querySelector("svg[data-contours]"));
      frame.addEventListener("load", function () { dialog.classList.add("is-loaded"); });
      dialog.querySelector(".book-close").addEventListener("click", function () { dialog.close(); });
      // Click on the backdrop (outside the panel) closes it.
      dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", function () { document.body.classList.remove("book-open"); });
    }

    // Cal.com inline embed, themed with Foco's colours and following the
    // visitor's light/dark preference.
    var calLoaded = false;
    function loadCal() {
      if (calLoaded) return;
      calLoaded = true;
      dialog.classList.add("is-cal");
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
      var dark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches && root.getAttribute("data-theme") !== "light";
      Cal("init", "foco", { origin: "https://cal.com" });
      Cal.ns.foco("inline", {
        elementOrSelector: "#book-cal",
        calLink: calLink,
        config: { layout: "month_view", theme: dark ? "dark" : "light" }
      });
      Cal.ns.foco("ui", {
        theme: dark ? "dark" : "light",
        hideEventTypeDetails: true,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#e0521f", "cal-brand-emphasis": "#c4441a", "cal-brand-text": "#ffffff", "cal-bg": "#ffffff", "cal-bg-muted": "#f4f2ee", "cal-bg-emphasis": "#ebe8e2" },
          dark: { "cal-brand": "#ff9157", "cal-brand-emphasis": "#ffa673", "cal-brand-text": "#0f0e0c", "cal-bg": "#181715", "cal-bg-muted": "#1f1d1a", "cal-bg-emphasis": "#24221f" }
        }
      });
      Cal.ns.foco("on", { action: "linkReady", callback: function () { dialog.classList.add("is-loaded"); } });
    }

    function openBooking(e) {
      if (typeof HTMLDialogElement !== "function") return; // fall back to the plain link
      e.preventDefault();
      if (!dialog) buildDialog();
      if (calLink) loadCal();
      else if (!frame.getAttribute("src")) frame.setAttribute("src", embedUrl);
      document.body.classList.add("book-open");
      dialog.showModal();
    }

    document.querySelectorAll("[data-book]").forEach(function (a) {
      a.setAttribute("href", url);
      a.removeAttribute("target");
      a.addEventListener("click", openBooking);
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
