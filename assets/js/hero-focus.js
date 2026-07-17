// White Ash Glass Studio — hero: hover lens + click to focus
//
// Hovering moves a sharp, circle-clipped copy of the studio photo
// to wherever the cursor is (an inline SVG <clipPath> whose child path gets
// translate()'d every frame — the photo never moves, only the window we're
// allowed to see it through does). Clicking the hero — or pressing Enter/
// Space, since it's a real keyboard-focusable control — locks the *whole*
// photo into focus: a full-size sharp layer crossfades in and the lens
// fades out, since there's nothing left for it to reveal.
//
// No pointer-type branching or autoplay drift needed: on touch, there's
// simply no hover, so the lens just rests at its centred starting point
// until a tap locks the whole photo sharp — tap-to-resolve works
// identically for touch, mouse, and keyboard.
(function () {
  'use strict';

  var hero = document.getElementById('lensHero');
  if (!hero) return;

  var lensImg = hero.querySelector('.lens-img');
  var clipPath = document.getElementById('lensClipPath');
  var rimGroup = document.getElementById('lensRimGroup');
  if (!lensImg || !clipPath || !rimGroup) return;

  var rect = hero.getBoundingClientRect();
  var current = { x: rect.width * 0.5, y: rect.height * 0.5 };
  var target = { x: current.x, y: current.y };
  var EASE = 0.12;
  var SETTLE_EPSILON = 0.05;
  var looping = false;
  var locked = false;

  function updateRect() { rect = hero.getBoundingClientRect(); }

  function applyPosition(x, y) {
    var t = 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')';
    clipPath.setAttribute('transform', t);
    rimGroup.setAttribute('transform', t);
    lensImg.style.setProperty('--lens-x', ((x / rect.width) * 100).toFixed(2) + '%');
    lensImg.style.setProperty('--lens-y', ((y / rect.height) * 100).toFixed(2) + '%');
  }

  // Runs only while the lens is actively easing toward a new target; once
  // it settles (or the whole photo locks into focus) the loop stops itself
  // instead of polling requestAnimationFrame forever for a static picture.
  function frame() {
    var dx = target.x - current.x;
    var dy = target.y - current.y;
    if (Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON) {
      current.x = target.x;
      current.y = target.y;
      applyPosition(current.x, current.y);
      looping = false;
      return;
    }
    current.x += dx * EASE;
    current.y += dy * EASE;
    applyPosition(current.x, current.y);
    requestAnimationFrame(frame);
  }

  function ensureLoop() {
    if (looping || locked) return;
    looping = true;
    requestAnimationFrame(frame);
  }

  applyPosition(current.x, current.y);
  requestAnimationFrame(function () {
    hero.classList.add('lens-ready');
  });

  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return; // no touch-drag capture
    target.x = e.clientX - rect.left;
    target.y = e.clientY - rect.top;
    ensureLoop();
  });

  hero.addEventListener('pointerleave', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    target.x = rect.width * 0.5;
    target.y = rect.height * 0.5;
    ensureLoop();
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateRect, 150);
  });

  function lock() {
    locked = true;
    hero.classList.add('is-locked', 'hint-dismissed');
    hero.setAttribute('aria-pressed', 'true');
  }

  hero.addEventListener('click', lock);
  hero.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      lock();
    }
  });
})();
