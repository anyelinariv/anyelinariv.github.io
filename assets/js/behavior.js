/* The Meal page: scene player (tabs) and the topic swipe game */
(function () {
  "use strict";

  /* ---------- Scene player ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".ptab"));
  var scenes = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
  var bar = document.getElementById("ptab-bar");
  var count = document.getElementById("p-count");
  var prev = document.getElementById("p-prev"), next = document.getElementById("p-next");
  var current = 0;

  function show(i, focusTab, initial) {
    if (i < 0 || i >= scenes.length) return;
    var back = i < current;
    current = i;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle("is-done", k < i);
      scenes[k].hidden = !on;
      scenes[k].classList.toggle("is-active", on);
      scenes[k].classList.toggle("from-left", on && back);
    });
    bar.style.width = (86 * i / (scenes.length - 1)) + "%";
    count.textContent = "Scene " + (i + 1) + " of " + scenes.length;
    prev.disabled = i === 0;
    next.textContent = i === scenes.length - 1 ? "Start over ↺" : "Next →";
    if (focusTab) tabs[i].focus();
    if (!initial && history.replaceState) history.replaceState(null, "", "#" + scenes[i].id);
  }

  if (tabs.length) {
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { show(k); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); show((k + 1) % tabs.length, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); show((k - 1 + tabs.length) % tabs.length, true); }
        if (e.key === "Home") { e.preventDefault(); show(0, true); }
        if (e.key === "End") { e.preventDefault(); show(tabs.length - 1, true); }
      });
    });
    prev.addEventListener("click", function () { show(current - 1); });
    next.addEventListener("click", function () { show(current === scenes.length - 1 ? 0 : current + 1); });

    /* swipe on touch screens */
    var sx = null;
    scenes.forEach(function (sc) {
      sc.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
      sc.addEventListener("touchend", function (e) {
        if (sx == null) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
        sx = null;
      });
    });

    /* open the scene named in the URL (links from Home) */
    var start = 0;
    var hash = location.hash.slice(1);
    scenes.forEach(function (sc, k) { if (sc.id === hash) start = k; });
    show(start, false, true);
    if (hash && start >= 0 && document.getElementById(hash)) {
      setTimeout(function () { document.getElementById("player").scrollIntoView(); }, 50);
    }
  }

  /* ---------- Safe topic or skip it? ---------- */
  var TOPICS = [
    { t: "Your favorite class this semester", ok: true, why: "Safe and shows curiosity." },
    { t: "The election", ok: false, why: "Politics divides. Leave it off." },
    { t: "The company's newest project", ok: true, why: "Great: it shows you did your research." },
    { t: "How much the job pays", ok: false, why: "Save salary talk for a formal offer." },
    { t: "Hiking in Sabino Canyon", ok: true, why: "Light, local and easy to share." },
    { t: "Gossip about a professor", ok: false, why: "Gossip makes you look untrustworthy." },
    { t: "What the recruiter enjoys about the job", ok: true, why: "People love talking about their work." },
    { t: "Your roommate drama", ok: false, why: "Keep private matters private." }
  ];
  var stack = document.getElementById("swipe-stack");
  if (!stack) return;
  var fb = document.getElementById("swipe-fb"), scoreEl = document.getElementById("swipe-score");
  var yes = document.getElementById("swipe-yes"), no = document.getElementById("swipe-no");
  var idx = 0, score = 0, busy = false;

  function card(i, behind) {
    var c = document.createElement("div");
    c.className = "swipe-card" + (behind ? " behind" : "");
    c.innerHTML = '<span class="swipe-stamp yes">TALK</span><span class="swipe-stamp no">SKIP</span><span></span>';
    c.lastChild.textContent = TOPICS[i].t;
    return c;
  }
  function render() {
    stack.innerHTML = "";
    if (idx >= TOPICS.length) {
      var end = document.createElement("div");
      end.className = "swipe-card";
      end.textContent = score + " of " + TOPICS.length + " right!";
      stack.appendChild(end);
      yes.textContent = "Play again ↺"; no.hidden = true;
      if (score === TOPICS.length && window.celebrate) window.celebrate();
      return;
    }
    if (idx + 1 < TOPICS.length) stack.appendChild(card(idx + 1, true));
    var top = card(idx, false);
    stack.appendChild(top);
    attachDrag(top);
  }
  function answer(saysOk) {
    if (busy) return;
    if (idx >= TOPICS.length) { idx = 0; score = 0; no.hidden = false; yes.textContent = "Talk about it →"; fb.textContent = ""; fb.className = "swipe-fb"; scoreEl.textContent = "Score: 0 of 0"; render(); return; }
    busy = true;
    var top = stack.lastChild, item = TOPICS[idx];
    var right = saysOk === item.ok;
    if (right) score++;
    top.querySelector(saysOk ? ".yes" : ".no").style.opacity = 1;
    top.style.transform = "";
    top.classList.add(saysOk ? "go-right" : "go-left");
    fb.className = "swipe-fb " + (right ? "ok" : "no");
    fb.textContent = (right ? "✓ Right. " : "✗ Not quite. ") + item.why;
    idx++;
    scoreEl.textContent = "Score: " + score + " of " + idx;
    setTimeout(function () { busy = false; render(); }, 380);
  }
  function attachDrag(el) {
    var x0 = null, dx = 0;
    el.addEventListener("pointerdown", function (e) { x0 = e.clientX; dx = 0; el.setPointerCapture(e.pointerId); el.style.transition = "none"; });
    el.addEventListener("pointermove", function (e) {
      if (x0 == null) return;
      dx = e.clientX - x0;
      el.style.transform = "translateX(" + dx + "px) rotate(" + dx / 12 + "deg)";
      el.querySelector(".yes").style.opacity = Math.max(0, dx / 100);
      el.querySelector(".no").style.opacity = Math.max(0, -dx / 100);
    });
    function up() {
      if (x0 == null) return;
      x0 = null; el.style.transition = "";
      if (Math.abs(dx) > 90) answer(dx > 0);
      else { el.style.transform = ""; el.querySelector(".yes").style.opacity = 0; el.querySelector(".no").style.opacity = 0; }
    }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }
  yes.addEventListener("click", function () { answer(true); });
  no.addEventListener("click", function () { answer(false); });
  document.getElementById("swiper").addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") answer(true);
    if (e.key === "ArrowLeft") answer(false);
  });
  render();
})();
