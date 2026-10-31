/*
 * Progressive enhancement for the static build. Every feature here is optional:
 * without JavaScript all content is visible and every link works.
 * The Angular app implements the same behaviours in its components.
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ---------- Scroll reveals ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    root.classList.add('js-reveal');
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealer.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) {
      // Anything already on screen is shown immediately — no waiting to read.
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add('is-visible');
      else revealer.observe(el);
    });
  }

  /* ---------- Navigation ---------- */
  var nav = $('#site-nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = $('.nav-toggle');
  var sheet = $('#nav-sheet');
  function setMenu(open) {
    if (!toggle || !sheet) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sheet.hidden = !open;
    doc.body.classList.toggle('nav-open', open);
    if (open) {
      var first = $('a', sheet);
      if (first) first.focus();
    }
  }
  if (toggle && sheet) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', sheet).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
      // Keep focus inside the open menu.
      if (e.key === 'Tab' && toggle.getAttribute('aria-expanded') === 'true') {
        var items = [toggle].concat($$('a', sheet));
        var i = items.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) {
      if (m.matches) setMenu(false);
    });
  }

  /* ---------- Scroll spy (home nav and case-study contents) ---------- */
  function spy(links, attr) {
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute(attr)] = a; });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (current) current.removeAttribute('aria-current');
          current = map[e.target.id];
          if (current) current.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) io.observe(el);
    });
  }
  if ($('.hero')) spy($$('[data-spy]'), 'data-spy');
  spy($$('[data-toc]'), 'data-toc');

  /* ---------- Hero parallax ---------- */
  var visual = $('[data-parallax]');
  if (visual && finePointer && !reduceMotion) {
    var raf = 0;
    window.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        visual.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        visual.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    }, { passive: true });
  }

  /* ---------- Local clock ---------- */
  var clock = $('[data-clock]');
  if (clock) {
    var out = $('time', clock);
    try {
      var fmt = new Intl.DateTimeFormat('en-CA', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: clock.getAttribute('data-clock'),
      });
      var tick = function () { out.textContent = fmt.format(new Date()); };
      tick();
      setInterval(tick, 15000);
    } catch (err) {
      clock.hidden = true;
    }
  }

  /* ---------- Expertise tabs + skill details ---------- */
  var skills = $('[data-skills]');
  if (skills) {
    var tabs = $$('[role="tab"]', skills);
    var panels = $$('[role="tabpanel"]', skills);
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
      if (focus) tab.focus();
    };
    select(tabs[0], false);
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });

    $$('.skill', skills).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.closest('[role="tabpanel"]');
        $$('.skill', panel).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var detail = $('.skill-detail', panel);
        detail.textContent = '';
        var strong = doc.createElement('strong');
        strong.textContent = btn.textContent;
        detail.appendChild(strong);
        var note = btn.getAttribute('data-note');
        if (note) {
          var p = doc.createElement('p');
          p.textContent = note;
          detail.appendChild(p);
        }
        var used = [];
        try { used = JSON.parse(btn.getAttribute('data-used') || '[]'); } catch (err) { used = []; }
        if (used.length) {
          var u = doc.createElement('p');
          u.className = 'used mono';
          u.appendChild(doc.createTextNode('Used in '));
          used.forEach(function (proj, k) {
            var a = doc.createElement('a');
            a.href = proj.href;
            a.textContent = proj.title;
            u.appendChild(a);
            if (k < used.length - 1) u.appendChild(doc.createTextNode(', '));
          });
          detail.appendChild(u);
        }
      });
    });
  }

  /* ---------- Process timeline ----------
   * Click or hover a step to select it. With motion allowed, the line also fills as the
   * visitor scrolls, a dot rides its tip, and steps (and their glyphs) light up as reached. */
  // Own scope, so its helper names can't clash with the rest of this file.
  (function () {
  var process = $('[data-process]');
  if (process) {
    root.classList.add('js-process');
    var wrap = process.parentElement;
    var steps = $$('.step', process);
    var setStep = function (n) {
      process.style.setProperty('--active', String(Math.max(n, 0)));
      steps.forEach(function (s, i) {
        s.classList.toggle('is-active', i === n);
        s.classList.toggle('is-done', i < n);
        $('.step-btn', s).setAttribute('aria-pressed', String(i === n));
      });
    };

    if (reduceMotion) {
      $$('.step-btn', process).forEach(function (b) {
        var n = Number(b.getAttribute('data-step'));
        b.addEventListener('click', function () { setStep(n); });
        if (finePointer) b.addEventListener('mouseenter', function () { setStep(n); });
      });
      setStep(0);
    } else {
      root.classList.add('js-process-anim');
      var vertical = window.matchMedia('(max-width: 900px)');
      var nums = steps.map(function (s) { return $('.step-num', s); });
      var centers = [];
      var manual = null;
      var manualY = 0;
      var queued = false;

      // Where each numbered circle sits along the line, relative to the list.
      var measure = function () {
        var r = process.getBoundingClientRect();
        centers = nums.map(function (n) {
          var b = n.getBoundingClientRect();
          return vertical.matches ? b.top + b.height / 2 - r.top : b.left + b.width / 2 - r.left;
        });
        wrap.style.setProperty('--p-start', centers[0] + 'px');
        wrap.style.setProperty('--p-end', centers[centers.length - 1] + 'px');
      };

      var update = function () {
        queued = false;
        var first = centers[0];
        var last = centers[centers.length - 1];
        var pos;
        var active = -1;
        if (manual !== null) {
          pos = centers[manual];
          active = manual;
        } else {
          var r = process.getBoundingClientRect();
          var vh = window.innerHeight;
          // Desktop: fills while the list moves from 85% to 35% of the screen height.
          // Phones (steps stacked): the fill follows a point 60% down the screen.
          var p = vertical.matches ? (vh * 0.6 - (r.top + first)) / (last - first) : (vh * 0.85 - r.top) / (vh * 0.5);
          p = Math.max(0, Math.min(1, p));
          pos = first + (last - first) * p;
          if (p > 0) {
            centers.forEach(function (c, i) { if (pos >= c - 1) active = i; });
          }
        }
        wrap.style.setProperty('--p-pos', pos + 'px');
        wrap.style.setProperty('--p-dot', active >= 0 ? '1' : '0');
        setStep(active);
      };
      var queue = function () {
        if (!queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      };

      var select = function (n) {
        manual = n;
        manualY = window.scrollY;
        queue();
      };
      $$('.step-btn', process).forEach(function (b) {
        var n = Number(b.getAttribute('data-step'));
        b.addEventListener('click', function () { select(n); });
        if (finePointer) b.addEventListener('mouseenter', function () { select(n); });
      });

      window.addEventListener('scroll', function () {
        // Scrolling on hands control back to the scroll position.
        if (manual !== null && Math.abs(window.scrollY - manualY) > 60) manual = null;
        queue();
      }, { passive: true });
      var remeasure = function () { measure(); queue(); };
      window.addEventListener('resize', remeasure);
      window.addEventListener('load', remeasure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
      measure();
      update();
    }
  }
  })();

  /* ---------- Copy email ---------- */
  $$('[data-copy]').forEach(function (btn) {
    var feedback = btn.parentElement.querySelector('.copy-feedback');
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function (ok) {
        if (feedback) feedback.textContent = ok ? 'Copied' : 'Press Ctrl+C to copy';
        setTimeout(function () { if (feedback) feedback.textContent = ''; }, 2400);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
  });

  /* ---------- Pointer follower + card tilt (fine pointers only) ---------- */
  var ring = $('.cursor-ring');
  if (ring && finePointer && !reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      ring.style.setProperty('--x', e.clientX + 'px');
      ring.style.setProperty('--y', e.clientY + 'px');
    }, { passive: true });
    $$('[data-cursor]').forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        ring.textContent = el.getAttribute('data-cursor');
        ring.classList.add('is-active');
      });
      el.addEventListener('pointerleave', function () { ring.classList.remove('is-active'); });
    });
    $$('.card .card-media').forEach(function (m) {
      m.addEventListener('pointermove', function (e) {
        var r = m.getBoundingClientRect();
        m.style.setProperty('--rx', (((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2) + 'deg');
        m.style.setProperty('--ry', (((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2) + 'deg');
      });
      m.addEventListener('pointerleave', function () {
        m.style.setProperty('--rx', '0deg');
        m.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Spam check (proof of work, self-hosted) ----------
   * contact.php hands out a signed challenge; the browser finds the number that produces
   * the challenge hash. Cheap for one visitor, costly for a bot sending thousands.
   * Same logic as src/lib/proof-of-work.ts; payload format matches ALTCHA. */
  function sha256Hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  async function solveChallenge(url) {
    if (!window.crypto || !crypto.subtle) throw new Error('The spam check needs a secure (https) connection.');
    var res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) throw new Error('The spam check couldn’t start. Reload the page and try again.');
    var ch = await res.json();
    for (var n = 0; n <= ch.maxnumber; n++) {
      if ((await sha256Hex(ch.salt + n)) === ch.challenge) {
        return btoa(JSON.stringify({ algorithm: ch.algorithm, challenge: ch.challenge, number: n, salt: ch.salt, signature: ch.signature }));
      }
    }
    throw new Error('The spam check couldn’t finish. Reload the page and try again.');
  }

  /* ---------- Contact form ---------- */
  var form = $('[data-contact-form]');
  if (form) {
    // Start the spam check when the visitor first touches the form, so it's ready by the time they send.
    var challengeUrl = form.getAttribute('data-challenge');
    var proof = null;
    var startProof = function () {
      if (challengeUrl && !proof) {
        proof = solveChallenge(challengeUrl);
        proof.catch(function () {}); // reported on submit
      }
      return proof;
    };
    form.addEventListener('focusin', startProof);
    var started = form.querySelector('[name="started"]');
    if (started) started.value = String(Date.now());
    var status = $('.form-status', form);
    var submit = $('button[type="submit"]', form);
    var label = submit ? $('span', submit) : null;
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address like name@example.com.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'; },
    };
    var check = function (name) {
      var input = form.elements[name];
      var msg = rules[name](input.value);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      doc.getElementById(input.id + '-err').textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach(function (name) {
      form.elements[name].addEventListener('blur', function () {
        if (form.elements[name].value) check(name);
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.hasAttribute('data-preview')) return;
      var ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        status.className = 'form-status is-error';
        status.textContent = 'Check the highlighted fields.';
        return;
      }
      submit.disabled = true;
      var spinner = doc.createElement('span');
      spinner.className = 'spinner';
      spinner.setAttribute('aria-hidden', 'true');
      submit.insertBefore(spinner, submit.firstChild);
      label.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';
      (challengeUrl ? startProof() : Promise.resolve(''))
        .then(function (payload) {
          form.elements.altcha.value = payload;
          return fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        }, function (err) {
          return Promise.reject({ spamCheck: err });
        })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) { return { res: res, data: data }; });
        })
        .then(function (r) {
          if (r.res.ok && r.data.ok) {
            form.reset();
            if (started) started.value = String(Date.now());
            status.className = 'form-status is-success';
            status.textContent = 'Message sent. I’ll reply to the email address you gave.';
          } else {
            status.className = 'form-status is-error';
            status.textContent = (r.data && r.data.error) || 'The message couldn’t be sent. Try again, or email me directly.';
          }
        })
        .catch(function (err) {
          status.className = 'form-status is-error';
          status.textContent = err && err.spamCheck
            ? err.spamCheck.message
            : 'The message couldn’t be sent — check your connection and try again.';
        })
        .then(function () {
          // Every challenge works once: get a fresh one for the next attempt.
          proof = null;
          form.elements.altcha.value = '';
          submit.disabled = false;
          spinner.remove();
          label.textContent = 'Send message';
        });
    });
  }

  /* ---------- Theme toggle (theme.js does the work) ---------- */
  var themeBtn = $('[data-theme-toggle]');
  if (themeBtn && window.portfolioTheme) {
    window.portfolioTheme.onChange(function (theme, followsSystem) {
      var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.title = label + (followsSystem ? ' (now matching your system setting)' : '');
    });
    themeBtn.addEventListener('click', function () { window.portfolioTheme.toggle(); });
  }

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
