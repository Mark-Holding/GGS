/* =====================================================================
   Gloucester Garden Services — behaviour
   Contact details, form delivery and small UX niceties.
   Business settings live in window.GGS_CONFIG (see index.html).
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.GGS_CONFIG || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  document.documentElement.classList.remove("no-js");

  /* ---------- 1. Apply business settings everywhere ---------------- */
  function applyConfig() {
    var waText = encodeURIComponent("Hi, I'd like a quote for my garden please.");
    $$("[data-phone]").forEach(function (el) { if (cfg.phone) el.textContent = cfg.phone; });
    $$("[data-email]").forEach(function (el) { if (cfg.email) el.textContent = cfg.email; });
    $$("[data-hours]").forEach(function (el) { if (cfg.hoursNote) el.textContent = cfg.hoursNote; });
    $$("[data-tel]").forEach(function (a) { if (cfg.phoneHref) a.href = "tel:" + cfg.phoneHref; });
    $$("[data-mailto]").forEach(function (a) { if (cfg.email) a.href = "mailto:" + cfg.email; });
    $$("[data-whatsapp]").forEach(function (a) {
      if (cfg.whatsapp) a.href = "https://wa.me/" + cfg.whatsapp + "?text=" + waText;
      else a.style.display = "none";
    });
    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- 2. Header: scrolled state + mobile nav ---------------- */
  function initHeader() {
    var header = $(".site-header");
    var toggle = $("#nav-toggle");
    var nav = $("#site-nav");
    if (!header) return;

    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && nav) {
      var setOpen = function (open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      };
      toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
      $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
      document.addEventListener("click", function (e) {
        if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
      });
    }
  }

  /* ---------- 3. Sticky mobile CTA (appears after the hero) --------- */
  function initStickyCta() {
    var bar = $(".sticky-cta");
    var hero = $(".hero");
    var quote = $("#quote");
    if (!bar || !hero) return;
    document.body.classList.add("has-sticky-cta");

    var heroGone = false, quoteInView = false;
    var update = function () { bar.classList.toggle("is-visible", heroGone && !quoteInView); };

    if (!("IntersectionObserver" in window)) { heroGone = true; update(); return; }
    new IntersectionObserver(function (entries) {
      heroGone = !entries[0].isIntersecting && entries[0].boundingClientRect.bottom < 0; update();
    }, { threshold: 0 }).observe(hero);
    if (quote) {
      new IntersectionObserver(function (entries) {
        quoteInView = entries[0].isIntersecting; update();
      }, { threshold: 0.35 }).observe(quote);
    }
  }

  /* ---------- 4. Reveal-on-scroll ---------------------------------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Service links pre-select the service in the form -- */
  function initServiceLinks() {
    $$("[data-service]").forEach(function (a) {
      a.addEventListener("click", function () {
        var wanted = a.getAttribute("data-service");
        var select = $("#q-service");
        if (!select) return;
        var match = $$("option", select).filter(function (o) { return o.textContent.trim() === wanted; })[0];
        if (match) { select.value = match.value || match.textContent; select.classList.add("is-prefilled"); }
        // Nudge focus to the first empty field once we've scrolled.
        setTimeout(function () { var first = $("#q-name"); if (first && !first.value) first.focus({ preventScroll: true }); }, 600);
      });
    });
  }

  /* ---------- 6. Quote forms --------------------------------------- */
  function trackConversion(formName) {
    try {
      // Google Analytics 4 / Tag Manager, if present on the page.
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form_name: formName });
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: "quote_request", form_name: formName });
      // Meta Pixel, if present.
      if (typeof window.fbq === "function") window.fbq("track", "Lead", { content_name: formName });
    } catch (e) { /* analytics is optional */ }
  }

  function fieldWrap(input) { return input.closest(".field") || input.parentElement; }

  function setError(input, msg) {
    var wrap = fieldWrap(input);
    wrap.classList.add("is-invalid");
    var err = wrap.querySelector(".field-error");
    if (!err) { err = document.createElement("p"); err.className = "field-error"; wrap.appendChild(err); }
    err.textContent = msg;
    input.setAttribute("aria-invalid", "true");
  }
  function clearError(input) {
    var wrap = fieldWrap(input);
    wrap.classList.remove("is-invalid");
    var err = wrap.querySelector(".field-error"); if (err) err.remove();
    input.removeAttribute("aria-invalid");
  }

  function validate(form) {
    var ok = true, firstBad = null;
    $$("input, select, textarea", form).forEach(function (input) {
      if (input.type === "hidden" || input.name === "_gotcha" || input.type === "radio") return;
      clearError(input);
      var v = input.value.trim();
      var label = (fieldWrap(input).querySelector("label") || {}).textContent || "This field";
      label = label.replace(/\*|\(optional\)/g, "").trim();
      var msg = null;
      if (input.required && !v) msg = "Please enter " + label.toLowerCase().replace(/^your /, "your ") + ".";
      else if (v && input.type === "tel" && v.replace(/[^\d+]/g, "").length < 10) msg = "Please enter a full phone number.";
      else if (v && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Please check that email address.";
      else if (v && input.name === "postcode" && !/^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/.test(v)) msg = "Please enter a valid UK postcode.";
      if (input.tagName === "SELECT" && input.required && !v) msg = "Please choose a service.";
      if (msg) { setError(input, msg); ok = false; firstBad = firstBad || input; }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function serialise(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) { if (k !== "_gotcha") data[k] = String(v).trim(); });
    data.form = form.getAttribute("data-form-name") || "quote";
    data.page = location.href;
    data._subject = "New quote request from " + (data.name || "website visitor") + " (" + (data.service || "garden") + ")";
    return data;
  }

  function buildMailto(data) {
    var lines = [
      "Hello " + (cfg.businessName || "Gloucester Garden Services") + ",",
      "",
      "I'd like a free quote please.",
      "",
      "Name: " + (data.name || ""),
      "Phone: " + (data.phone || ""),
      data.email ? "Email: " + data.email : null,
      "Postcode: " + (data.postcode || ""),
      "Service: " + (data.service || ""),
      data.contact_preference ? "Preferred contact: " + data.contact_preference : null,
      "",
      "About my garden:",
      data.message || "(not provided)"
    ].filter(function (l) { return l !== null; });
    return "mailto:" + (cfg.email || "") + "?subject=" + encodeURIComponent(data._subject) + "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function deliver(form, data) {
    var mode = cfg.formMode || "mailto";
    if (mode === "formspree" && cfg.formEndpoint) {
      return fetch(cfg.formEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data)
      }).then(function (r) { if (!r.ok) throw new Error("Formspree responded " + r.status); return "sent"; });
    }
    if (mode === "netlify") {
      var body = new URLSearchParams(); body.append("form-name", data.form);
      Object.keys(data).forEach(function (k) { if (k !== "form") body.append(k, data[k]); });
      return fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function (r) { if (!r.ok) throw new Error("Netlify responded " + r.status); return "sent"; });
    }
    // Fallback: open the visitor's email client with everything pre-filled.
    window.location.href = buildMailto(data);
    return Promise.resolve("mailto");
  }

  function showSuccess(form, how, data) {
    var firstName = (data.name || "").split(" ")[0];
    var heading = firstName ? "Thanks, " + firstName + "!" : "Thanks!";
    var body = how === "mailto"
      ? "Your email app should have opened with your request ready to send. If it didn't, call or WhatsApp us and we'll sort it straight away."
      : "Your request is on its way. We'll be in touch within one working day with your free quote.";
    var wa = cfg.whatsapp ? '<a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent("Hi, I've just requested a quote via your website (" + (data.name || "") + ", " + (data.postcode || "") + ").") + '">Send us a WhatsApp too</a>' : "";
    var tel = cfg.phoneHref ? '<a class="btn btn-ghost" style="--btn-bg:var(--green-900);--btn-fg:#fff;border-color:transparent" href="tel:' + cfg.phoneHref + '">Call ' + (cfg.phone || "") + '</a>' : "";
    form.innerHTML =
      '<div class="form-success">' +
        '<div class="tick"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
        "<h3>" + heading + "</h3><p>" + body + "</p>" +
        '<div style="display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center">' + wa + tel + "</div>" +
      "</div>";
    form.focus && form.setAttribute("tabindex", "-1"); form.focus();
  }

  function initForms() {
    $$("[data-quote-form]").forEach(function (form) {
      // Netlify needs the form name in markup; harmless elsewhere.
      if (cfg.formMode === "netlify") { form.setAttribute("data-netlify", "true"); form.setAttribute("name", form.getAttribute("data-form-name") || "quote"); }

      $$("input, select, textarea", form).forEach(function (input) {
        input.addEventListener("input", function () { if (fieldWrap(input).classList.contains("is-invalid")) clearError(input); });
        if (input.name === "postcode") input.addEventListener("blur", function () { input.value = input.value.toUpperCase().trim(); });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = $(".form-status", form);
        var btn = $('button[type="submit"]', form);
        if (status) { status.className = "form-status"; status.textContent = ""; }
        if ($('[name="_gotcha"]', form) && $('[name="_gotcha"]', form).value) return; // bot
        if (!validate(form)) return;

        var data = serialise(form);
        btn.classList.add("is-loading"); btn.disabled = true;
        deliver(form, data).then(function (how) {
          trackConversion(data.form);
          showSuccess(form, how, data);
        }).catch(function () {
          btn.classList.remove("is-loading"); btn.disabled = false;
          if (status) {
            status.className = "form-status is-error";
            status.innerHTML = "Sorry, that didn't send. Please try again, or call us on <a href=\"tel:" + (cfg.phoneHref || "") + "\">" + (cfg.phone || "") + "</a>.";
          }
        });
      });
    });
  }

  /* ---------- 7. Smooth anchor offset for sticky header ------------ */
  function initAnchors() {
    var header = $(".site-header");
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var offset = (header ? header.offsetHeight : 0) + 12;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
        if (history.pushState) history.pushState(null, "", "#" + id);
        // If we're heading to the quote form, put focus on the first field.
        var focusId = id === "quick-quote" ? "#qq-name" : (id === "quote" && !a.hasAttribute("data-service")) ? "#q-name" : null;
        if (focusId) {
          setTimeout(function () { var f = $(focusId); if (f && !f.value) f.focus({ preventScroll: true }); }, 600);
        }
      });
    });
  }

  applyConfig();
  initHeader();
  initStickyCta();
  initReveal();
  initServiceLinks();
  initForms();
  initAnchors();
})();
