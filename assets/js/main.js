/* ============================================================
   Portfolio interactions
   - Sticky nav state
   - Mobile nav toggle
   - Reveal-on-scroll (IntersectionObserver)
   - Active section highlighting in nav
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Sticky nav background ---------- */
  var nav = document.getElementById("siteNav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.querySelector(".nav-links");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", function (e) {
    if (e.target.classList.contains("nav-link")) {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Smooth scrolling for in-page anchors ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      try { history.replaceState(null, "", "#" + id); } catch (err) {}
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.transitionDelay = (parseInt(d, 10) * 90) + "ms";
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var sectionMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) sectionMap[id] = link;
  });

  if ("IntersectionObserver" in window) {
    var activeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            var link = sectionMap[entry.target.id];
            if (link) link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.keys(sectionMap).forEach(function (id) {
      activeObserver.observe(document.getElementById(id));
    });
  }
})();

/* ============================================================
   Expansion interactions
   - Flip ID card (click / tap / keyboard)
   - Element table: family filters + tile detail readout
   - Work accordion (hover / click)
   - Journey cards (tap to reveal on touch)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Flip ID card ---------- */
  var card = document.getElementById("idCard");
  if (card) {
    var flip = function () { card.classList.toggle("flipped"); };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  }

  /* ---------- Element table + inspector ---------- */
  var grid = document.getElementById("elementGrid");
  var inspector = document.getElementById("elementInspector");
  if (grid && inspector) {
    var symEl = document.getElementById("insSymbol");
    var nameEl = document.getElementById("insName");
    var famEl = document.getElementById("insFamily");
    var noteEl = document.getElementById("insNote");
    var builtWrap = document.getElementById("insBuilt");
    var linksEl = document.getElementById("insLinks");
    var tiles = Array.prototype.slice.call(grid.querySelectorAll(".element-tile"));

    var FAMILY_LABELS = {
      "languages": "Languages",
      "data-ml": "Data & ML",
      "engineering": "Engineering",
      "bi-viz": "BI & Viz"
    };
    var PROJECTS = {
      "ecommerce": { name: "E-Commerce Analysis System", url: "https://github.com/Krunal2003/ecommerce-analysis-system" },
      "opioid": { name: "Opioid Pipeline Analysis", url: "https://github.com/Krunal2003/opioid-pipeline-analysis" },
      "spam": { name: "SMS Spam Detection", url: "https://github.com/Krunal2003/SMS-Spam-Detection" },
      "dbt311": { name: "NYC 311 dbt Pipeline", url: "https://github.com/Krunal2003/de-project-1-civic-311" },
      "rl": { name: "RL: Mastering Atari Pong", url: "https://github.com/Krunal2003/RL-Pong-DQN-PPO-A2C" },
      "btc": { name: "Bitcoin Price Predictor", url: "https://github.com/Krunal2003/bitcoin-price-predictor" }
    };
    var BUILT_WITH = {
      "Python": ["ecommerce", "opioid", "spam", "rl"],
      "SQL": ["dbt311", "opioid"],
      "Pandas": ["ecommerce", "opioid", "spam"],
      "scikit-learn": ["ecommerce", "spam", "btc"],
      "Random Forest": ["btc"],
      "LLM evaluation": ["spam"],
      "FastAPI": ["ecommerce"],
      "React": ["ecommerce"],
      "Docker": ["ecommerce"],
      "dbt": ["dbt311"],
      "Groq API": ["ecommerce"],
      "ETL/ELT": ["dbt311", "opioid"],
      "Data warehousing": ["dbt311"],
      "Data cleaning": ["opioid", "spam"],
      "Tableau": ["opioid"],
      "Data visualization": ["opioid", "spam"]
    };

    var show = function (tile) {
      tiles.forEach(function (t) { t.classList.remove("selected"); });
      tile.classList.add("selected");
      var sym = tile.querySelector(".element-symbol");
      var fam = tile.getAttribute("data-family");
      var name = tile.getAttribute("data-name");
      symEl.textContent = sym ? sym.textContent : name.slice(0, 2);
      nameEl.textContent = name;
      famEl.textContent = FAMILY_LABELS[fam] || fam;
      noteEl.textContent = tile.getAttribute("data-note") || "";
      var built = BUILT_WITH[name] || [];
      linksEl.innerHTML = "";
      built.forEach(function (key) {
        var p = PROJECTS[key];
        if (!p) return;
        var a = document.createElement("a");
        a.href = p.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "inspector-link";
        var label = document.createElement("span");
        label.textContent = p.name;
        var arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "\u2197";
        a.appendChild(label);
        a.appendChild(arrow);
        linksEl.appendChild(a);
      });
      builtWrap.style.display = built.length ? "" : "none";
    };

    tiles.forEach(function (tile) {
      tile.addEventListener("mouseenter", function () { show(tile); });
      tile.addEventListener("click", function () { show(tile); });
      tile.addEventListener("focus", function () { show(tile); });
    });
    if (tiles.length) show(tiles[0]);

    var btns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var fam = btn.getAttribute("data-family");
        tiles.forEach(function (t) {
          t.classList.toggle("dimmed", fam !== "all" && t.getAttribute("data-family") !== fam);
        });
      });
    });
  }

  /* ---------- Work accordion ---------- */
  var accordion = document.getElementById("workAccordion");
  if (accordion) {
    var panels = Array.prototype.slice.call(accordion.querySelectorAll(".work-panel"));
    var canHover = window.matchMedia("(hover: hover)").matches;
    var openPanel = function (panel) {
      panels.forEach(function (p) {
        var isOpen = p === panel;
        p.classList.toggle("open", isOpen);
        var rail = p.querySelector(".panel-rail");
        if (rail) rail.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    };
    panels.forEach(function (panel) {
      var rail = panel.querySelector(".panel-rail");
      if (rail) rail.addEventListener("click", function () { openPanel(panel); });
      if (canHover) panel.addEventListener("mouseenter", function () { openPanel(panel); });
    });
  }

  /* ---------- Journey cards (tap to reveal on touch) ---------- */
  var journey = document.getElementById("journeyTrack");
  if (journey) {
    var jcards = Array.prototype.slice.call(journey.querySelectorAll(".journey-card"));
    jcards.forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var was = card.classList.contains("revealed");
        jcards.forEach(function (c) { c.classList.remove("revealed"); });
        if (!was) card.classList.add("revealed");
      });
    });
  }
})();
