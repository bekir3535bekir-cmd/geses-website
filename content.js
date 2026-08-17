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

  function setMetaAttr(selector, value) {
    if (value == null || value === '') return;
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', value);
  }

  function absoluteUrl(base, path) {
    const site = (base || 'https://www.geses.com.tr').replace(/\/$/, '');
    if (!path) return site + '/';
    if (/^https?:\/\//i.test(path)) return path;
    return `${site}/${String(path).replace(/^\//, '')}`;
  }

  function buildSchemaGraph(c) {
    const seo = c.seo || {};
    const siteUrl = (seo.siteUrl || 'https://www.geses.com.tr').replace(/\/$/, '');
    const ct = c.contact || {};
    const tel = ct.phoneTel || '+905366052254';
    const areas = (seo.areas || ['Isparta', 'Burdur', 'Bucak', 'Yalvaç', 'Eğirdir']).map((name) => ({
      '@type': 'City',
      name,
    }));
    const sameAs = [ct.instagram, ct.facebook].filter(Boolean);
    const businessId = `${siteUrl}/#business`;
    const pageId = `${siteUrl}/#webpage`;
    const ogImage = absoluteUrl(siteUrl, seo.ogImage || 'assets/og-share.jpg');
    const ogAlt =
      seo.ogImageAlt ||
      'Meşhur Isparta kabune pilavı — GESES geleneksel düğün yemeği';

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          url: siteUrl,
          name: c.meta?.title || 'GESES Düğün Yemekleri',
          inLanguage: 'tr-TR',
          publisher: { '@id': businessId },
        },
        {
          '@type': 'WebPage',
          '@id': pageId,
          url: `${siteUrl}/`,
          name: c.meta?.title || 'GESES Düğün Yemekleri',
          isPartOf: { '@id': `${siteUrl}/#website` },
          about: { '@id': businessId },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: ogImage,
            width: seo.ogImageWidth || 1200,
            height: seo.ogImageHeight || 630,
            caption: ogAlt,
          },
        },
        {
          '@type': 'FoodEstablishment',
          '@id': businessId,
          name: 'GESES — Isparta Düğün Catering ve Personel Temini',
          description: c.meta?.description || '',
          url: siteUrl,
          telephone: tel,
          image: ogImage,
          logo: absoluteUrl(siteUrl, c.logo?.src || 'assets/logo-cropped.png'),
          servesCuisine: 'Turkish',
          priceRange: '$$',
          areaServed: areas,
          sameAs,
        },
        {
          '@type': 'Service',
          name: 'Isparta düğün catering ve yemek hizmeti',
          serviceType: 'Düğün catering',
          provider: { '@id': businessId },
          areaServed: { '@type': 'City', name: 'Isparta' },
          description:
            'Geleneksel düğün yemeği, bakır kazanda pişim, kabune pilavı ve toplu organizasyon catering hizmeti.',
        },
        {
          '@type': 'Service',
          name: 'Isparta garson ve personel temini',
          serviceType: 'Personel temini',
          provider: { '@id': businessId },
          areaServed: { '@type': 'City', name: 'Isparta' },
          description:
            'Düğün ve özel gün organizasyonları için profesyonel garson, servis ve personel temini.',
        },
      ],
    };
  }

  function applyMeta(c) {
    const m = c.meta || {};
    const seo = c.seo || {};
    const siteUrl = (seo.siteUrl || 'https://www.geses.com.tr').replace(/\/$/, '');
    const ogImage = absoluteUrl(siteUrl, seo.ogImage || 'assets/og-share.jpg');
    const ogAlt =
      seo.ogImageAlt ||
      'Meşhur Isparta kabune pilavı — GESES geleneksel düğün yemeği';

    if (m.title) document.title = m.title;
    setMetaAttr('meta[name="description"]', m.description);
    setMetaAttr('meta[name="keywords"]', m.keywords);
    setMetaAttr('meta[name="author"]', m.author);

    setMetaAttr('meta[property="og:title"]', m.ogTitle || m.title);
    setMetaAttr('meta[property="og:description"]', m.ogDescription || m.description);
    setMetaAttr('meta[property="og:url"]', siteUrl + '/');
    setMetaAttr('meta[property="og:image"]', ogImage);
    setMetaAttr('meta[property="og:image:secure_url"]', ogImage);
    setMetaAttr('meta[property="og:image:type"]', seo.ogImageType || 'image/jpeg');
    setMetaAttr('meta[property="og:image:width"]', String(seo.ogImageWidth || 1200));
    setMetaAttr('meta[property="og:image:height"]', String(seo.ogImageHeight || 630));
    setMetaAttr('meta[property="og:image:alt"]', ogAlt);
    setMetaAttr('meta[name="twitter:title"]', m.twitterTitle || m.title);
    setMetaAttr('meta[name="twitter:description"]', m.twitterDescription || m.description);
    setMetaAttr('meta[name="twitter:image"]', ogImage);
    setMetaAttr('meta[name="twitter:image:alt"]', ogAlt);

    const canonical = document.getElementById('canonicalUrl');
    if (canonical) canonical.setAttribute('href', siteUrl + '/');

    const schemaEl = document.getElementById('schemaOrgJson');
    if (schemaEl) schemaEl.textContent = JSON.stringify(buildSchemaGraph(c));
  }

  function applyLocalSeo(c) {
    const block = c.localSeo || {};
    setText('#localSeoTag', block.tag);
    setText('#localSeoHeading', block.heading);
    const body = document.getElementById('localSeoBody');
    if (body && Array.isArray(block.paragraphs)) {
      body.innerHTML = block.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('');
    }
    const areas = document.getElementById('localSeoAreas');
    if (areas && Array.isArray(block.areas)) {
      areas.innerHTML = block.areas.map((a) => `<li>${esc(a)}</li>`).join('');
    }
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
      if (h.titleLine2) {
        title.innerHTML = `${esc(h.titleLine1 || '')}<br /><span class="hero-title-accent">${esc(h.titleHighlight || '')}</span> ${esc(h.titleLine2)}`;
      } else {
        title.innerHTML = `${esc(h.titleLine1 || '')}<br /><span>${esc(h.titleHighlight || '')}</span>`;
      }
    }
    setText('.hero-desc', h.description);

    const imgs = h.images || {};
    const bg = document.querySelector('.hero-cinema-bg');
    if (bg && imgs.main) {
      bg.src = imgs.main.src;
      bg.alt = '';
    }
    const dishMap = [
      ['.hero-dish-1', imgs.sub1],
      ['.hero-dish-2', imgs.sub2],
      ['.hero-dish-3', imgs.sub3],
      ['.hero-dish-4', imgs.sub4],
    ];
    dishMap.forEach(([sel, data]) => {
      const img = document.querySelector(`${sel} img`);
      const label = document.querySelector(`${sel} .hero-dish-label`);
      if (!img || !data) return;
      img.src = data.src;
      img.alt = data.alt || '';
      if (label && data.label) label.textContent = data.label;
    });

    const pills = document.querySelector('.hero-pills');
    if (pills && Array.isArray(h.pills)) {
      pills.innerHTML = h.pills.map((t) => `<li>${esc(t)}</li>`).join('');
    }

    const badge = h.foodBadge || h.collageBadge || {};
    setText('.hero-food-badge .badge-icon', badge.icon);
    const badgeStrong = document.querySelector('.hero-food-badge strong');
    const badgeSpan = document.querySelector('.hero-food-badge span:not(.badge-icon)');
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
      <div class="showcase-item">
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

    const note = document.getElementById('cmsTestiGoogleNote');
    if (note) {
      const label = t.googleNote || 'Gerçek Google yorumları';
      const url = t.googleReviewsUrl || '';
      const icon = note.querySelector('.testi-google-note-icon');
      const iconHtml = icon ? icon.outerHTML : '';
      if (url) {
        note.innerHTML = `${iconHtml}<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
      } else {
        note.innerHTML = `${iconHtml}${esc(label)}`;
      }
    }

    const googleBadge = t.googleBadge || 'Google Yorumu';
    const showGoogle = t.googleReviews !== false;

    const grid = document.getElementById('cmsTestimonials');
    if (!grid) return;
    grid.innerHTML = (t.items || [])
      .map(
        (item, i) => `
      <div class="testi-card reveal${showGoogle && item.google !== false ? ' testi-card--google' : ''}" id="testiCard${i + 1}">
        ${showGoogle && item.google !== false ? `
        <div class="testi-google-badge" title="Google İşletme yorumu">
          <svg class="testi-google-badge-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>${esc(googleBadge)}</span>
        </div>` : ''}
        <div class="testi-stars" aria-label="${Math.min(5, item.stars || 5)} yıldız">${'★'.repeat(Math.min(5, item.stars || 5))}</div>
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
    applyLocalSeo(c);
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
