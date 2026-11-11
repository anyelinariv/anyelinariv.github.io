/* Meal timeline: highlight the step currently on screen in the sticky rail */
(function () {
  "use strict";
  var links = document.querySelectorAll("#step-rail a");
  var steps = document.querySelectorAll(".step");
  if (!links.length || !("IntersectionObserver" in window)) return;

  function setCurrent(id) {
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-current", on);
      if (on) {
        a.setAttribute("aria-current", "step");
        /* keep the active pill visible on narrow screens */
        var rail = a.closest(".rail");
        if (rail && rail.scrollWidth > rail.clientWidth) {
          rail.scrollLeft = a.offsetLeft - rail.clientWidth / 2 + a.offsetWidth / 2;
        }
      } else {
        a.removeAttribute("aria-current");
      }
    });
    steps.forEach(function (s) { s.classList.toggle("is-current", s.id === id); });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  steps.forEach(function (s) { io.observe(s); });
})();
