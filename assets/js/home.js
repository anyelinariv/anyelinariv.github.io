/* Home: B·M·W drop-in, hand trick, and the 3D dish carousel */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* B·M·W */
  var stage = document.getElementById("bmw-stage");
  if (stage) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { stage.classList.add("is-set"); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(stage);
    } else { stage.classList.add("is-set"); }
  }
  var hb = document.getElementById("hands-btn"), hands = document.getElementById("hands");
  if (hb && hands) {
    hb.addEventListener("click", function () {
      var on = hands.hidden;
      hands.hidden = !on;
      hands.classList.remove("is-on"); void hands.offsetWidth;
      hands.classList.toggle("is-on", on);
      hb.setAttribute("aria-pressed", String(on));
      hb.querySelector(".hb-text").textContent = on ? "Hide the hand trick" : "Show me the hand trick";
    });
  }

  /* 3D coverflow carousel */
  var car = document.getElementById("carousel");
  if (!car) return;
  var slides = Array.prototype.slice.call(car.querySelectorAll(".car-slide"));
  var dotsBox = document.getElementById("car-dots");
  var live = document.getElementById("car-live");
  var pauseBtn = document.getElementById("car-pause");
  var n = slides.length, cur = 0, timer = null, userPaused = reduce, hovering = false;

  var dots = slides.map(function (s, i) {
    var d = document.createElement("button");
    d.type = "button"; d.className = "car-dot";
    d.setAttribute("aria-label", "Show dish " + (i + 1) + ": " + s.querySelector("h3").textContent);
    d.addEventListener("click", function () { go(i, true); });
    dotsBox.appendChild(d);
    return d;
  });

  function layout() {
    var narrow = window.innerWidth < 640;
    slides.forEach(function (s, i) {
      var off = i - cur;
      if (off > n / 2) off -= n;
      if (off < -n / 2) off += n;
      var a = Math.abs(off);
      var x = off * (narrow ? 80 : 74);
      s.style.transform = "translateX(calc(-50% + " + x + "%)) translateZ(" + (-a * 160) + "px) rotateY(" + (-off * 38) + "deg)";
      s.style.opacity = a > (narrow ? 1 : 2) ? 0 : (1 - a * 0.33);
      s.style.zIndex = 10 - a;
      s.style.pointerEvents = a > 2 ? "none" : "auto";
      s.classList.toggle("is-current", off === 0);
      s.setAttribute("aria-hidden", String(off !== 0));
      s.dataset.off = off;
    });
    dots.forEach(function (d, i) { d.setAttribute("aria-current", i === cur ? "true" : "false"); });
  }
  function go(i, announce) {
    cur = (i + n) % n;
    layout();
    if (announce) live.textContent = slides[cur].getAttribute("aria-label");
    restart();
  }
  function restart() {
    clearInterval(timer);
    if (!userPaused && !hovering) timer = setInterval(function () { go(cur + 1, false); }, 4500);
  }
  function setPaused(p) {
    userPaused = p;
    car.classList.toggle("is-paused", p);
    pauseBtn.setAttribute("aria-label", p ? "Start automatic rotation" : "Pause automatic rotation");
    restart();
  }

  document.getElementById("car-prev").addEventListener("click", function () { go(cur - 1, true); });
  document.getElementById("car-next").addEventListener("click", function () { go(cur + 1, true); });
  pauseBtn.addEventListener("click", function () { setPaused(!userPaused); });
  slides.forEach(function (s, i) { s.addEventListener("click", function () { if (i !== cur) go(i, true); }); });
  car.addEventListener("mouseenter", function () { hovering = true; restart(); });
  car.addEventListener("mouseleave", function () { hovering = false; restart(); });
  car.addEventListener("focusin", function () { hovering = true; restart(); });
  car.addEventListener("focusout", function () { hovering = false; restart(); });
  document.getElementById("car-stage").addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1, true); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1, true); }
  });
  var sx = null;
  car.addEventListener("pointerdown", function (e) { sx = e.clientX; });
  car.addEventListener("pointerup", function (e) {
    if (sx == null) return;
    var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1), true);
  });
  window.addEventListener("resize", layout);
  setPaused(userPaused);
  layout();
})();
