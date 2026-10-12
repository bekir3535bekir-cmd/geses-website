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

  const iconNames = {
    '✨': 'wheat', '🔥': 'fire', '💍': 'cloche', '🕌': 'calendar',
    '🕴️': 'team', '🌿': 'leaf', '🤝': 'handshake', '🏆': 'award',
    '📞': 'phone', '💬': 'chat', '📍': 'pin', '🍽': 'plate', '✉️': 'mail'
  };
  const icon = (value, fallback = 'wheat') => {
    const name = iconNames[value] || fallback;
    return `<svg class="site-icon" aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
  };

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
    const floatingWa = document.getElementById('floatingWhatsApp');
    if (floatingWa) floatingWa.href = `https://wa.me/${wa.replace(/\D/g, '')}`;

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
            <div class="contact-icon">${icon('✉️', 'mail')}</div>
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
      badgeEl.textContent = h.badge || '';
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
    const foodIcon = document.querySelector('.hero-food-badge .badge-icon');
    if (foodIcon) foodIcon.innerHTML = icon(badge.icon, 'fire');
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
    const serviceIcons = { s1: 'cloche', s2: 'calendar', s3: 'cauldron', s4: 'team' };
    grid.innerHTML = items
      .map((s) => {
        const anchor =
          s.anchor ||
          (s.title && /garson/i.test(s.title) ? 'garson-temini' : '');
        const idAttr = anchor ? ` id="${esc(anchor)}"` : '';
        return `
      <div class="service-card reveal"${idAttr}>
        <span class="service-icon">${icon(serviceIcons[s.id] ? null : s.icon, serviceIcons[s.id] || 'cloche')}</span>
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
        <span class="service-icon">${icon(p.icon, 'cloche')}</span>
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
          <span class="feat-icon">${icon(f.icon, 'leaf')}</span>
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
    const note = document.getElementById('cmsTestiGoogleNote');
    if (note && t.googleReviewsUrl) note.href = t.googleReviewsUrl;

    const grid = document.getElementById('cmsTestimonials');
    if (!grid) return;
    grid.innerHTML = (t.items || [])
      .map(
        (item) => `<article class="testi-editorial-item reveal"><blockquote>“${esc(item.text)}”</blockquote><div><cite>${esc(item.name)}</cite><span>Google yorumu</span></div></article>`
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
