// White Ash Glass Studio — shared site behaviour
(function(){
  'use strict';

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Hero video sound (home) ----
  // Autoplay-with-sound is blocked by every major browser — there is no
  // way to start audio with zero interaction, on this or any site. This
  // sets up the shared on/off logic; what actually unlocks it is the
  // loading-veil click below (the closest real equivalent of "plays with
  // the logo"), with the pill as a visible, explicit control afterward
  // and a page-wide first-interaction fallback in case the veil's safety
  // timeout fires before anyone clicks it.
  var heroVideo = document.querySelector('.video-hero-media');
  var soundToggle = document.querySelector('.hero-sound-toggle');
  var soundUnlocked = false;
  var setSoundOn = function(){};
  if(heroVideo && soundToggle){
    setSoundOn = function(on){
      heroVideo.muted = !on;
      soundToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      soundToggle.setAttribute('aria-label', on ? 'Turn off sound' : 'Turn on sound');
    };

    soundToggle.addEventListener('click', function(){
      if(!soundUnlocked){
        soundUnlocked = true;
        setSoundOn(true);
      } else {
        setSoundOn(heroVideo.muted);
      }
    });

    var unlockSoundOnFirstInteraction = function(){
      if(soundUnlocked) return;
      soundUnlocked = true;
      setSoundOn(true);
    };
    ['click', 'touchstart', 'keydown'].forEach(function(evt){
      document.addEventListener(evt, unlockSoundOnFirstInteraction, { once: true, passive: true });
    });
  }

  // ---- Loading veil ----
  // Every page has this veil, but the tap-to-enter gate (and the sound
  // unlock riding on it) only makes sense where there's actually a hero
  // video to gate. Subpages have no video and no hint text for a gate
  // they'd have no way to know about, so they keep the original fast,
  // ungated auto-dismiss — only the homepage waits for a click.
  var veil = document.querySelector('.loading-veil');
  if(veil){
    var heroVideoEl = document.querySelector('.video-hero-media');
    var dismissed = false;
    var dismissVeil = function(){
      if(dismissed) return;
      dismissed = true;
      veil.classList.add('hide');
    };

    if(heroVideoEl){
      // Homepage: tapping the logo dismisses the veil and unlocks sound
      // together, since a real click is the only thing browsers accept
      // as permission for audio. Clicking never waits on video
      // readiness — the poster frame covers that gap gracefully — so
      // the "Tap to enter" hint only needs the minimum hold, not
      // canplay. Gating it on canplay was measured to actively hurt
      // slow connections: throttled to ~1.6Mbps, canplay took 7.4s,
      // well past the old 4.5s safety net, so those visitors never
      // saw the hint or got a chance to enable sound at all. A longer
      // safety timeout auto-dismisses (without sound) for anyone who
      // never clicks, so the site never gets truly stuck behind it.
      var enterSite = function(){
        dismissVeil();
        soundUnlocked = true;
        setSoundOn(true);
      };
      veil.addEventListener('click', enterSite);
      veil.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); enterSite(); }
      });

      // Runs from script execution, not window.load: the veil is a full
      // opaque overlay, so nothing loading underneath it is ever visible
      // — gating on full page load (fonts, nav thumbnails, etc.) only
      // added an unpredictable, network-dependent delay with no benefit.
      setTimeout(function(){ veil.classList.add('ready'); }, 550);

      // safety fallback: never hold the site hostage behind an unclicked veil
      setTimeout(dismissVeil, 7000);
    } else {
      // Every other page: same fast, ungated dismiss as before this feature existed
      window.addEventListener('load', function(){
        setTimeout(dismissVeil, 550);
      });
      setTimeout(dismissVeil, 2200);
    }
  }

  // ---- Nav scroll state ----
  var nav = document.querySelector('.site-nav');
  if(nav){
    var onScroll = function(){
      if(window.scrollY > 40){ nav.classList.add('scrolled'); }
      else{ nav.classList.remove('scrolled'); }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Liquid glass: floating nav + nav mega-menu + footer newsletter card ----
  // A literal glass-refraction effect for a glass studio. Kept to these
  // deliberate spots rather than applied broadly, per brand guidance
  // against flashy, decoration-for-its-own-sake UI. The mega-menu panel is
  // built with real dimensions from the start (opacity/visibility toggle,
  // never display:none) so its filter measures correctly before first hover.
  if(window.liquidGlass){
    if(nav){
      nav.classList.add('glass-nav');
      liquidGlass(nav, { scale: -70, chroma: 5, blur: 6, saturate: 1.25, radius: 20, fallbackBlur: 18 });
      nav.classList.add('lg-ready');
    }
    var mega = document.querySelector('.nav-mega');
    if(mega){
      mega.classList.add('glass-nav');
      liquidGlass(mega, { scale: -50, chroma: 4, blur: 6, saturate: 1.2, radius: 20, fallbackBlur: 16 });
    }
    document.querySelectorAll('.glass-card').forEach(function(card){
      card.classList.add('glass-nav');
      liquidGlass(card, { scale: -55, chroma: 4, blur: 5, saturate: 1.2, radius: 18, fallbackBlur: 14 });
    });
  }

  // ---- Interactive process widget (Classes page) ----
  var ipTabs = document.querySelectorAll('.ip-tab');
  var ipImage = document.getElementById('ip-image');
  var ipDesc = document.getElementById('ip-desc');
  var ipFlame = document.querySelector('.ip-flame');
  if(ipTabs.length && ipImage && ipDesc){
    var ipData = {
      heat: {
        img: 'https://images.unsplash.com/photo-1631530343708-d1ac800650da?w=900&q=80&auto=format&fit=crop',
        text: 'Borosilicate rod is brought into the flame until it turns molten and workable, somewhere near 3,000°F at the hottest point.'
      },
      shape: {
        img: 'https://images.unsplash.com/photo-1630691650857-a6860db7012f?w=900&q=80&auto=format&fit=crop',
        text: 'Graphite tools, gravity, and a steady hand turn the glow into form, gathering and pulling the glass into its final shape.'
      },
      anneal: {
        img: 'https://images.unsplash.com/photo-1635184549784-90a9f799d68d?w=900&q=80&auto=format&fit=crop',
        text: 'Finished pieces cool slowly in a kiln, over several hours, so the internal stress releases and the glass holds for a lifetime.'
      }
    };
    ipTabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        ipTabs.forEach(function(t){ t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var stage = tab.getAttribute('data-stage');
        var entry = ipData[stage];
        if(!entry) return;
        ipImage.style.opacity = 0;
        setTimeout(function(){
          ipImage.src = entry.img;
          ipDesc.textContent = entry.text;
          ipImage.style.opacity = 1;
        }, prefersReducedMotion ? 0 : 350);
        if(ipFlame){ ipFlame.className = 'ip-flame' + (stage === 'heat' ? '' : ' ip-flame-' + stage); }
      });
    });
  }

  // ---- Mobile nav toggle ----
  var toggle = document.querySelector('.nav-toggle');
  if(toggle){
    toggle.addEventListener('click', function(){
      document.body.classList.toggle('nav-open');
      var expanded = document.body.classList.contains('nav-open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-links a').forEach(function(a){
      a.addEventListener('click', function(){ document.body.classList.remove('nav-open'); });
    });
  }

  // ---- Reveal on scroll ----
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
    // safety net: never leave content invisible if IO misses it
    setTimeout(function(){
      revealEls.forEach(function(el){ el.classList.add('in'); });
    }, 2500);
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  // ---- Shared: crossfade a form out, then a success message in ----
  function revealSuccess(form, success){
    form.classList.add('form-exit');
    window.setTimeout(function(){
      form.style.display = 'none';
      if(!success) return;
      success.style.display = 'block';
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){ success.classList.add('show'); });
      });
    }, prefersReducedMotion ? 0 : 260);
  }

  // ---- Newsletter form (footer) — static demo submit ----
  document.querySelectorAll('.newsletter-form').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var success = form.parentElement.querySelector('.newsletter-success');
      if(input && input.value){
        revealSuccess(form, success);
      }
    });
  });

  // ---- Contact form — static demo submit ----
  var contactForm = document.querySelector('.contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      revealSuccess(contactForm, document.querySelector('.form-success'));
    });
  }

  // ---- Lightbox (gallery) ----
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.querySelector('.lightbox');
  if(galleryItems.length && lightbox){
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var current = 0;

    function setLightboxContent(i){
      current = i;
      var item = galleryItems[current];
      var full = item.getAttribute('data-full') || item.querySelector('img').src;
      lbImg.src = full;
      lbImg.alt = item.querySelector('img').alt || '';
      if(lbCaption){ lbCaption.textContent = item.getAttribute('data-caption') || ''; }
    }
    function openLightbox(i){
      setLightboxContent(i);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    function step(dir){
      var next = (current + dir + galleryItems.length) % galleryItems.length;
      lbImg.style.opacity = 0;
      window.setTimeout(function(){
        setLightboxContent(next);
        lbImg.style.opacity = 1;
      }, prefersReducedMotion ? 0 : 350);
    }

    galleryItems.forEach(function(item, i){
      item.addEventListener('click', function(){ openLightbox(i); });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(i); }
      });
    });

    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if(prevBtn) prevBtn.addEventListener('click', function(){ step(-1); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ step(1); });
    lightbox.addEventListener('click', function(e){ if(e.target === lightbox){ closeLightbox(); } });
    document.addEventListener('keydown', function(e){
      if(!lightbox.classList.contains('open')) return;
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowRight') step(1);
      if(e.key === 'ArrowLeft') step(-1);
    });
  }

})();
