/* Shared behavior: mobile nav, scroll reveals, flip cards, footer year */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---- Scroll-triggered reveals ---- */
  var revealables = document.querySelectorAll(".reveal, .reveal-stagger, .draw, .seating-svg, .rail-anim");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Flip cards ---- */
  document.querySelectorAll(".flip-btn").forEach(function (btn) {
    var front = btn.querySelector(".flip-front");
    var back = btn.querySelector(".flip-back");
    if (back) back.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      var flipped = btn.classList.toggle("is-flipped");
      btn.setAttribute("aria-pressed", String(flipped));
      if (front) front.setAttribute("aria-hidden", String(flipped));
      if (back) back.setAttribute("aria-hidden", String(!flipped));
    });
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

/* ===== v2: motion & interaction helpers ===== */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Scroll progress bar */
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 3D tilt with glare */
  if (finePointer && !reduce) {
    document.querySelectorAll(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add("is-tilting");
        el.style.transform = "perspective(800px) rotateX(" + ((0.5 - y) * 8) + "deg) rotateY(" + ((x - 0.5) * 10) + "deg) translateY(-4px)";
        el.style.setProperty("--gx", x * 100 + "%");
        el.style.setProperty("--gy", y * 100 + "%");
      });
      el.addEventListener("pointerleave", function () { el.classList.remove("is-tilting"); el.style.transform = ""; });
    });
  }

  /* Count-up numbers */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var before = el.getAttribute("data-before") || "", after = el.getAttribute("data-after") || "";
    if (reduce) { el.textContent = before + to + after; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var k = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = before + Math.round(to * eased) + after;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Rotating words */
  document.querySelectorAll(".rotator").forEach(function (rot) {
    var words = rot.children, i = 0;
    words[0].classList.add("on");
    if (reduce || words.length < 2) return;
    setInterval(function () {
      words[i].classList.remove("on");
      i = (i + 1) % words.length;
      words[i].classList.add("on");
    }, 2400);
  });

  /* Hero parallax (layers move with the pointer) */
  var hero = document.querySelector("[data-parallax]");
  if (hero && finePointer && !reduce) {
    var layers = hero.querySelectorAll("[data-depth]");
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute("data-depth"));
        l.style.transform = "translate(" + (x * d) + "px," + (y * d) + "px)";
      });
    });
    hero.addEventListener("pointerleave", function () { layers.forEach(function (l) { l.style.transform = ""; }); });
  }

  /* Expandable tiles: title + icon visible, text on demand */
  var tileId = 0;
  document.querySelectorAll(".tiles .rule-card").forEach(function (card) {
    var h = card.querySelector("h3"), p = card.querySelector("p");
    if (!h || !p) return;
    var id = "tile-" + (++tileId);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "tile-toggle";
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", id);
    btn.innerHTML = "<span>" + h.innerHTML + '</span><span class="tile-plus" aria-hidden="true">+</span>';
    h.innerHTML = ""; h.appendChild(btn);
    var body = document.createElement("div"); body.className = "tile-body"; body.id = id;
    var inner = document.createElement("div");
    var extras = Array.prototype.slice.call(p.parentNode.children).filter(function (n) { return n !== h; });
    extras.forEach(function (n) { inner.appendChild(n); });
    body.appendChild(inner); h.parentNode.appendChild(body);
    function toggle() {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      body.classList.toggle("is-open", open);
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    card.addEventListener("click", function (e) { if (!e.target.closest("a, button")) toggle(); });
  });

  /* Confetti burst (exposed for games) */
  window.celebrate = function () {
    if (reduce) return;
    var c = document.createElement("canvas"); c.className = "confetti"; c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    var ctx = c.getContext("2d"), W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    var colors = ["#24493a", "#c28a2c", "#4a7560", "#f1e1b9", "#183a2d"];
    var parts = [];
    for (var i = 0; i < 140; i++) parts.push({
      x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.45, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      s: Math.random() * 6 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length]
    });
    var t = 0;
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (++t < 150) requestAnimationFrame(frame); else c.remove();
    })();
  };
})();
