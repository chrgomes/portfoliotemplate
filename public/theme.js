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
  var saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {
    /* storage blocked: follow the system */
  }
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
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f7fa' : '#080b12');
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
      try {
        if (saved) localStorage.setItem(KEY, saved);
        else localStorage.removeItem(KEY);
      } catch (e) {
        /* the choice lasts for this page only */
      }
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
