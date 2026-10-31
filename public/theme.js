/*
 * Light/dark theme. Loaded in <head> before the page paints, so there's no flash.
 *
 * By default the site follows the visitor's system setting, live. Clicking the toggle
 * switches to the other theme and remembers it; switching back to whatever the system
 * uses forgets the choice, so the site follows the system again.
 */
(function () {
  'use strict';
  var KEY = 'theme';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: light)');
  var listeners = [];
  // Where the choice is kept: local storage normally. When the browser blocks storage
  // (some private modes, strict privacy settings, embedded previews), fall back to the
  // tab's window.name, which lasts while the visitor moves between pages in that tab.
  var TAB_PREFIX = 'pf-theme:';
  var readSaved = function () {
    try {
      var v = localStorage.getItem(KEY);
      if (v) return v;
    } catch (e) {
      /* storage blocked */
    }
    return window.name.indexOf(TAB_PREFIX) === 0 ? window.name.slice(TAB_PREFIX.length) : null;
  };
  var writeSaved = function (value) {
    var stored = false;
    try {
      if (value) localStorage.setItem(KEY, value);
      else localStorage.removeItem(KEY);
      stored = true;
    } catch (e) {
      /* storage blocked */
    }
    if (value && !stored) window.name = TAB_PREFIX + value;
    else if (window.name.indexOf(TAB_PREFIX) === 0) window.name = '';
  };
  var saved = readSaved();
  if (saved !== 'light' && saved !== 'dark') saved = null;

  var system = function () {
    return media.matches ? 'light' : 'dark';
  };
  var current = function () {
    return saved || system();
  };
  var apply = function () {
    var theme = current();
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f7fa' : '#101a33');
    listeners.forEach(function (fn) {
      fn(theme, !saved);
    });
  };

  apply();
  var onSystemChange = function () {
    if (!saved) apply();
  };
  if (media.addEventListener) media.addEventListener('change', onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange); // Safari 13 and older

  window.portfolioTheme = {
    current: current,
    followsSystem: function () {
      return !saved;
    },
    toggle: function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      saved = next === system() ? null : next;
      writeSaved(saved);
      apply();
      return next;
    },
    /** Called with (theme, followsSystem) now and whenever it changes. */
    onChange: function (fn) {
      listeners.push(fn);
      fn(current(), !saved);
    },
  };
})();
