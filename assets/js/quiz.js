/* Le Service: the 10-question quiz as a dinner-service mini-game */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var QUESTIONS = [
    { type: "Multiple choice", q: "Where is your bread plate?",
      options: ["Upper left, above the forks", "Upper right, above the knife", "Directly above the dinner plate", "Wherever there is room"],
      answer: 0, why: "B·M·W: bread on the left, meal in the middle, water on the right." },
    { type: "Multiple choice", q: "Soup is the first course. Which utensil do you use?",
      options: ["The spoon farthest to the right", "The fork farthest to the left", "The spoon above the plate", "The utensil closest to the plate"],
      answer: 0, why: "Work from the outside in. Soup comes first, so its spoon sits farthest out." },
    { type: "True or false", q: "Start eating as soon as your plate arrives so your food doesn't get cold.",
      options: ["True", "False"], answer: 1, why: "Wait until everyone is served and the host begins." },
    { type: "Multiple choice", q: "When should you arrive at a business meal?",
      options: ["Exactly on time", "5–10 minutes early", "30 minutes early", "A few minutes late"],
      answer: 1, why: "A few minutes early shows respect without rushing the host." },
    { type: "Multiple choice", q: "Which is the best choice to order?",
      options: ["The most expensive steak", "Spaghetti with tomato sauce", "A mid-priced chicken or fish dish", "Nothing, just a drink"],
      answer: 2, why: "Mid-priced and easy to eat keeps the focus on the conversation." },
    { type: "True or false", q: "Your phone can sit face up on the table if you're waiting for a call.",
      options: ["True", "False"], answer: 1, why: "Silence it and keep it out of sight. Step away if a call is urgent." },
    { type: "Multiple choice", q: "The salt is at the far end of the table. What do you do?",
      options: ["Reach across to get it", "Stand up and walk over", "Ask the person nearest to pass it", "Do without"],
      answer: 2, why: "Carreño's rule still holds: never reach across people." },
    { type: "Multiple choice", q: "How do you tell the server you've finished?",
      options: ["Fork and knife side by side on the plate", "Fork and knife crossed on the plate", "Push the plate away", "Put your napkin on the plate"],
      answer: 0, why: "Side by side means finished. Crossed means you're only pausing." },
    { type: "True or false", q: "According to Carreño, the knife may carry food to your mouth once you're done cutting.",
      options: ["True", "False"], answer: 1, why: "The knife only cuts and serves. The fork carries food." },
    { type: "Short answer", q: "When should you send a thank-you note after a business meal?",
      short: true, pattern: /(24|twenty[-\s]?four|one day|a day|next day|same day|tomorrow)/i,
      why: "Within 24 hours, mentioning something specific from the conversation." }
  ];
  var TIME = 20;

  var $ = function (id) { return document.getElementById(id); };
  var start = $("svc-start"), play = $("svc-play"), end = $("svc-end");
  if (!start) return;
  var plates = $("svc-plates"), shortForm = $("svc-short"), input = $("svc-input");
  var fb = $("svc-fb"), nextBtn = $("svc-next"), lid = $("svc-lid"), card = $("svc-card"), pop = $("svc-pop");
  var wax = $("wax"), timeEl = $("hud-time"), candle = $("hud-candle");
  var relaxed = $("svc-relaxed");
  var st, timer = null;

  function best() { try { return +localStorage.getItem("svc-best") || 0; } catch (e) { return 0; } }
  function saveBest(v) { try { localStorage.setItem("svc-best", v); } catch (e) {} }
  function showBest() { var b = best(); $("svc-best").textContent = b ? "Best score on this device: " + b : ""; }
  showBest();

  function screen(el) {
    [start, play, end].forEach(function (s) { s.hidden = s !== el; });
  }

  var dots = $("svc-dots");
  function begin() {
    st = { i: 0, score: 0, streak: 0, correct: 0, log: [], relaxed: relaxed.checked };
    dots.innerHTML = "";
    QUESTIONS.forEach(function () { dots.appendChild(document.createElement("span")); });
    candle.classList.toggle("is-off", st.relaxed);
    screen(play);
    $("hud-score").textContent = "0";
    serve();
  }

  function serve() {
    var item = QUESTIONS[st.i];
    st.locked = false;
    $("hud-course").textContent = st.i + 1;
    $("svc-type").textContent = item.type;
    $("svc-q").textContent = item.q;
    fb.innerHTML = ""; fb.className = "svc-fb";
    nextBtn.hidden = true;
    Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle("cur", k === st.i); });
    updStreak();

    plates.innerHTML = "";
    shortForm.hidden = !item.short;
    plates.hidden = !!item.short;
    if (item.short) {
      input.value = ""; input.disabled = false;
      shortForm.querySelector("button").disabled = false;
    } else {
      plates.classList.toggle("is-tf", item.options.length === 2);
      item.options.forEach(function (opt, k) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "plate";
        b.style.setProperty("--d", (k * 90) + "ms");
        b.innerHTML = '<span class="plate-key">' + "ABCD"[k] + '</span><span class="plate-text"></span><span class="plate-mark" aria-hidden="true"></span>';
        b.querySelector(".plate-text").textContent = opt;
        b.addEventListener("click", function () { answer(k === item.answer, b); });
        plates.appendChild(b);
      });
    }

    /* lift the cloche */
    lid.classList.remove("is-up"); card.classList.remove("is-in");
    void lid.offsetWidth;
    lid.classList.add("is-up"); card.classList.add("is-in");
    setTimeout(function () { (item.short ? input : $("svc-q")).focus({ preventScroll: true }); }, reduce ? 0 : 450);

    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    st.t = TIME;
    paintTimer();
    if (st.relaxed) return;
    var t0 = Date.now();
    timer = setInterval(function () {
      st.t = Math.max(0, TIME - (Date.now() - t0) / 1000);
      paintTimer();
      if (st.t <= 0) { clearInterval(timer); answer(false, null, true); }
    }, 100);
  }
  function paintTimer() {
    var k = st.t / TIME;
    wax.setAttribute("height", Math.max(4, 58 * k));
    wax.setAttribute("y", 26 + 58 * (1 - k));
    candle.querySelector(".flame").setAttribute("transform", "translate(0 " + (58 * (1 - k)) + ")");
    timeEl.textContent = st.relaxed ? "∞" : Math.ceil(st.t);
    candle.classList.toggle("is-low", !st.relaxed && st.t < 6);
  }

  function updStreak() {
    var s = $("hud-streak");
    s.textContent = st.streak >= 2 ? "×" + mult().toFixed(1) + " streak" : "";
    s.classList.toggle("on", st.streak >= 2);
  }
  function mult() { return Math.min(2.5, 1 + 0.5 * Math.max(0, st.streak - 1)); }

  function answer(ok, btn, timedOut) {
    if (st.locked) return;
    st.locked = true;
    clearInterval(timer);
    var item = QUESTIONS[st.i];
    var pts = 0;
    if (ok) {
      st.streak++; st.correct++;
      pts = Math.round((100 + (st.relaxed ? 25 : Math.round(50 * st.t / TIME))) * mult());
      st.score += pts;
    } else {
      st.streak = 0;
    }
    st.log.push(ok);
    dots.children[st.i].className = ok ? "ok" : "no";

    if (!item.short) {
      var all = plates.querySelectorAll(".plate");
      all.forEach(function (p, k) {
        p.disabled = true;
        if (k === item.answer) { p.classList.add("is-right"); p.querySelector(".plate-mark").textContent = "✓"; }
      });
      if (btn && !ok) { btn.classList.add("is-wrong"); btn.querySelector(".plate-mark").textContent = "✗"; }
    } else {
      input.disabled = true; shortForm.querySelector("button").disabled = true;
    }

    fb.className = "svc-fb " + (ok ? "ok" : "no");
    var verdict = ok ? "✓ Très bien!" : timedOut ? "✗ The candle burned out." : "✗ Faux pas.";
    fb.innerHTML = "<strong></strong> <span></span>";
    fb.firstChild.textContent = verdict;
    fb.lastChild.textContent = item.why;

    if (ok) floatPoints("+" + pts, btn);
    countTo($("hud-score"), st.score);
    updStreak();

    nextBtn.hidden = false;
    nextBtn.querySelector("svg").previousSibling.textContent = st.i === QUESTIONS.length - 1 ? "See the verdict " : "Next course ";
    setTimeout(function () { nextBtn.focus({ preventScroll: true }); }, 60);
  }

  function floatPoints(text, btn) {
    if (reduce) return;
    pop.textContent = text;
    var stage = pop.parentNode.getBoundingClientRect();
    var r = btn ? btn.getBoundingClientRect() : input.getBoundingClientRect();
    pop.style.left = (r.left - stage.left + r.width / 2) + "px";
    pop.style.top = (r.top - stage.top) + "px";
    pop.classList.remove("go"); void pop.offsetWidth; pop.classList.add("go");
  }

  function countTo(el, to) {
    var from = +el.textContent || 0;
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    (function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 600);
      el.textContent = Math.round(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  function finish() {
    screen(end);
    var c = st.correct;
    var stars = c >= 9 ? 3 : c >= 7 ? 2 : c >= 5 ? 1 : 0;
    var titles = ["The kitchen needs another rehearsal.", "One star. A promising debut.", "Two stars. Worth the reservation.", "Three stars. Welcome to the chef's table."];
    $("end-title").textContent = titles[stars];
    $("end-correct").textContent = c;
    var sc = $("end-score"); sc.textContent = "0"; countTo(sc, st.score);
    var svgs = $("svc-stars").querySelectorAll("svg");
    svgs.forEach(function (s, k) { s.classList.remove("on"); s.style.setProperty("--d", (300 + k * 350) + "ms"); });
    void end.offsetWidth;
    svgs.forEach(function (s, k) { if (k < stars) s.classList.add("on"); });
    $("svc-stars").setAttribute("aria-label", stars + " of 3 stars");
    var b = best();
    if (st.score > b) { saveBest(st.score); $("end-best").textContent = "New best score!"; }
    else $("end-best").textContent = "Best score on this device: " + b;
    var recap = $("svc-recap"); recap.innerHTML = "";
    QUESTIONS.forEach(function (q, k) {
      var li = document.createElement("li");
      li.className = st.log[k] ? "ok" : "no";
      li.textContent = (st.log[k] ? "✓ " : "✗ ") + q.q;
      recap.appendChild(li);
    });
    if (stars >= 2 && window.celebrate) window.celebrate();
    $("end-title").setAttribute("tabindex", "-1");
    $("end-title").focus({ preventScroll: true });
    showBest();
  }

  $("svc-go").addEventListener("click", begin);
  $("svc-again").addEventListener("click", function () { screen(start); $("svc-go").focus(); });
  nextBtn.addEventListener("click", function () {
    st.i++;
    if (st.i >= QUESTIONS.length) finish(); else serve();
  });
  shortForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!input.value.trim()) { input.focus(); return; }
    answer(QUESTIONS[st.i].pattern.test(input.value), null);
  });
  document.addEventListener("keydown", function (e) {
    if (play.hidden || e.target === input) return;
    var k = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 }[e.key.toLowerCase()];
    if (k != null && !st.locked) {
      var p = plates.querySelectorAll(".plate")[k];
      if (p) { e.preventDefault(); p.click(); }
    }
  });

  /* printable list helpers */
  var printBtn = $("print-btn"), details = $("survey-details");
  if (printBtn) printBtn.addEventListener("click", function () { if (details) details.open = true; window.print(); });
  window.addEventListener("beforeprint", function () { if (details) details.open = true; });
  if (details && location.hash === "#survey-list") details.open = true;
  document.querySelectorAll('a[href="#survey-list"]').forEach(function (a) { a.addEventListener("click", function () { if (details) details.open = true; }); });
})();
