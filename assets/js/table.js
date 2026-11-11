/* Table page: hotspot explorer, utensil mini-game, rest/finished demo */
(function () {
  "use strict";

  /* ---------- 1. Place-setting explorer ---------- */
  var ITEMS = [
    { id: "placecard", name: "Place card",
      tip: "At formal meals the host assigns seats. Find your card, stay there and never swap cards. Wait for the host to sit before you do." },
    { id: "napkin", name: "Napkin",
      tip: "Unfold it on your lap as soon as you sit. Dab your lips, don't wipe. Stepping away? Leave it on your chair. Finished? Lay it loosely to the left of your plate." },
    { id: "saladfork", name: "Salad fork",
      tip: "The outermost fork is for the first course that needs one, often the salad. Work from the outside in: each new course uses the next utensil toward the plate." },
    { id: "dinnerfork", name: "Dinner fork",
      tip: "The larger fork next to the plate is for the main course. The fork carries food to your mouth; the knife never does." },
    { id: "plate", name: "Dinner plate",
      tip: "Your meal is served here. Keep salt, sauce and butter on the plate beside your food, not on the rim. Small bites only." },
    { id: "knife", name: "Dinner knife",
      tip: "Blade faces the plate. Hold it lightly, not by the very end. It only cuts and pushes food onto the fork. It never goes into your mouth." },
    { id: "soupspoon", name: "Soup spoon",
      tip: "Outermost on the right because soup usually comes first. Spoon away from you, sip from the side, and never slurp or blow on hot soup." },
    { id: "bread", name: "Bread plate and butter knife",
      tip: "Upper left (B in B·M·W). Break off one bite-sized piece at a time, butter it, then eat it. Keep crumbs over your plate." },
    { id: "dessert", name: "Dessert spoon and fork",
      tip: "Above the plate, used last. The spoon handle points right, the fork handle points left, so each is easy to pick up with the matching hand." },
    { id: "water", name: "Water glass",
      tip: "Upper right, above the knife (W in B·M·W). Hold glasses near the base and stemware by the stem. Dab your lips before you drink." },
    { id: "wine", name: "Wine glasses",
      tip: "To the right of the water. Alcohol is optional: follow your host's lead and stop at one. Sparkling water is always a fine choice." }
  ];

  var svg = document.getElementById("setting-svg");
  var hotspots = document.querySelectorAll(".hotspot");
  var stepEl = document.getElementById("info-step");
  var titleEl = document.getElementById("info-title");
  var textEl = document.getElementById("info-text");
  var prevBtn = document.getElementById("prev-item");
  var nextBtn = document.getElementById("next-item");
  var dots = document.getElementById("dots");
  var legend = document.getElementById("legend");
  var seenCount = document.getElementById("seen-count");
  var current = -1;
  var seen = {};

  if (svg && stepEl) {
    ITEMS.forEach(function (item, i) {
      var dot = document.createElement("span");
      dots.appendChild(dot);
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.name;
      b.addEventListener("click", function () { show(i); document.getElementById("stage").scrollIntoView({ block: "center" }); });
      li.appendChild(b);
      legend.appendChild(li);
    });

    function show(i) {
      current = i;
      var item = ITEMS[i];
      seen[item.id] = true;
      stepEl.textContent = (i + 1) + " of " + ITEMS.length;
      titleEl.textContent = item.name;
      textEl.textContent = item.tip;
      svg.classList.add("has-active");
      svg.querySelectorAll(".item").forEach(function (g) {
        g.classList.toggle("is-active", g.getAttribute("data-item") === item.id);
      });
      hotspots.forEach(function (h) {
        var on = h.getAttribute("data-item") === item.id;
        h.setAttribute("aria-pressed", String(on));
        if (seen[h.getAttribute("data-item")]) h.classList.add("is-seen");
      });
      var n = Object.keys(seen).length;
      Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle("on", !!seen[ITEMS[k].id]); });
      seenCount.textContent = "You have explored " + n + " of " + ITEMS.length + " items.";
      prevBtn.disabled = i === 0;
      nextBtn.textContent = i === ITEMS.length - 1 ? "Back to start ↺" : "Next →";
    }

    hotspots.forEach(function (h) {
      h.setAttribute("aria-pressed", "false");
      h.addEventListener("click", function () {
        var id = h.getAttribute("data-item");
        for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) show(i);
      });
    });
    prevBtn.disabled = true;
    prevBtn.addEventListener("click", function () { if (current > 0) show(current - 1); });
    nextBtn.addEventListener("click", function () { show(current >= ITEMS.length - 1 ? 0 : current + 1); });
  }

  /* ---------- 2. "Which one do I use first?" game ---------- */
  var ROUNDS = [
    { course: "Soup is served", prompt: "Which utensil do you pick up?", answer: "soup",
      why: "The soup spoon sits farthest out on the right because soup comes first." },
    { course: "The salad arrives", prompt: "Which fork do you use?", answer: "salad",
      why: "Outside in: the outer fork belongs to the earlier course." },
    { course: "Main course: roast chicken", prompt: "Which fork now?", answer: "dinnerfork",
      why: "The dinner fork is the one left next to the plate." },
    { course: "Time to cut the chicken", prompt: "Which utensil cuts?", answer: "knife",
      why: "The dinner knife cuts; the fork then carries the bite to your mouth." },
    { course: "A warm roll and butter", prompt: "What spreads the butter?", answer: "butter",
      why: "The small butter knife rests on the bread plate, upper left." },
    { course: "Chocolate mousse for dessert", prompt: "Which utensil?", answer: "dessert",
      why: "Dessert utensils wait above the plate until the last course." }
  ];
  var board = document.getElementById("game-board");
  if (board) {
    var roundEl = document.getElementById("game-round");
    var courseEl = document.getElementById("game-course");
    var promptEl = document.getElementById("game-prompt");
    var fb = document.getElementById("game-feedback");
    var scoreEl = document.getElementById("game-score");
    var restart = document.getElementById("game-restart");
    var buttons = board.querySelectorAll(".utensil");
    var r = 0, score = 0, firstTry = true;
    var ICON_OK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    var ICON_NO = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

    function setRound() {
      var rd = ROUNDS[r];
      firstTry = true;
      roundEl.textContent = "Course " + (r + 1) + " of " + ROUNDS.length;
      courseEl.textContent = rd.course;
      promptEl.textContent = rd.prompt;
    }
    function reset() {
      r = 0; score = 0;
      buttons.forEach(function (b) { b.disabled = false; b.classList.remove("is-right", "is-wrong"); });
      fb.innerHTML = ""; fb.className = "feedback";
      scoreEl.textContent = "Score: 0";
      restart.hidden = true;
      setRound();
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        if (r >= ROUNDS.length) return;
        var rd = ROUNDS[r];
        b.classList.remove("is-wrong");
        if (b.getAttribute("data-u") === rd.answer) {
          if (firstTry) score++;
          b.classList.add("is-right");
          b.disabled = true;           /* the server clears it with the course */
          fb.className = "feedback ok";
          fb.innerHTML = ICON_OK + "<span>Correct. " + rd.why + "</span>";
          scoreEl.textContent = "Score: " + score + " of " + (r + 1);
          r++;
          if (r < ROUNDS.length) {
            setTimeout(setRound, 600);
          } else {
            roundEl.textContent = "Meal complete";
            courseEl.textContent = score === ROUNDS.length ? "Perfect service!" : "Well done.";
            promptEl.textContent = "You got " + score + " of " + ROUNDS.length + " right on the first try.";
            restart.hidden = false;
          }
        } else {
          firstTry = false;
          void b.offsetWidth;
          b.classList.add("is-wrong");
          fb.className = "feedback no";
          fb.innerHTML = ICON_NO + "<span>Not quite. Start with the utensil farthest from the plate for this course.</span>";
        }
      });
    });
    restart.addEventListener("click", function () { reset(); board.querySelector(".utensil").focus(); });
    reset();
  }

  /* ---------- 3. Pausing vs. finished ---------- */
  var rest = document.getElementById("rest-svg");
  if (rest) {
    var restText = document.getElementById("rest-text");
    var restTitle = document.getElementById("rest-svg-title");
    var COPY = {
      pause: ["<strong>Pausing:</strong> rest the fork and knife crossed on the plate, never on the tablecloth.",
              "Plate with fork and knife crossed in the pause position"],
      done: ["<strong>Finished:</strong> place the fork and knife side by side, handles toward four o'clock. The server knows to clear.",
             "Plate with fork and knife side by side, angled toward four o'clock, in the finished position"]
    };
    document.querySelectorAll("[data-rest]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-rest");
        document.querySelectorAll("[data-rest]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        rest.classList.toggle("is-pause", mode === "pause");
        rest.classList.toggle("is-done", mode === "done");
        restText.innerHTML = COPY[mode][0];
        restTitle.textContent = COPY[mode][1];
      });
    });
  }
})();
