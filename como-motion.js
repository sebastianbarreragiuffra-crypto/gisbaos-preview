/* Cómo funciona: motion de producto (una sola reproducción por sección, sin librerías) */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stages = Array.prototype.slice.call(document.querySelectorAll('[data-stage]'));
  if (!stages.length) return;

  function showAll(stage) {
    Array.prototype.forEach.call(stage.querySelectorAll('[data-s]'), function (el) { el.classList.add('on'); });
    stage.classList.add('is-in', 'is-done');
    stage.setAttribute('data-step', '9');
    stage.dispatchEvent(new CustomEvent('cx:done'));
  }

  function play(stage) {
    if (stage.__played) return;
    stage.__played = true;
    if (reduce) { showAll(stage); return; }
    var steps = (stage.getAttribute('data-steps') || '100').split(',').map(Number);
    var mobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    stage.classList.add('is-in');
    var scale = mobile ? 0.8 : 1;
    if (stage.querySelector('.cx-sg-scan')) window.setTimeout(function () { scan(stage); }, Math.round(350 * scale));
    steps.forEach(function (ms, i) {
      var n = i + 1;
      window.setTimeout(function () {
        stage.setAttribute('data-step', String(n));
        Array.prototype.forEach.call(stage.querySelectorAll('[data-s="' + n + '"]'), function (el) { el.classList.add('on'); });
        if (n === 2 && stage.querySelector('.cx-sg')) boost(stage);
        if (n === steps.length) {
          if (stage.getAttribute('data-causal') === 'coordina') { afterEntry(stage, function () { causal(stage, mobile); }); return; }
          window.setTimeout(function () { finish(stage); }, mobile ? 250 : 450);
        }
      }, Math.round(ms * scale));
    });
  }

  function finish(stage) {
    Array.prototype.forEach.call(stage.querySelectorAll('[data-s]'), function (el) { el.classList.add('on'); });
    stage.classList.add('is-done');
    stage.dispatchEvent(new CustomEvent('cx:done'));
  }

  /* halo: un solo refuerzo breve de intensidad */
  function boost(stage) {
    stage.classList.add('boost');
    window.setTimeout(function () { stage.classList.remove('boost'); }, 380);
  }

  /* 02: banda suave que recorre la lista una sola vez */
  function scan(stage) {
    var list = stage.querySelector('.cx-sg-list'), band = stage.querySelector('.cx-sg-scan');
    if (!list || !band || !band.animate) return;
    var h = list.getBoundingClientRect().height, bh = band.getBoundingClientRect().height || 56;
    band.animate([
      { transform: 'translateY(-' + bh + 'px)', opacity: 0 },
      { opacity: 1, offset: 0.2 },
      { opacity: 1, offset: 0.75 },
      { transform: 'translateY(' + (h - bh * 0.4) + 'px)', opacity: 0 }
    ], { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'none' });
  }

  /* 04: el pulso nace justo cuando termina la entrada del mensaje del cliente */
  function afterEntry(stage, cb) {
    var msg = stage.querySelector('.cx-msg.in'), fired = false;
    var go = function () { if (fired) return; fired = true; stage.setAttribute('data-step', '3'); cb(); };
    if (!msg) { go(); return; }
    msg.addEventListener('transitionend', function h(e) { if (e.target !== msg) return; msg.removeEventListener('transitionend', h); go(); });
    window.setTimeout(go, 700); /* respaldo */
  }

  /* 04: un mismo evento: mensaje del cliente -> pulso -> GISBA vincula, registra y define el siguiente paso; al final, la respuesta de la agencia */
  function causal(stage, mobile) {
    var msg = stage.querySelector('.cx-msg.in'), target = stage.querySelector('.cx-gp-head');
    var on = function (n) {
      stage.setAttribute('data-step', String(n));
      Array.prototype.forEach.call(stage.querySelectorAll('[data-s="' + n + '"]'), function (el) { el.classList.add('on'); });
    };
    var chain = function () {
      on(4); boost(stage);
      window.setTimeout(function () { on(5); }, mobile ? 380 : 480);
      window.setTimeout(function () { on(6); }, mobile ? 760 : 960);
      window.setTimeout(function () { on(7); }, mobile ? 1100 : 1400);
      window.setTimeout(function () { finish(stage); }, mobile ? 1450 : 1800);
    };
    if (!msg || !target || !msg.animate) { chain(); return; }
    var g = stage.getBoundingClientRect(), a = msg.getBoundingClientRect(), b = target.getBoundingClientRect();
    var horizontal = b.left > a.right - 8;
    var x0 = (horizontal ? a.right : a.left + a.width / 2) - g.left, y0 = (horizontal ? a.top + a.height / 2 : a.bottom) - g.top;
    var x1 = (horizontal ? b.left + 22 : b.left + 30) - g.left, y1 = (horizontal ? b.top + b.height / 2 : b.top + b.height / 2) - g.top;
    var dot = document.createElement('i');
    dot.className = 'cx-pulse'; dot.setAttribute('aria-hidden', 'true');
    stage.appendChild(dot);
    var anim = dot.animate([
      { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.5)', opacity: 0 },
      { transform: 'translate(' + (x0 + (x1 - x0) * 0.12) + 'px,' + (y0 + (y1 - y0) * 0.12) + 'px) scale(1)', opacity: 1, offset: 0.12 },
      { transform: 'translate(' + (x0 + (x1 - x0) * 0.92) + 'px,' + (y0 + (y1 - y0) * 0.92) + 'px) scale(1)', opacity: 1, offset: 0.92 },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.5)', opacity: 0 }
    ], { duration: mobile ? 550 : 750, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    var arrived = false;
    var arrive = function () { if (arrived) return; arrived = true; if (dot.parentNode) dot.parentNode.removeChild(dot); chain(); };
    if (anim.finished && anim.finished.then) anim.finished.then(arrive, arrive); else anim.onfinish = arrive;
    window.setTimeout(arrive, (mobile ? 550 : 750) + 400); /* respaldo si la animación no llega a terminar (p. ej. pestaña en segundo plano) */
  }

  if (!('IntersectionObserver' in window)) { stages.forEach(showAll); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { play(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
    stages.forEach(function (st) { io.observe(st); });
  }

  /* ---- 02 · Detecta: foco manual opcional entre señales ---- */
  var D = {
    ladera: { av: 'L', bg: '#0B1028', name: 'Ladera', meta: 'E-commerce · Moda', chip: 'Alta prioridad', cc: 'hi', title: 'Caída en conversiones', desc: 'Se detectó una disminución significativa en las conversiones de esta campaña en los últimos 3 días.', num: '-28%', numl: 'en conversiones vs. 3 días anteriores', why: 'El CPA aumentó 42% y el volumen de conversiones cayó, afectando el ROAS de la campaña.', reco: 'Revisar segmentación y creatividades. Hay una oportunidad de recuperar rendimiento con audiencias similares.' },
    nova: { av: 'N', bg: '#1c1f3a', name: 'Nova Studio', meta: 'E-commerce · Moda', chip: 'Media', cc: 'md', title: 'Aumento en CPA', desc: 'El costo por resultado subió respecto al período anterior.', num: '', numl: '', why: 'Puede afectar la eficiencia de la inversión si se mantiene.', reco: 'Revisar audiencias y creatividades de la campaña.' },
    terramar: { av: 'T', bg: '#1e9bb8', name: 'Terramar', meta: 'Cuenta activa', chip: 'Oportunidad', cc: 'op', title: 'Oportunidad de presupuesto', desc: 'El rendimiento de la cuenta permite evaluar una mayor inversión.', num: '', numl: '', why: 'Hay margen para escalar con control.', reco: 'Evaluar un ajuste de presupuesto antes de decidir.' },
    boreal: { av: 'B', bg: '#0f4d2f', name: 'Boreal', meta: 'Cuenta activa', chip: 'Baja', cc: 'lo', title: 'Cambio en rendimiento', desc: 'Se observa una variación menor frente al período anterior.', num: '', numl: '', why: 'No requiere acción inmediata.', reco: 'Mantener seguimiento.' },
    vita: { av: 'V', bg: '#d9a98c', name: 'Vita', meta: 'Cuenta activa', chip: 'Baja', cc: 'lo', title: 'Variación en tráfico', desc: 'El tráfico muestra una variación frente al período anterior.', num: '', numl: '', why: 'No requiere acción inmediata.', reco: 'Mantener seguimiento.' }
  };
  var sg = document.querySelector('.cx-sg');
  if (sg) {
    var stage = sg.closest('[data-stage]');
    var rows = Array.prototype.slice.call(sg.querySelectorAll('.cx-sg-row'));
    var detail = sg.querySelector('.cx-sg-detail');
    var set = function (sel, txt) { var n = sg.querySelector('[data-d="' + sel + '"]'); if (n) n.textContent = txt; };
    var focusRow = function (row) {
      if (!stage.classList.contains('is-done')) return;
      var d = D[row.getAttribute('data-k')];
      if (!d || row.classList.contains('is-active')) return;
      rows.forEach(function (r) { var on = r === row; r.classList.toggle('is-active', on); r.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      detail.classList.add('swap');
      window.setTimeout(function () {
        var av = sg.querySelector('[data-d="av"]'); av.textContent = d.av; av.style.background = d.bg;
        set('name', d.name); set('meta', d.meta); set('title', d.title); set('desc', d.desc); set('why', d.why); set('reco', d.reco);
        var chip = sg.querySelector('[data-d="chip"]'); chip.textContent = d.chip; chip.className = 'cx-chip ' + d.cc;
        var num = sg.querySelector('.cx-sg-num'); num.style.display = d.num ? '' : 'none'; set('num', d.num); set('numl', d.numl);
        detail.classList.remove('swap');
      }, reduce ? 0 : 160);
    };
    rows.forEach(function (row) {
      row.addEventListener('click', function () { focusRow(row); });
      row.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) focusRow(row); });
      row.addEventListener('focus', function () { focusRow(row); });
    });
  }

  /* ---- 03 · Decide: solo una elección humana registra la decisión ---- */
  var dc = document.querySelector('.cx-dc');
  if (dc) {
    var opts = Array.prototype.slice.call(dc.querySelectorAll('.cx-opt'));
    var done = dc.querySelector('.cx-dc-done');
    var who = dc.querySelector('[data-d="who"]');
    var verb = { Aprobar: 'Aprobar', Ajustar: 'Ajustar', Descartar: 'Descartar' };
    opts.forEach(function (o) {
      o.addEventListener('click', function () {
        var c = o.getAttribute('data-choice');
        opts.forEach(function (x) { var on = x === o; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        dc.classList.add('has-choice');
        if (who) who.textContent = 'La agencia eligió: ' + verb[c] + '.';
        if (done && done.hidden) { done.hidden = false; if (!reduce) { done.classList.remove('cx-in'); void done.offsetWidth; done.classList.add('cx-in'); } }
      });
    });
  }
})();
