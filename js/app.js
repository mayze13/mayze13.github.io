(function () {
  var DARK_COLOR  = '#e8dcc8';
  var LIGHT_COLOR = '#0d1224';
  var isDark = true;

  /* ── Particles ── */

  function destroyParticles() {
    if (window.pJSDom && window.pJSDom.length) {
      window.pJSDom.forEach(function (d) { d.pJS.fn.vendors.destroypJS(); });
      window.pJSDom = [];
    }
  }

  function initParticles() {
    particlesJS('particles-right-bg', window.getParticlesConfig(isDark ? DARK_COLOR : LIGHT_COLOR));
  }

  /* ── Theme ── */

  function applyTheme(dark) {
    isDark = dark;
    document.body.classList.toggle('light', !dark);
    var btn   = document.getElementById('theme-toggle');
    var label = btn.querySelector('.theme-label');
    var sun   = btn.querySelector('.icon-sun');
    var moon  = btn.querySelector('.icon-moon');
    if (dark) {
      label.textContent  = 'light';
      sun.style.display  = '';
      moon.style.display = 'none';
    } else {
      label.textContent  = 'dark';
      sun.style.display  = 'none';
      moon.style.display = '';
    }
    destroyParticles();
    initParticles();
  }

  /* ── Tabs ── */

  function initTabs() {
    var buttons = document.querySelectorAll('.tab-btn');
    var panels  = document.querySelectorAll('.tab-panel');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p)  { p.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        document.getElementById('main-content').scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ── Glimmer ── */

  function initGlimmer() {
    document.querySelectorAll('.tab-btn, .dl-btn, .theme-btn').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--gx', ((e.clientX - r.left)  / r.width  * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', ((e.clientY - r.top)   / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ── Typewriter ── */

  var CORE = [
    "Hi, I'm James.",
    "Welcome to my website."
  ];

  var rotating = [];

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function shuffled(arr) {
    return arr.slice().sort(function () { return Math.random() - 0.5; });
  }

  async function loadSentences() {
    try {
      var text = await (await fetch('sentences.md')).text();
      rotating = text.split('\n')
        .map(function (l) { return l.trim(); })
        .filter(function (l) { return l.length > 0 && l[0] !== '#'; });
    } catch (_) {
      rotating = [];
    }
  }

  function nudgeParticles(cx, cy) {
    if (!window.pJSDom || !window.pJSDom.length) return;
    var pJS = window.pJSDom[0].pJS;
    var arr = pJS && pJS.particles && pJS.particles.array;
    if (!arr) return;
    var R     = 120;  /* repulsion radius px          */
    var S     = 0.28; /* impulse per character        */
    var MAX_V = 1.8;  /* velocity cap (~3x normal)    */
    for (var i = 0; i < arr.length; i++) {
      var p  = arr[i];
      var dx = p.x - cx;
      var dy = p.y - cy;
      var d2 = dx * dx + dy * dy;
      if (d2 < R * R && d2 > 1) {
        var d   = Math.sqrt(d2);
        var mag = (1 - d / R) * S;
        p.vx += (dx / d) * mag;
        p.vy += (dy / d) * mag;
        /* clamp so particles can't reach runaway speeds */
        var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_V) { p.vx = p.vx / spd * MAX_V; p.vy = p.vy / spd * MAX_V; }
      }
    }
  }

  function getWrapPos(wrapEl) {
    var r = wrapEl.getBoundingClientRect();
    return { x: r.left, y: r.top };
  }

  function getSplitX() {
    var line = document.getElementById('split-line');
    if (line) {
      var px = parseFloat(line.style.left);
      if (!isNaN(px)) return px;
      px = parseFloat(window.getComputedStyle(line).left);
      if (!isNaN(px)) return px;
    }
    return window.innerWidth * 0.52;
  }

  function randomRightPos() {
    var vw      = window.innerWidth;
    var vh      = window.innerHeight;
    var splitX  = getSplitX();
    var zone    = vw - splitX;
    return {
      x: splitX + zone * 0.05 + Math.random() * (zone * 0.75),
      y: vh * 0.12 + Math.random() * (vh * 0.68)
    };
  }

  function spawnTrailDot(x, y) {
    var dot = document.createElement('div');
    dot.className = 'tw-trail';
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
    document.body.appendChild(dot);
    setTimeout(function () { dot.style.opacity = '0'; }, 20);
    setTimeout(function () { dot.remove(); }, 540);
  }

  function launchComet(wrapEl, cursorEl, toPos) {
    return new Promise(function (resolve) {
      var fromPos = getWrapPos(wrapEl);

      cursorEl.classList.add('tw-cursor--hidden');

      var comet = document.createElement('div');
      comet.className = 'tw-comet';
      comet.style.left = fromPos.x + 'px';
      comet.style.top  = fromPos.y + 'px';
      document.body.appendChild(comet);

      /* quadratic bezier arc — control point pulled perpendicular to path + upward */
      var dx   = toPos.x - fromPos.x;
      var dy   = toPos.y - fromPos.y;
      var midX = (fromPos.x + toPos.x) / 2;
      var midY = (fromPos.y + toPos.y) / 2;
      var cpX  = midX - dy * 0.3;
      var cpY  = midY + dx * 0.3 - (70 + Math.random() * 70);

      var DURATION  = 1500;
      var startTime = null;
      var lastTrail = 0;

      requestAnimationFrame(function tick(ts) {
        if (!startTime) startTime = ts;
        var t = Math.min((ts - startTime) / DURATION, 1);
        var e = 1 - Math.pow(1 - t, 2.5); /* ease-out */

        var x = (1-e)*(1-e)*fromPos.x + 2*(1-e)*e*cpX + e*e*toPos.x;
        var y = (1-e)*(1-e)*fromPos.y + 2*(1-e)*e*cpY + e*e*toPos.y;

        comet.style.left = x + 'px';
        comet.style.top  = y + 'px';

        if (ts - lastTrail > 50) {
          spawnTrailDot(x, y);
          lastTrail = ts;
        }

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          comet.remove();
          wrapEl.style.left = toPos.x + 'px';
          wrapEl.style.top  = toPos.y + 'px';
          cursorEl.classList.remove('tw-cursor--hidden');
          resolve();
        }
      });
    });
  }

  async function typeOut(el, s, speed) {
    var wrap = document.getElementById('typewriter-wrap');
    for (var c = 0; c <= s.length; c++) {
      el.textContent = s.slice(0, c);
      if (wrap) {
        var r = wrap.getBoundingClientRect();
        nudgeParticles(r.left + el.offsetWidth, r.top + r.height * 0.5);
      }
      await sleep(speed);
    }
  }

  async function eraseOut(el, s, speed) {
    for (var c = s.length; c >= 0; c--) {
      el.textContent = s.slice(0, c);
      await sleep(speed);
    }
  }

  async function runTypewriter(wrapEl, textEl, cursorEl) {
    var TYPE   = 44;
    var ERASE  = 22;
    var LINGER = 2100; /* hold time before erasing */
    var PAUSE  = 380;  /* gap between core sentences */
    var ARRIVE = 2000; /* wait after comet lands before typing */
    var BREAK  = 5000; /* silence between loops — cursor blinks through */

    /* anchor to pixel coords from the CSS starting position */
    await sleep(120);
    var r = wrapEl.getBoundingClientRect();
    wrapEl.style.left  = r.left + 'px';
    wrapEl.style.top   = r.top  + 'px';
    wrapEl._pinned = true;

    while (true) {
      /* ── core sentences (typed in place, no movement between them) ── */
      for (var i = 0; i < CORE.length; i++) {
        await typeOut(textEl, CORE[i], TYPE);
        await sleep(LINGER);
        await eraseOut(textEl, CORE[i], ERASE);
        if (i < CORE.length - 1) await sleep(PAUSE);
      }

      /* comet fires after the 3rd core sentence → random spot */
      await sleep(200);
      await launchComet(wrapEl, cursorEl, randomRightPos());
      await sleep(ARRIVE);

      /* ── random sentences (comet after every one, including the last) ── */
      var picks = shuffled(rotating).slice(0, 4);
      for (var j = 0; j < picks.length; j++) {
        await typeOut(textEl, picks[j], TYPE);
        await sleep(LINGER);
        await eraseOut(textEl, picks[j], ERASE);
        await sleep(200);
        await launchComet(wrapEl, cursorEl, randomRightPos());
        await sleep(ARRIVE);
      }

      /* ── 5-second break — cursor stays visible and blinks ── */
      await sleep(BREAK);
    }
  }

  /* ── Particle mode switcher ── */

  function initParticleModes() {
    document.querySelectorAll('.pmode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.dataset.mode;
        if (window.pJSDom && window.pJSDom.length) {
          window.pJSDom[0].pJS.interactivity.events.onhover.mode = mode;
        }
        document.querySelectorAll('.pmode-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
      });
    });
  }

  /* ── Split layout: keep line + particles after content ── */

  function updateSplitLayout() {
    var panels    = document.getElementById('tab-panels');
    var tabNav    = document.getElementById('tab-nav');
    var line      = document.getElementById('split-line');
    var particles = document.getElementById('particles-right-bg');
    if (!panels || !line) return;

    /* Restore any inline max-width overrides from previous ratio logic */
    panels.style.maxWidth = '';
    if (tabNav) tabNav.style.maxWidth = '';

    /* Lock the line 32px after the actual right edge of the content boxes.
       getBoundingClientRect() reads the true DOM layout in every browser. */
    var x = Math.round(panels.getBoundingClientRect().right + 32);

    line.style.left = x + 'px';

    if (particles) {
      var clip = 'inset(0 0 0 ' + x + 'px)';
      particles.style.webkitClipPath = clip;
      particles.style.clipPath       = clip;
    }

    var tw = document.getElementById('typewriter-wrap');
    if (tw && !tw._pinned) {
      tw.style.left     = (x + 24) + 'px';
      tw.style.maxWidth = Math.max(window.innerWidth - x - 32, 80) + 'px';
    }
  }

  function initCardSketches() {
    document.querySelectorAll('.card-sketch path').forEach(function(path) {
      path.style.setProperty('--sketch-len', path.getTotalLength());
    });
  }

  function initTypewriter() {
    var wrapEl   = document.getElementById('typewriter-wrap');
    var textEl   = document.getElementById('typewriter-text');
    var cursorEl = document.querySelector('.tw-cursor');
    if (!textEl || !wrapEl || !cursorEl) return;
    loadSentences().then(function () {
      runTypewriter(wrapEl, textEl, cursorEl);
    });
  }

  /* ── Boot ── */

  document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initTabs();
    initGlimmer();
    initTypewriter();
    initParticleModes();
    initCardSketches();

    /* Run after first paint so getBoundingClientRect has real values */
    requestAnimationFrame(function () { setTimeout(updateSplitLayout, 60); });

    var _resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(updateSplitLayout, 80);
    });

    document.getElementById('theme-toggle').addEventListener('click', function () {
      applyTheme(!isDark);
    });
  });

})();
