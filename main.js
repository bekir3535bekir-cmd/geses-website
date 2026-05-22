/* main.js – GESES Düğün Yemekleri | Apple-Style Scroll Logic */

document.addEventListener('DOMContentLoaded', () => {
  
  // ---------- Navbar scroll effect ----------
  const navbar = document.getElementById('navbar');
  const mobilePhoneMq = window.matchMedia('(max-width: 768px)');

  const updateScrollUi = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 50);
    if (mobilePhoneMq.matches) {
      /* Dock: nabız yok; üst çubukla çakışmasın diye hafif eşik */
      document.body.classList.toggle('phone-dock-active', y > 56);
    } else {
      document.body.classList.remove('phone-dock-active');
    }
  };

  window.addEventListener('scroll', updateScrollUi, { passive: true });
  mobilePhoneMq.addEventListener('change', updateScrollUi);
  updateScrollUi();

  // ---------- Intersection Observer for Reveals ----------
  const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -4% 0px',
  };

  const revealObserved = new WeakSet();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, revealOptions);

  const bindRevealElements = () => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .scale-up').forEach((el) => {
      if (revealObserved.has(el)) return;
      revealObserved.add(el);
      revealObserver.observe(el);
    });
  };

  const bindSectionFlows = () => {
    document.querySelectorAll('.stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5').forEach((el) => {
      el.classList.add('reveal');
    });
    bindRevealElements();
  };

  let showcaseObservers = [];

  const bindShowcaseEffects = () => {
    const showcaseGrid = document.getElementById('showcaseGrid');
    const showcaseSection = document.getElementById('showcase');
    const showcaseHand = document.getElementById('showcaseHand');
    const showcaseStage = document.getElementById('showcaseStage');
    if (!showcaseGrid || !showcaseSection) return;

    showcaseObservers.forEach((o) => o.disconnect());
    showcaseObservers = [];

    const isMobileView = window.matchMedia('(max-width: 768px)').matches;
    const getItems = () => [...showcaseGrid.querySelectorAll('.showcase-item')];

    const resetPresentation = () => {
      showcaseGrid.classList.remove('is-presenting', 'is-finished', 'is-awake', 'is-mobile-flow');
      showcaseSection.classList.remove('is-presenting');
      getItems().forEach((item) => item.classList.remove('is-presented', 'is-current', 'is-steaming'));
      showcaseGrid.style.removeProperty('--present-step');
      if (showcaseHand) {
        showcaseHand.style.removeProperty('--hand-x');
        showcaseHand.style.removeProperty('top');
      }
    };

    const setPresentationStep = (index, total) => {
      const items = getItems();
      if (!items.length) return;
      const step = Math.min(Math.max(index, 0), total - 1);
      showcaseGrid.style.setProperty('--present-step', String(step));
      showcaseGrid.dataset.presentStep = String(step);
      if (showcaseHand) showcaseHand.style.setProperty('--present-step', String(step));

      items.forEach((item, i) => {
        item.classList.toggle('is-presented', i <= step);
        item.classList.toggle('is-current', i === step);
        item.classList.toggle('is-steaming', i === step);
      });

      if (isMobileView && showcaseHand && items[step] && showcaseStage) {
        const item = items[step];
        const top = item.offsetTop + item.offsetHeight * 0.3;
        showcaseHand.style.top = `${top}px`;
        showcaseHand.style.removeProperty('--hand-x');
      } else if (showcaseHand && total > 1) {
        showcaseHand.style.removeProperty('top');
        const pct = (step / (total - 1)) * 100;
        showcaseHand.style.setProperty('--hand-x', `${pct}%`);
      }
    };

    const runDesktopPresentation = () => {
      const items = getItems();
      if (!items.length) return;

      resetPresentation();
      showcaseGrid.classList.add('is-presenting', 'is-awake');
      showcaseSection.classList.add('is-presenting');

      const total = items.length;
      const stepMs = 620;
      let step = 0;
      setPresentationStep(step, total);

      const tick = () => {
        step += 1;
        if (step >= total) {
          showcaseGrid.classList.add('is-finished');
          items.forEach((item) => item.classList.remove('is-current'));
          items.forEach((item) => item.classList.add('is-steaming'));
          return;
        }
        setPresentationStep(step, total);
        window.setTimeout(tick, stepMs);
      };
      window.setTimeout(tick, stepMs);
    };

    if (isMobileView) {
      showcaseGrid.classList.add('steam-mobile', 'is-mobile-flow');

      const pickActiveItem = (entries) => {
        let best = null;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target;
          }
        });
        if (!best) return;
        const items = getItems();
        const index = items.indexOf(best);
        if (index < 0) return;
        showcaseGrid.classList.add('is-presenting', 'is-awake');
        showcaseSection.classList.add('is-presenting');
        setPresentationStep(index, items.length);
      };

      const itemObserver = new IntersectionObserver(pickActiveItem, {
        threshold: [0.35, 0.5, 0.65, 0.85],
        rootMargin: '-32% 0px -32% 0px',
      });

      getItems().forEach((item) => itemObserver.observe(item));
      showcaseObservers.push(itemObserver);

      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) resetPresentation();
          });
        },
        { threshold: 0.05 }
      );
      sectionObserver.observe(showcaseSection);
      showcaseObservers.push(sectionObserver);
    } else {
      showcaseGrid.classList.remove('is-mobile-flow');
      const presentObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runDesktopPresentation();
            } else {
              resetPresentation();
            }
          });
        },
        { threshold: 0.28 }
      );
      presentObserver.observe(showcaseSection);
      showcaseObservers.push(presentObserver);
    }
  };

  const bindStatsCounter = () => {
    const stats = document.querySelectorAll('.stat-num');
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        const raw = (target.dataset.statValue || target.textContent || '').trim();
        const suffix = raw.includes('+') ? '+' : '';
        const countTo = parseInt(raw.replace(/\D/g, ''), 10);

        // Kuruluş yılı vb. — animasyon yok, metin aynen kalsın
        if (!countTo || (countTo >= 1900 && countTo <= 2100)) {
          target.textContent = raw;
          statsObserver.unobserve(target);
          return;
        }

        let count = 0;
        const duration = countTo > 10000 ? 2800 : 2000;
        const increment = countTo / (duration / 16);
        const updateCount = () => {
          count += increment;
          if (count < countTo) {
            target.textContent = Math.floor(count).toLocaleString('tr-TR') + suffix;
            requestAnimationFrame(updateCount);
          } else {
            target.textContent =
              countTo >= 1000 ? countTo.toLocaleString('tr-TR') + suffix : countTo + suffix;
          }
        };
        updateCount();
        statsObserver.unobserve(target);
      });
    }, { threshold: 0.5 });
    stats.forEach((s) => statsObserver.observe(s));
  };

  const initDynamicSections = () => {
    bindSectionFlows();
    bindShowcaseEffects();
    bindStatsCounter();
    initGalleryLightbox();
  };

  bindSectionFlows();
  document.addEventListener('geses:content-ready', initDynamicSections);
  /* İçerik yüklenmese bile hero/metin (.reveal) görünsün */
  setTimeout(initDynamicSections, 800);

  // ---------- Mobile Menu ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navClose = document.getElementById('navClose');
  const navOverlay = document.getElementById('navOverlay');

  const setMenuOpen = (open) => {
    if (!hamburger || !navLinks) return;
    hamburger.classList.toggle('active', open);
    navLinks.classList.toggle('active', open);
    navOverlay?.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    if (navOverlay) {
      navOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
  };

  const toggleMenu = () => setMenuOpen(!navLinks?.classList.contains('active'));
  const closeMenu = () => setMenuOpen(false);

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', toggleMenu);
    navClose?.addEventListener('click', closeMenu);
    navOverlay?.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ---------- Teklif formu → WhatsApp ----------
  const getWhatsAppNumber = () =>
    (window.GESES_WHATSAPP || window.GESES_CONTENT?.contact?.whatsapp || '905366052254').replace(/\D/g, '');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.querySelector('.form-success');
  const submitBtn = document.getElementById('formSubmitBtn');

  const formatEventDate = (isoDate) => {
    if (!isoDate) return '—';
    const parsed = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return parsed.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const buildWhatsAppTeklifMessage = (data) => {
    const lines = [
      'Merhaba GESES, web sitenizden teklif talebi gönderiyorum.',
      '',
      `*Ad Soyad:* ${data.adSoyad}`,
      `*Telefon:* ${data.telefon}`,
      `*Etkinlik Tarihi:* ${formatEventDate(data.dugunTarihi)}`,
      `*Tahmini Kişi:* ${data.kisiSayisi}`,
    ];
    if (data.sehir?.trim()) lines.push(`*Şehir / İlçe:* ${data.sehir.trim()}`);
    if (data.mesaj?.trim()) {
      lines.push('', '*Not:*', data.mesaj.trim());
    }
    lines.push('', 'Lütfen en kısa zamanda dönüşünüzü bekliyorum.');
    return lines.join('\n');
  };

  if (contactForm && formSuccess && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = {
        adSoyad: contactForm.adSoyad?.value?.trim() || '',
        telefon: contactForm.telefon?.value?.trim() || '',
        dugunTarihi: contactForm.dugunTarihi?.value || '',
        kisiSayisi: contactForm.kisiSayisi?.value || '',
        sehir: contactForm.sehir?.value || '',
        mesaj: contactForm.mesaj?.value || '',
      };

      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'WhatsApp açılıyor...';
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.opacity = '0.7';

      const waUrl = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(buildWhatsAppTeklifMessage(data))}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        submitBtn.innerText = originalText;
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.opacity = '1';
        formSuccess.classList.add('active');
        contactForm.reset();
        setTimeout(() => formSuccess.classList.remove('active'), 8000);
      }, 400);
    });
  }

  // ---------- Galeri lightbox (CMS sonrası yeniden bağlanır) ----------
  let galleryUiBound = false;
  let galleryCurrentIndex = 0;
  let galleryTouchStartX = 0;

  const initGalleryLightbox = () => {
    const galleryGrid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCounter = document.getElementById('lightboxCounter');
    if (!galleryGrid || !lightbox || !lightboxImg) return;

    const getSlides = () =>
      Array.from(galleryGrid.querySelectorAll('.gallery-item'))
        .map((btn) => {
          const img = btn.querySelector('img');
          return {
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || 'GESES galeri fotoğrafı',
          };
        })
        .filter((s) => s.src);

    const renderSlide = (index) => {
      const slides = getSlides();
      if (!slides.length) return;
      galleryCurrentIndex = (index + slides.length) % slides.length;
      const slide = slides[galleryCurrentIndex];
      lightboxImg.src = slide.src;
      lightboxImg.alt = slide.alt;
      if (lightboxCounter) {
        lightboxCounter.textContent = `${galleryCurrentIndex + 1} / ${slides.length}`;
      }
    };

    const openLightbox = (index) => {
      renderSlide(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      document.getElementById('lightboxClose')?.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      lightboxImg.removeAttribute('src');
    };

    const step = (delta) => renderSlide(galleryCurrentIndex + delta);

    if (!galleryGrid.dataset.lbBound) {
      galleryGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.gallery-item');
        if (!btn) return;
        const idx = parseInt(btn.getAttribute('data-gallery-index'), 10);
        openLightbox(Number.isNaN(idx) ? 0 : idx);
      });
      galleryGrid.dataset.lbBound = '1';
    }

    if (!galleryUiBound) {
      document.getElementById('lightboxBackdrop')?.addEventListener('click', closeLightbox);
      document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
      document.getElementById('lightboxPrev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        step(-1);
      });
      document.getElementById('lightboxNext')?.addEventListener('click', (e) => {
        e.stopPropagation();
        step(1);
      });
      lightbox.addEventListener('touchstart', (e) => {
        galleryTouchStartX = e.changedTouches[0]?.clientX ?? 0;
      }, { passive: true });
      lightbox.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0]?.clientX ?? 0;
        const delta = touchEndX - galleryTouchStartX;
        if (Math.abs(delta) < 50) return;
        step(delta < 0 ? 1 : -1);
      }, { passive: true });
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
      });
      galleryUiBound = true;
    }
  };
});
