/* Self-scoring quiz with instant feedback */
(function () {
  "use strict";
  var QUESTIONS = [
    { type: "Multiple choice", q: "Where is your bread plate?",
      options: ["Upper left, above the forks", "Upper right, above the knife", "Directly above the dinner plate", "Wherever there is room"],
      answer: 0, why: "Think B·M·W: bread on the left, meal in the middle, water on the right." },
    { type: "Multiple choice", q: "Soup is the first course. Which utensil do you use?",
      options: ["The spoon farthest to the right", "The fork farthest to the left", "The spoon above the plate", "The utensil closest to the plate"],
      answer: 0, why: "Work from the outside in. The soup spoon sits on the far right because soup comes first." },
    { type: "True or false", q: "You should start eating as soon as your plate arrives so your food doesn't get cold.",
      options: ["True", "False"], answer: 1, why: "Wait until everyone is served and the host begins, unless the host invites you to start." },
    { type: "Multiple choice", q: "When should you arrive at a business meal?",
      options: ["Exactly on time", "5–10 minutes early", "30 minutes early", "A few minutes late, so the host is ready"],
      answer: 1, why: "A few minutes early shows respect without making the host rush." },
    { type: "Multiple choice", q: "Which is the best choice to order?",
      options: ["The most expensive steak", "Spaghetti with tomato sauce", "A mid-priced chicken or fish dish", "Nothing, just a drink"],
      answer: 2, why: "Mid-priced and easy to eat keeps attention on the conversation, not your plate." },
    { type: "True or false", q: "Keeping your phone face up on the table is fine if you're waiting for a call.",
      options: ["True", "False"], answer: 1, why: "Silence it and keep it out of sight. If a call is truly urgent, excuse yourself." },
    { type: "Multiple choice", q: "The salt is at the far end of the table. What do you do?",
      options: ["Reach across to get it", "Stand up and walk over", "Ask the person nearest to pass it", "Do without"],
      answer: 2, why: "Carreño's rule still holds: never reach across people; ask your neighbor or the server." },
    { type: "Multiple choice", q: "How do you show the server you have finished eating?",
      options: ["Fork and knife side by side on the plate", "Fork and knife crossed on the plate", "Push the plate away", "Put your napkin on the plate"],
      answer: 0, why: "Side by side means finished. Crossed means you are only pausing." },
    { type: "True or false", q: "According to Carreño, you may use the knife to bring food to your mouth once you've finished cutting.",
      options: ["True", "False"], answer: 1, why: "The knife only cuts and serves. The fork carries food to your mouth." },
    { type: "Short answer", q: "When should you send a thank-you note after a business meal, and what should it mention?",
      short: true, pattern: /(24|twenty[-\s]?four|one day|a day|next day|same day|tomorrow)/i,
      model: "Within 24 hours. Thank the host for their time and mention something specific from the conversation." }
  ];

  var form = document.getElementById("quiz");
  if (!form) return;
  var scoreNum = document.getElementById("score-num");
  var scoreBar = document.getElementById("score-bar");
  var answeredEl = document.getElementById("answered");
  var result = document.getElementById("result");
  var progress = document.getElementById("quiz-progress");
  var state;

  function showQ(i) {
    var qs = form.querySelectorAll(".q");
    qs.forEach(function (q, k) { q.classList.toggle("is-current", k === i); });
    Array.prototype.forEach.call(progress.children, function (d, k) { d.classList.toggle("cur", k === i && !d.classList.contains("ok") && !d.classList.contains("no")); });
    var focusable = qs[i] && qs[i].querySelector("input, textarea");
    if (focusable && state.started) focusable.focus({ preventScroll: true });
    state.started = true;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function build() {
    state = { answered: 0, correct: 0, started: false };
    form.innerHTML = "";
    progress.innerHTML = "";
    QUESTIONS.forEach(function () { progress.appendChild(document.createElement("span")); });
    QUESTIONS.forEach(function (item, i) {
      var fs = el("fieldset", "q");
      var lg = el("legend");
      lg.appendChild(el("span", "q-type", "Question " + (i + 1) + " · " + item.type));
      lg.appendChild(document.createTextNode(item.q));
      fs.appendChild(lg);
      var fb = el("div", "q-feedback");
      fb.setAttribute("aria-live", "polite");

      if (item.short) {
        var id = "q" + i + "-text";
        var label = el("label", "visually-hidden", "Your answer");
        label.setAttribute("for", id);
        var ta = el("textarea");
        ta.id = id;
        ta.placeholder = "Type your answer…";
        var btn = el("button", "btn btn--small", "Check my answer");
        btn.type = "button";
        btn.style.marginTop = ".75rem";
        btn.addEventListener("click", function () {
          if (!ta.value.trim()) { ta.focus(); return; }
          var ok = item.pattern.test(ta.value);
          ta.readOnly = true;
          btn.disabled = true;
          finish(ok, fb, ok ? "Good: you named the 24-hour window." : "The key is timing: send it within 24 hours.",
                 "Model answer: " + item.model);
        });
        fs.appendChild(label); fs.appendChild(ta); fs.appendChild(btn);
      } else {
        var wrap = el("div", "q-options");
        item.options.forEach(function (opt, k) {
          var lab = el("label", "opt");
          var input = el("input");
          input.type = "radio"; input.name = "q" + i; input.value = k;
          var mark = el("span", "mark");
          lab.appendChild(input);
          lab.appendChild(el("span", null, opt));
          lab.appendChild(mark);
          wrap.appendChild(lab);
          input.addEventListener("change", function () {
            var ok = k === item.answer;
            wrap.querySelectorAll("input").forEach(function (inp) { inp.disabled = true; });
            var labels = wrap.querySelectorAll(".opt");
            labels[item.answer].classList.add("is-correct");
            labels[item.answer].querySelector(".mark").textContent = "✓ Correct answer";
            if (!ok) { lab.classList.add("is-wrong"); mark.textContent = "✗ Your answer"; }
            finish(ok, fb, ok ? "Correct." : "Not quite.", item.why);
          });
        });
        fs.appendChild(wrap);
      }
      fs.appendChild(fb);
      if (i < QUESTIONS.length - 1) {
        var nx = el("button", "btn btn--small q-next", "Next question →");
        nx.type = "button"; nx.hidden = true;
        nx.addEventListener("click", function () { showQ(i + 1); });
        fs.appendChild(nx);
      }
      fs.dataset.index = i;
      form.appendChild(fs);
    });
    update();
    result.hidden = true;
    showQ(0);
  }

  function finish(ok, fb, verdict, detail) {
    state.answered++;
    var fs = fb.closest(".q"), i = +fs.dataset.index;
    progress.children[i].className = ok ? "ok" : "no";
    fs.querySelectorAll(".opt").forEach(function (o) { o.classList.add("is-locked"); });
    var nx = fs.querySelector(".q-next");
    if (nx) { nx.hidden = false; setTimeout(function () { nx.focus({ preventScroll: true }); }, 50); }
    if (ok) state.correct++;
    fb.className = "q-feedback " + (ok ? "ok" : "no");
    fb.innerHTML = "";
    fb.appendChild(el("span", "verdict", (ok ? "✓ " : "✗ ") + verdict + " "));
    fb.appendChild(document.createTextNode(detail));
    update();
    if (state.answered === QUESTIONS.length) showResult();
  }

  function update() {
    scoreNum.textContent = state.correct;
    scoreBar.style.width = (state.correct / QUESTIONS.length * 100) + "%";
    answeredEl.textContent = state.answered + " of " + QUESTIONS.length + " answered";
  }

  function showResult() {
    var s = state.correct;
    var title, text;
    if (s >= 9) { title = "Ready for the head table"; text = "You scored " + s + " out of 10. Book that recruiter lunch with confidence."; }
    else if (s >= 6) { title = "Almost there"; text = "You scored " + s + " out of 10. Review the questions you missed, then try again."; }
    else { title = "Time for a second helping"; text = "You scored " + s + " out of 10. Explore the place setting and the meal timeline, then retake the quiz."; }
    document.getElementById("result-title").textContent = title;
    document.getElementById("result-text").textContent = text;
    result.hidden = false;
    var fg = document.getElementById("ring-fg");
    fg.style.strokeDashoffset = 314.16;
    document.getElementById("ring-text").textContent = s + "/10";
    requestAnimationFrame(function () { requestAnimationFrame(function () { fg.style.strokeDashoffset = 314.16 * (1 - s / 10); }); });
    if (s >= 9 && window.celebrate) window.celebrate();
    result.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }

  document.getElementById("retake").addEventListener("click", function () {
    build();
    form.scrollIntoView();
    var first = form.querySelector("input");
    if (first) first.focus();
  });

  var printBtn = document.getElementById("print-btn");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

  build();
})();
