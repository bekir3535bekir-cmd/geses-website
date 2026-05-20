/**
 * GESES — CMS içeriğini siteye uygular
 */
(function () {
  const esc = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const steamHtml = `
    <div class="showcase-steam" aria-hidden="true">
      <span class="food-steam food-steam--1"></span>
      <span class="food-steam food-steam--2"></span>
      <span class="food-steam food-steam--3"></span>
    </div>`;

  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el && text != null) el.textContent = text;
  }

  function setHtml(sel, html) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  }

  function applyMeta(c) {
    document.title = c.meta?.title || document.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && c.meta?.description) desc.setAttribute('content', c.meta.description);
    const kw = document.querySelector('meta[name="keywords"]');
    if (kw && c.meta?.keywords) kw.setAttribute('content', c.meta.keywords);
    const auth = document.querySelector('meta[name="author"]');
    if (auth && c.meta?.author) auth.setAttribute('content', c.meta.author);
  }

  function applyContact(c) {
    const ct = c.contact || {};
    const tel = ct.phoneTel || '+905366052254';
    const wa = ct.whatsapp || '905366052254';
    const display = ct.phoneDisplay || '0536 605 22 54';

    const topLink = document.querySelector('.top-phone-link');
    if (topLink) {
      topLink.href = `tel:${tel.replace(/\s/g, '')}`;
      topLink.setAttribute('aria-label', `Telefon ile ara: ${display}`);
    }
    setText('.top-phone-number', display);

    [
      ['topInstagram', 'footerInstagram', ct.instagram],
      ['topFacebook', 'footerFacebook', ct.facebook],
    ].forEach(([topId, footId, url]) => {
      if (!url) return;
      [topId, footId].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.href = url;
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
      });
    });

    const logoImg = document.querySelector('.nav-logo img');
    if (logoImg && c.logo) {
      logoImg.src = c.logo.src;
      logoImg.alt = c.logo.alt || 'GESES';
    }

    const phoneA = document.querySelector('#phoneCard a');
    if (phoneA) {
      phoneA.href = `tel:${tel.replace(/\s/g, '')}`;
      phoneA.textContent = display;
    }
    const waA = document.querySelector('#whatsappCard a');
    if (waA) waA.href = `https://wa.me/${wa.replace(/\D/g, '')}`;

    const locSpan = document.querySelector('#locationCard span');
    if (locSpan) locSpan.textContent = ct.serviceArea || locSpan.textContent;

    if (ct.email) {
      let emailCard = document.getElementById('emailCard');
      if (!emailCard) {
        const info = document.querySelector('.contact-info');
        if (info) {
          const card = document.createElement('div');
          card.className = 'contact-card';
          card.id = 'emailCard';
          card.innerHTML = `
            <div class="contact-icon">✉️</div>
            <div class="contact-card-body">
              <h4>E-posta</h4>
              <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>
            </div>`;
          info.insertBefore(card, info.querySelector('.legacy-banner'));
        }
      } else {
        emailCard.querySelector('a').href = `mailto:${ct.email}`;
        emailCard.querySelector('a').textContent = ct.email;
      }
    }

    window.GESES_WHATSAPP = wa.replace(/\D/g, '');
  }

  function applyHero(c) {
    const h = c.hero || {};
    const badgeEl = document.querySelector('.hero-badge');
    if (badgeEl) {
      badgeEl.innerHTML = `<span>${esc(h.badgeIcon || '✨')}</span> ${esc(h.badge || '')}`;
    }
    setText('.hero-script', h.script);
    const title = document.querySelector('.hero-title');
    if (title) {
      title.innerHTML = `${esc(h.titleLine1 || '')}<br /><span>${esc(h.titleHighlight || '')}</span>`;
    }
    setText('.hero-desc', h.description);

    const imgs = h.images || {};
    const main = document.querySelector('.collage-main img');
    if (main && imgs.main) {
      main.src = imgs.main.src;
      main.alt = imgs.main.alt || '';
    }
    const s1 = document.querySelector('.collage-sub-1 img');
    if (s1 && imgs.sub1) {
      s1.src = imgs.sub1.src;
      s1.alt = imgs.sub1.alt || '';
    }
    const s2 = document.querySelector('.collage-sub-2 img');
    if (s2 && imgs.sub2) {
      s2.src = imgs.sub2.src;
      s2.alt = imgs.sub2.alt || '';
    }

    const badge = h.collageBadge || {};
    setText('.collage-badge .badge-icon', badge.icon);
    const badgeStrong = document.querySelector('.collage-badge strong');
    const badgeSpan = document.querySelector('.collage-badge span:not(.badge-icon)');
    if (badgeStrong) badgeStrong.textContent = badge.title || '';
    if (badgeSpan) badgeSpan.textContent = badge.subtitle || '';

    const trustWrap = document.querySelector('.hero-trust');
    if (trustWrap && Array.isArray(h.trust)) {
      trustWrap.innerHTML = h.trust
        .map(
          (t, i) => `
        ${i ? '<div class="trust-divider"></div>' : ''}
        <div class="trust-item">
          <strong>${esc(t.value)}</strong>
          <span>${esc(t.label)}</span>
        </div>`
        )
        .join('');
    }
  }

  function renderServices(c) {
    const grid = document.getElementById('cmsServices');
    if (!grid) return;
    const items = c.services || [];
    grid.innerHTML = items
      .map((s) => {
        const anchor =
          s.anchor ||
          (s.title && /garson/i.test(s.title) ? 'garson-temini' : '');
        const idAttr = anchor ? ` id="${esc(anchor)}"` : '';
        return `
      <div class="service-card reveal"${idAttr}>
        <span class="service-icon">${esc(s.icon)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </div>`;
      })
      .join('');
  }

  function renderPackages(c) {
    const wrap = document.getElementById('cmsPackagesWrap');
    const grid = document.getElementById('cmsPackages');
    const pkgs = c.packages || [];
    if (!wrap || !grid) return;
    if (!pkgs.length) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';
    const header = document.getElementById('cmsPackagesHeader');
    if (header) {
      header.innerHTML = `
        <div class="section-tag reveal">Düğün Paketleri</div>
        <h2 class="section-title reveal">Size Uygun <em>Paketler</em></h2>`;
    }
    grid.innerHTML = pkgs
      .map(
        (p) => `
      <div class="service-card reveal package-card">
        <span class="service-icon">${esc(p.icon || '💍')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
        ${p.price ? `<p class="package-price">${esc(p.price)}</p>` : ''}
      </div>`
      )
      .join('');
  }

  function renderStats(c) {
    const grid = document.getElementById('cmsStats');
    if (!grid) return;
    grid.innerHTML = (c.stats || [])
      .map(
        (s) => `
      <div class="stat-card reveal">
        <span class="stat-num" data-stat-value="${esc(s.value)}">${esc(s.value)}</span>
        <span class="stat-label">${esc(s.label)}</span>
      </div>`
      )
      .join('');
  }

  function applyAbout(c) {
    const a = c.about || {};
    setText('#cmsAboutTag', a.tag);
    const title = document.getElementById('cmsAboutTitle');
    if (title) title.innerHTML = `${esc(a.title || '')}<br /><em>${esc(a.titleEm || '')}</em>`;
    setText('#cmsAboutBody', a.body);
    setText('.about-badge-float .badge-year', a.badgeYear);
    setText('.about-badge-float .badge-text', a.badgeText);

    const img = document.querySelector('.about-img');
    if (img && a.image) {
      img.src = a.image.src;
      img.alt = a.image.alt || '';
      if (a.image.width) img.width = a.image.width;
      if (a.image.height) img.height = a.image.height;
    }

    const feats = document.getElementById('cmsAboutFeatures');
    if (feats) {
      feats.innerHTML = (a.features || [])
        .map(
          (f) => `
        <div class="feat">
          <span class="feat-icon">${esc(f.icon)}</span>
          <span>${esc(f.text)}</span>
        </div>`
        )
        .join('');
    }
  }

  function renderShowcase(c) {
    const sh = c.showcase || {};
    setText('#cmsShowcaseTag', sh.tag);
    const t = document.getElementById('cmsShowcaseTitle');
    if (t) t.innerHTML = `${esc(sh.title || '')}<br /><em>${esc(sh.titleEm || '')}</em>`;
    setText('#cmsShowcaseDesc', sh.description);

    const grid = document.getElementById('showcaseGrid');
    if (!grid) return;
    grid.innerHTML = (sh.items || [])
      .map(
        (item) => `
      <div class="showcase-item reveal">
        <div class="showcase-img-wrap">
          <img src="${esc(item.image)}" alt="${esc(item.imageAlt)}" class="showcase-img" />
          ${steamHtml}
        </div>
        <div class="showcase-text">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
        </div>
      </div>`
      )
      .join('');
  }

  function renderGallery(c) {
    const g = c.gallery || {};
    setText('#cmsGalleryTag', g.tag);
    const t = document.getElementById('cmsGalleryTitle');
    if (t) t.innerHTML = `${esc(g.title || '')} <em>${esc(g.titleEm || '')}</em>`;
    setText('#cmsGalleryDesc', g.description);

    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    const items = g.items || [];
    grid.innerHTML = items
      .map(
        (item, i) => `
      <button type="button" class="gallery-item reveal" data-gallery-index="${i}" aria-label="Fotoğraf ${i + 1} — büyüt" style="transition-delay: ${(i % 6) * 0.05 + 0.05}s">
        <img src="${esc(item.src)}" alt="${esc(item.alt)}" loading="lazy" />
        <div class="gallery-overlay"><span>Büyüt</span></div>
      </button>`
      )
      .join('');
  }

  function renderTestimonials(c) {
    const t = c.testimonials || {};
    setText('#cmsTestiTag', t.tag);
    const title = document.getElementById('cmsTestiTitle');
    if (title) title.innerHTML = `${esc(t.title || '')} <em>${esc(t.titleEm || '')}</em>`;

    const grid = document.getElementById('cmsTestimonials');
    if (!grid) return;
    grid.innerHTML = (t.items || [])
      .map(
        (item, i) => `
      <div class="testi-card reveal" id="testiCard${i + 1}">
        <div class="testi-stars">${'★'.repeat(Math.min(5, item.stars || 5))}</div>
        <p>"${esc(item.text)}"</p>
        <div class="testi-author">
          <div class="testi-avatar">${esc(item.initials)}</div>
          <div><strong>${esc(item.name)}</strong></div>
        </div>
      </div>`
      )
      .join('');
  }

  function applyWhyUs(c) {
    const w = c.whyUs || {};
    setText('#cmsWhyTag', w.tag);
    const title = document.getElementById('cmsWhyTitle');
    if (title) title.innerHTML = `${esc(w.title || '')} <em>${esc(w.titleEm || '')}</em>`;

    const items = document.getElementById('cmsWhyItems');
    if (items) {
      items.innerHTML = (w.items || [])
        .map(
          (item, i) => `
        <div class="why-item">
          <div class="why-num">${String(i + 1).padStart(2, '0')}</div>
          <div>
            <h4>${esc(item.title)}</h4>
            <p>${esc(item.text)}</p>
          </div>
        </div>`
        )
        .join('');
    }

    const img = document.querySelector('.why-img-side img');
    if (img && w.image) {
      img.src = w.image.src;
      img.alt = w.image.alt || '';
    }
    setText('.why-quote p', w.quote);
  }

  function applyContactSection(c) {
    const s = c.contactSection || {};
    setText('#cmsContactTag', s.tag);
    const title = document.getElementById('cmsContactTitle');
    if (title) title.innerHTML = `${esc(s.title || '')} <em>${esc(s.titleEm || '')}</em>`;
    setText('#cmsContactDesc', s.description);
  }

  function applyFooter(c) {
    const f = c.footer || {};
    setText('.logo-title', f.brand);
    setText('.logo-services', f.tagline);
    setText('.logo-sub', f.subtitle);
    setText('.footer-copy', f.copyright);
  }

  function applyContent(c) {
    applyMeta(c);
    applyContact(c);
    applyHero(c);
    renderServices(c);
    renderPackages(c);
    renderStats(c);
    applyAbout(c);
    renderShowcase(c);
    renderGallery(c);
    renderTestimonials(c);
    applyWhyUs(c);
    applyContactSection(c);
    applyFooter(c);
  }

  async function loadContent() {
    let data = null;
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      if (!res.ok) throw new Error('api');
      data = await res.json();
    } catch {
      try {
        const res = await fetch('/data/content.json', { cache: 'no-store' });
        if (res.ok) data = await res.json();
      } catch {
        /* içerik dosyası yoksa statik HTML kalır */
      }
    }
    if (data) {
      window.GESES_CONTENT = data;
      applyContent(data);
    }
    document.dispatchEvent(new CustomEvent('geses:content-ready', { detail: data }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
