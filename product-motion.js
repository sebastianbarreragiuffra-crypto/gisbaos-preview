/* Producto: tabs Agencia/Cliente + narrativa de GISBA Pulse (una sola vez). */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Hero: tabs accesibles con cambio de perspectiva ----- */
  var seg = document.querySelector('.pr-seg');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-pr-tab]'));
  var states = Array.prototype.slice.call(document.querySelectorAll('[data-pr-state]'));
  var stage = document.getElementById('pr-stage');
  var status = document.getElementById('pr-status');
  var timer = null;
  var labels = { agency: 'Vista para tu agencia seleccionada.', client: 'Vista para tu cliente seleccionada.' };

  function show(el) {
    el.hidden = false;
    el.classList.remove('pr-out', 'pr-in');
    if (reduce) return;
    void el.offsetWidth;
    el.classList.add('pr-in');
  }

  function select(name, focus, announce) {
    tabs.forEach(function (t) {
      var on = t.dataset.prTab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    if (seg) seg.dataset.active = name;
    if (stage) stage.setAttribute('aria-labelledby', 'pr-tab-' + name);
    if (status && announce) status.textContent = labels[name];

    var target = states.filter(function (el) { return el.dataset.prState === name; })[0];
    if (!target) return;
    clearTimeout(timer);
    if (!target.hidden && !target.classList.contains('pr-out')) return;

    var leaving = states.filter(function (el) { return el !== target && !el.hidden; });
    if (!target.hidden) target.classList.remove('pr-out');
    if (reduce || !leaving.length) {
      leaving.forEach(function (el) { el.hidden = true; el.classList.remove('pr-out', 'pr-in'); });
      if (target.hidden) show(target);
      return;
    }
    leaving.forEach(function (el) { el.classList.add('pr-out'); });
    timer = setTimeout(function () {
      leaving.forEach(function (el) { el.hidden = true; el.classList.remove('pr-out', 'pr-in'); });
      if (target.hidden) show(target);
    }, 120);
  }

  if (tabs.length) {
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.dataset.prTab, false, true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (k === 'ArrowLeft' || k === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === 'Home') next = tabs[0];
        else if (k === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next.dataset.prTab, true, true); }
      });
    });
  }

  /* ----- GISBA Pulse: se reproduce una vez al entrar ----- */
  if (reduce || !('IntersectionObserver' in window)) return;
  function playOnce(section, trigger, threshold, cls) {
    if (!section || !trigger) return;
    section.classList.add('pr-seq');
    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      section.classList.add(cls);
      io.disconnect();
    }, { threshold: threshold, rootMargin: '0px 0px -12% 0px' });
    io.observe(trigger);
  }
  var pulse = document.getElementById('gisba-pulse');
  playOnce(pulse, pulse && pulse.querySelector('.pr-pulse-head'), 0.4, 'is-played');
  playOnce(pulse, pulse && pulse.querySelector('.pr-steps'), 0.25, 'is-steps');
})();
