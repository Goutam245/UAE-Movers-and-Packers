/* UAE Movers and Packers — page behaviour
   Everything here is an enhancement: the page is complete and readable
   with JavaScript switched off. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktop = window.matchMedia("(min-width: 53.75em)");
  var supportsIO = "IntersectionObserver" in window;

  /* ---------------------------------------------------------- 1. reveal */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!supportsIO || reduced.matches) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-in");
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------- 2. count-ups */
  function initCounters() {
    var counters = document.querySelectorAll(".count");
    if (!counters.length) return;

    // The final figures are already in the HTML, so nothing is lost
    // if this never runs.
    if (!supportsIO || reduced.matches) return;

    var format = function (n) { return n.toLocaleString("en-US"); };

    var run = function (el) {
      var target = parseInt(el.getAttribute("data-to"), 10);
      if (isNaN(target)) return;

      var duration = 1500;
      var start = null;
      el.textContent = "0";

      var frame = function (now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        // easeOutExpo — fast, then settles
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = format(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = format(target);
      };
      requestAnimationFrame(frame);
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------- 3. accordion */
  function initFaq() {
    var buttons = document.querySelectorAll(".faq__q");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      var item = btn.closest(".faq__item");
      // The markup ships every panel open, which is the correct no-JS state;
      // the default-open item is marked, and JS collapses the rest.
      var open = btn.hasAttribute("data-faq-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      item.classList.toggle("is-open", open);

      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";

        // one panel at a time
        buttons.forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          other.closest(".faq__item").classList.remove("is-open");
        });

        if (!isOpen) {
          btn.setAttribute("aria-expanded", "true");
          item.classList.add("is-open");
        }
      });
    });
  }

  /* ------------------------------------------------ 4. sticky action bar */
  function initActionBar() {
    var bar = document.getElementById("actionbar");
    var heroCta = document.getElementById("hero-wa");
    var closing = document.getElementById("book");
    if (!bar) return;

    var setHeight = function () {
      if (desktop.matches) {
        document.documentElement.style.setProperty("--bar-h", "0px");
        return;
      }
      var h = Math.round(bar.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--bar-h", h + "px");
    };

    // measure with the bar laid out but before it is revealed
    setHeight();
    window.addEventListener("resize", setHeight);
    window.addEventListener("orientationchange", setHeight);

    if (!supportsIO || !heroCta) {
      bar.classList.add("is-in");
      return;
    }

    var pastHero = false;
    var atClosing = false;
    var sync = function () {
      bar.classList.toggle("is-in", pastHero && !atClosing);
    };

    new IntersectionObserver(function (entries) {
      pastHero = !entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(heroCta);

    if (closing) {
      new IntersectionObserver(function (entries) {
        atClosing = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.2 }).observe(closing);
    }
  }

  /* ----------------------------------------------------- 5. header state */
  function initHeader() {
    var head = document.querySelector(".site-head");
    if (!head) return;
    var onScroll = function () {
      head.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --------------------------------------------------------------- boot */
  function boot() {
    initReveal();
    initCounters();
    initFaq();
    initActionBar();
    initHeader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
