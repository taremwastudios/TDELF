// Theme initialisation — persistent, loaded from index.html head.
// The SPA router (router.js) injects <header> and <main> via innerHTML;
// inline <script> blocks dropped into those partial HTML files are DEAD.
//  → ALL live logic lives here in this single persistent file.
(function () {
    'use strict';

    var KEY = 'tdelf-theme';
    var KEY2 = 'tdelf-toggle-bound';  // guard so we only log once

    // ── Helpers ─────────────────────────────────────────────────────────────
    function getTheme() {
        return localStorage.getItem(KEY);
    }

    // The ONLY way to apply/revert the theme
    function applyTheme(theme) {
        console.log('[settings.js] applyTheme("' + theme + '")');
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // ── Called by settings.html <script> *if* it ever runs (belt-and-suspenders)
    window.__initTheme = function () {
        applyTheme(getTheme());
    };

    // ── Toggle: find the checkbox in the live DOM and bind a listener ────────
    function initToggle(label) {
        console.log('[' + label + '] initToggle: looking for #settingsThemeToggle');
        var toggle = document.getElementById('settingsThemeToggle');
        var sub    = document.getElementById('toggleSub');
        if (!toggle) {
            console.log('[' + label + '] ── TOGGLE NOT FOUND in live DOM ──');
            // Dump the live <main> innerHTML so we can see what was injected
            var main = document.querySelector('main');
            if (main) {
                console.log('[' + label + '] <main> innerHTML starts with:');
                console.log(main.innerHTML.substring(0, 500));
            }
            return false;
        }
        console.log('[' + label + '] toggle found! checked=' + toggle.checked);

        // (Re-)bind the change handler — idempotent
        if (toggle._themeBound) {
            console.log('[' + label + '] removing old handler before re-bind');
            toggle.removeEventListener('change', toggle._themeBound);
        }

        var handler = function () {
            var isDark = toggle.checked;
            console.log('[' + label + '] change fired → checked=' + isDark);
            var next = isDark ? 'dark' : '';
            localStorage.setItem(KEY, next);
            applyTheme(next);
        };
        toggle._themeBound = handler;

        // Sync checkbox + subtext with saved state
        var saved = getTheme();
        toggle.checked = (saved === 'dark');
        if (sub) {
            sub.textContent = (saved === 'dark')
                ? 'Switch to light theme'
                : 'Switch to dark theme';
        }

        toggle.addEventListener('change', handler);
        console.log('[' + label + '] handler bound — ready');
        return true;
    }

    // ── Main entry-point — called by router after every SPA page swap ───────
    window.__onPageLoaded = function () {
        var label = window.location.pathname;
        console.log('[' + label + '] __onPageLoaded fired');

        // 1. Apply saved theme for every page
        applyTheme(getTheme());

        // 2. On /settings, wire up the switch
        if (window.location.pathname === '/settings') {
            initToggle(label);
        }
    };

    // ── Run on page load ────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyTheme(getTheme());
        });
    } else {
        applyTheme(getTheme());
    }
})();
