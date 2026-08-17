/**
 * GESES CMS Dashboard
 */
(function () {
  const TOKEN_KEY = 'geses_cms_token';
  let token = sessionStorage.getItem(TOKEN_KEY) || '';
  let content = null;
  let mediaItems = [];
  let activePanel = 'general';
  const sortables = [];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const toast = (msg, ok = true) => {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    el.style.borderColor = ok ? 'rgba(129,199,132,.5)' : 'rgba(229,115,115,.5)';
    setTimeout(() => { el.hidden = true; }, 3200);
  };

  const setSaveStatus = (text, type = '') => {
    const s = $('#saveStatus');
    s.textContent = text;
    s.className = `save-status ${type}`;
  };

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'İstek başarısız');
    return data;
  }

  async function login(password) {
    const { token: t } = await api('/api/login', { method: 'POST', body: { password } });
    token = t;
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  async function loadContent() {
    content = await api('/api/content');
  }

  async function loadMedia() {
    const { items } = await api('/api/media');
    mediaItems = items || [];
  }

  async function saveContent() {
    setSaveStatus('Kaydediliyor...', '');
    await api('/api/content', { method: 'PUT', body: content });
    setSaveStatus('Yayında ✓', 'ok');
    toast('Site içeriği güncellendi');
  }

  async function uploadFiles(fileList) {
    const fd = new FormData();
    [...fileList].forEach((f) => fd.append('files', f));
    const { files } = await api('/api/upload', { method: 'POST', body: fd });
    await loadMedia();
    return files || [];
  }

  function destroySortables() {
    sortables.forEach((s) => s.destroy());
    sortables.length = 0;
  }

  function mountSortable(el, onEnd) {
    if (!el || typeof Sortable === 'undefined') return;
    sortables.push(
      Sortable.create(el, {
        handle: '.sort-handle',
        animation: 150,
        onEnd,
      })
    );
  }

  function field(label, html) {
    return `<div class="field"><label>${label}</label>${html}</div>`;
  }

  function imagePicker(path, onChangeKey) {
    const opts = mediaItems
      .map((m) => `<option value="${m.path}" ${m.path === path ? 'selected' : ''}>${m.path}</option>`)
      .join('');
    return `
      <div class="grid-2">
        ${field('Görsel yolu', `<input type="text" data-bind="${onChangeKey}" value="${path || ''}" placeholder="assets/..." />`)}
        ${field('Medya kütüphanesinden', `<select data-pick="${onChangeKey}"><option value="">— seç —</option>${opts}</select>`)}
      </div>
      ${path ? `<img src="/${path.replace(/^\//, '')}" alt="" style="max-width:160px;border-radius:8px;margin-top:8px" />` : ''}`;
  }

  function listItemEditor(item, fields, index, listKey) {
    return `
      <div class="sort-item" data-index="${index}" data-list="${listKey}">
        <div class="sort-item-head"><span class="sort-handle">⠿</span><strong>#${index + 1}</strong>
          <button type="button" class="btn btn-danger btn-sm" data-remove="${listKey}" data-index="${index}" style="margin-left:auto">Sil</button>
        </div>
        ${fields}
      </div>`;
  }

  // ——— Panels ———

  function renderGeneral() {
    const c = content.contact;
    return `
      <div class="card">
        <h3>İletişim & Sosyal Medya</h3>
        <div class="grid-2">
          ${field('Telefon (görünen)', `<input data-c="contact.phoneDisplay" value="${c.phoneDisplay || ''}" />`)}
          ${field('Telefon (aranan)', `<input data-c="contact.phoneTel" value="${c.phoneTel || ''}" />`)}
          ${field('WhatsApp numarası', `<input data-c="contact.whatsapp" value="${c.whatsapp || ''}" placeholder="905366052254" />`)}
          ${field('E-posta', `<input type="email" data-c="contact.email" value="${c.email || ''}" />`)}
          ${field('Instagram URL', `<input data-c="contact.instagram" value="${c.instagram || ''}" placeholder="https://instagram.com/..." />`)}
          ${field('Facebook URL', `<input data-c="contact.facebook" value="${c.facebook || ''}" />`)}
          ${field('Adres', `<input data-c="contact.address" value="${c.address || ''}" />`)}
          ${field('Hizmet bölgesi', `<input data-c="contact.serviceArea" value="${c.serviceArea || ''}" />`)}
        </div>
      </div>
      <div class="card">
        <h3>İletişim bölümü metni</h3>
        ${field('Açıklama', `<textarea data-c="contactSection.description">${content.contactSection?.description || ''}</textarea>`)}
      </div>`;
  }

  function renderMedia() {
    return `
      <div class="card">
        <h3>Fotoğraf yükle (sürükle-bırak)</h3>
        <div class="dropzone" id="dropzone">
          <strong>Dosyaları buraya bırakın</strong>
          veya tıklayıp seçin (JPG, PNG, WebP — max 12 MB)
        </div>
        <input type="file" id="fileInput" accept="image/*" multiple hidden />
      </div>
      <div class="card">
        <h3>Medya kütüphanesi</h3>
        <p style="color:var(--muted);font-size:.85rem">Galeriye eklemek için görseli yükleyin, ardından «Galeri» sekmesinden sıralayın.</p>
        <div class="media-grid" id="mediaGrid">
          ${mediaItems.map((m) => `
            <div class="media-thumb">
              <img src="/${m.path}" alt="" loading="lazy" />
              <div class="media-actions">
                <button type="button" class="btn btn-sm btn-gold" data-add-gallery="${m.path}">+ Galeri</button>
                ${m.path.includes('/uploads/') ? `<button type="button" class="btn btn-sm btn-danger" data-del-media="${m.name}">Sil</button>` : ''}
              </div>
              <div class="media-path">${m.path}</div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderHero() {
    const h = content.hero;
    return `
      <div class="card"><h3>Hero metinleri</h3>
        <div class="grid-2">
          ${field('Rozet', `<input data-c="hero.badge" value="${h.badge || ''}" />`)}
          ${field('Rozet ikon', `<input data-c="hero.badgeIcon" value="${h.badgeIcon || ''}" />`)}
          ${field('Üst yazı', `<input data-c="hero.script" value="${h.script || ''}" />`)}
          ${field('Başlık satır 1', `<input data-c="hero.titleLine1" value="${h.titleLine1 || ''}" />`)}
          ${field('Başlık vurgu', `<input data-c="hero.titleHighlight" value="${h.titleHighlight || ''}" />`)}
        </div>
        ${field('Açıklama', `<textarea data-c="hero.description">${h.description || ''}</textarea>`)}
      </div>
      <div class="card"><h3>Hero görselleri</h3>
        <p style="color:var(--muted);font-size:.85rem">Ana kolaj ve küçük fotoğraflar</p>
        ${field('Ana foto', `<input data-c="hero.images.main.src" value="${h.images?.main?.src || ''}" />`)}
        ${field('Ana alt metin', `<input data-c="hero.images.main.alt" value="${h.images?.main?.alt || ''}" />`)}
        ${field('Menü 1 (Kabune)', `<input data-c="hero.images.sub1.src" value="${h.images?.sub1?.src || ''}" />`)}
        ${field('Menü 2 (Çorba)', `<input data-c="hero.images.sub2.src" value="${h.images?.sub2?.src || ''}" />`)}
        ${field('Menü 3 (Fasulye)', `<input data-c="hero.images.sub3.src" value="${h.images?.sub3?.src || ''}" />`)}
        ${field('Menü 4 (Helva)', `<input data-c="hero.images.sub4.src" value="${h.images?.sub4?.src || ''}" />`)}
      </div>
      <div class="card"><h3>Güven şeridi</h3>
        <div id="trustList" class="sort-list">
          ${(h.trust || []).map((t, i) => listItemEditor(t, `
            ${field('Değer', `<input data-list="hero.trust" data-i="${i}" data-k="value" value="${t.value}" />`)}
            ${field('Etiket', `<input data-list="hero.trust" data-i="${i}" data-k="label" value="${t.label}" />`)}
          `, i, 'hero.trust')).join('')}
        </div>
        <button type="button" class="btn btn-ghost" data-add-list="hero.trust" style="margin-top:10px;width:auto">+ Ekle</button>
      </div>`;
  }

  function renderListPanel(title, listKey, itemRenderer, emptyItem) {
    const arr = content[listKey.split('.')[0]];
    const nested = listKey.includes('.');
    const items = nested ? content[listKey.split('.')[0]][listKey.split('.')[1]] : arr;
    return `
      <div class="card">
        <h3>${title}</h3>
        <div id="list-${listKey.replace(/\./g, '-')}" class="sort-list">
          ${(items || []).map((item, i) => itemRenderer(item, i, listKey)).join('')}
        </div>
        <button type="button" class="btn btn-ghost" data-add-list="${listKey}" data-empty='${JSON.stringify(emptyItem)}' style="margin-top:10px;width:auto">+ Yeni ekle</button>
      </div>`;
  }

  function renderServices() {
    return renderListPanel('Hizmetler', 'services', (s, i) => listItemEditor(s, `
      ${field('İkon', `<input data-list="services" data-i="${i}" data-k="icon" value="${s.icon || ''}" />`)}
      ${field('Başlık', `<input data-list="services" data-i="${i}" data-k="title" value="${s.title || ''}" />`)}
      ${field('Metin', `<textarea data-list="services" data-i="${i}" data-k="text">${s.text || ''}</textarea>`)}
    `, i, 'services'), { id: uid(), icon: '✨', title: '', text: '' });
  }

  function renderPackages() {
    return renderListPanel('Düğün paketleri', 'packages', (p, i) => listItemEditor(p, `
      ${field('İkon', `<input data-list="packages" data-i="${i}" data-k="icon" value="${p.icon || '💍'}" />`)}
      ${field('Başlık', `<input data-list="packages" data-i="${i}" data-k="title" value="${p.title || ''}" />`)}
      ${field('Açıklama', `<textarea data-list="packages" data-i="${i}" data-k="text">${p.text || ''}</textarea>`)}
      ${field('Fiyat (opsiyonel)', `<input data-list="packages" data-i="${i}" data-k="price" value="${p.price || ''}" placeholder="ör: 300 kişi — teklif üzerine" />`)}
    `, i, 'packages'), { id: uid(), icon: '💍', title: '', text: '', price: '' });
  }

  function renderShowcase() {
    const sh = content.showcase;
    return `
      <div class="card">
        ${field('Bölüm etiketi', `<input data-c="showcase.tag" value="${sh.tag || ''}" />`)}
        ${field('Başlık', `<input data-c="showcase.title" value="${sh.title || ''}" />`)}
        ${field('Başlık vurgu', `<input data-c="showcase.titleEm" value="${sh.titleEm || ''}" />`)}
        ${field('Açıklama', `<textarea data-c="showcase.description">${sh.description || ''}</textarea>`)}
      </div>
      ${renderListPanel('Lezzet kartları', 'showcase.items', (item, i) => listItemEditor(item, `
        ${field('Görsel', `<input data-list="showcase.items" data-i="${i}" data-k="image" value="${item.image || ''}" />`)}
        ${field('Görsel alt', `<input data-list="showcase.items" data-i="${i}" data-k="imageAlt" value="${item.imageAlt || ''}" />`)}
        ${field('Başlık', `<input data-list="showcase.items" data-i="${i}" data-k="title" value="${item.title || ''}" />`)}
        ${field('Metin', `<textarea data-list="showcase.items" data-i="${i}" data-k="text">${item.text || ''}</textarea>`)}
      `, i, 'showcase.items'), { id: uid(), image: '', imageAlt: '', title: '', text: '' })}
    `;
  }

  function renderGallery() {
    const g = content.gallery;
    return `
      <div class="card">
        ${field('Etiket', `<input data-c="gallery.tag" value="${g.tag || ''}" />`)}
        ${field('Başlık', `<input data-c="gallery.title" value="${g.title || ''}" />`)}
        ${field('Vurgu', `<input data-c="gallery.titleEm" value="${g.titleEm || ''}" />`)}
        ${field('Açıklama', `<textarea data-c="gallery.description">${g.description || ''}</textarea>`)}
      </div>
      ${renderListPanel('Galeri fotoğrafları (sıra = sitedeki sıra)', 'gallery.items', (item, i) => listItemEditor(item, `
        ${field('Dosya yolu', `<input data-list="gallery.items" data-i="${i}" data-k="src" value="${item.src || ''}" />`)}
        ${field('Alt metin', `<input data-list="gallery.items" data-i="${i}" data-k="alt" value="${item.alt || ''}" />`)}
        ${item.src ? `<img src="/${item.src.replace(/^\//,'')}" style="max-width:120px;border-radius:8px;margin-top:8px" />` : ''}
      `, i, 'gallery.items'), { id: uid(), src: '', alt: '' })}
    `;
  }

  function renderAbout() {
    const a = content.about;
    return `
      <div class="card">
        <div class="grid-2">
          ${field('Etiket', `<input data-c="about.tag" value="${a.tag || ''}" />`)}
          ${field('Başlık', `<input data-c="about.title" value="${a.title || ''}" />`)}
          ${field('Vurgu', `<input data-c="about.titleEm" value="${a.titleEm || ''}" />`)}
        </div>
        ${field('Paragraf', `<textarea data-c="about.body">${a.body || ''}</textarea>`)}
        ${field('Görsel', `<input data-c="about.image.src" value="${a.image?.src || ''}" />`)}
        ${field('Görsel alt', `<input data-c="about.image.alt" value="${a.image?.alt || ''}" />`)}
      </div>`;
  }

  function renderTestimonials() {
    const t = content.testimonials || {};
    return `
      <div class="card"><h3>Google yorumları</h3>
        ${field('Başlık altı not', `<input data-c="testimonials.googleNote" value="${t.googleNote || 'Gerçek Google yorumları'}" />`)}
        ${field('Kart rozeti', `<input data-c="testimonials.googleBadge" value="${t.googleBadge || 'Google Yorumu'}" />`)}
        ${field('Google yorumlar linki (isteğe bağlı)', `<input data-c="testimonials.googleReviewsUrl" value="${t.googleReviewsUrl || ''}" placeholder="https://g.page/..." />`)}
      </div>
      ${renderListPanel('Müşteri yorumları', 'testimonials.items', (item, i) => listItemEditor(item, `
      ${field('Yıldız (1-5)', `<input type="number" min="1" max="5" data-list="testimonials.items" data-i="${i}" data-k="stars" value="${item.stars || 5}" />`)}
      ${field('Yorum', `<textarea data-list="testimonials.items" data-i="${i}" data-k="text">${item.text || ''}</textarea>`)}
      ${field('İsim', `<input data-list="testimonials.items" data-i="${i}" data-k="name" value="${item.name || ''}" />`)}
      ${field('Baş harfler', `<input data-list="testimonials.items" data-i="${i}" data-k="initials" value="${item.initials || ''}" maxlength="3" />`)}
    `, i, 'testimonials.items'), { id: uid(), stars: 5, text: '', name: '', initials: 'AA' })}`;
  }

  function renderWhy() {
    const w = content.whyUs;
    return `
      <div class="card">
        ${field('Alıntı', `<input data-c="whyUs.quote" value="${w.quote || ''}" />`)}
        ${field('Görsel', `<input data-c="whyUs.image.src" value="${w.image?.src || ''}" />`)}
      </div>
      ${renderListPanel('Neden biz maddeleri', 'whyUs.items', (item, i) => listItemEditor(item, `
        ${field('Başlık', `<input data-list="whyUs.items" data-i="${i}" data-k="title" value="${item.title || ''}" />`)}
        ${field('Metin', `<textarea data-list="whyUs.items" data-i="${i}" data-k="text">${item.text || ''}</textarea>`)}
      `, i, 'whyUs.items'), { id: uid(), title: '', text: '' })}
    `;
  }

  function renderSeo() {
    const m = content.meta;
    const f = content.footer;
    const ls = content.localSeo || {};
    const seo = content.seo || {};
    return `
      <div class="card"><h3>SEO (Google)</h3>
        <p style="color:var(--muted);font-size:.85rem">Hedef: Isparta düğün catering, personel temini, garson temini</p>
        ${field('Sayfa başlığı', `<input data-c="meta.title" value="${m.title || ''}" />`)}
        ${field('Açıklama (max ~160 karakter)', `<textarea data-c="meta.description">${m.description || ''}</textarea>`)}
        ${field('Anahtar kelimeler', `<input data-c="meta.keywords" value="${m.keywords || ''}" />`)}
        ${field('Site adresi', `<input data-c="seo.siteUrl" value="${seo.siteUrl || 'https://www.geses.com.tr'}" />`)}
        ${field('Paylaşım görseli (Google arama küçük resmi)', `<input data-c="seo.ogImage" value="${seo.ogImage || 'assets/og-share.jpg'}" placeholder="assets/og-share.jpg" />`)}
        ${field('Görsel alt metni', `<input data-c="seo.ogImageAlt" value="${seo.ogImageAlt || 'Meşhur Isparta kabune pilavı — GESES geleneksel düğün yemeği'}" />`)}
      </div>
      <div class="card"><h3>Yerel SEO metni</h3>
        ${field('Bölüm başlığı', `<input data-c="localSeo.heading" value="${ls.heading || ''}" />`)}
        ${field('Paragraf 1', `<textarea data-c="localSeo.paragraphs.0">${(ls.paragraphs && ls.paragraphs[0]) || ''}</textarea>`)}
        ${field('Paragraf 2', `<textarea data-c="localSeo.paragraphs.1">${(ls.paragraphs && ls.paragraphs[1]) || ''}</textarea>`)}
        ${field('Paragraf 3', `<textarea data-c="localSeo.paragraphs.2">${(ls.paragraphs && ls.paragraphs[2]) || ''}</textarea>`)}
      </div>
      <div class="card"><h3>Footer</h3>
        ${field('Marka', `<input data-c="footer.brand" value="${f.brand || ''}" />`)}
        ${field('Alt satır', `<input data-c="footer.tagline" value="${f.tagline || ''}" />`)}
        ${field('Telif', `<input data-c="footer.copyright" value="${f.copyright || ''}" />`)}
      </div>`;
  }

  const panels = {
    general: { title: 'Genel Bilgiler', render: renderGeneral },
    media: { title: 'Medya Yükleme', render: renderMedia },
    gallery: { title: 'Galeri Sırası', render: renderGallery },
    hero: { title: 'Ana Sayfa (Hero)', render: renderHero },
    services: { title: 'Hizmetler', render: renderServices },
    packages: { title: 'Düğün Paketleri', render: renderPackages },
    showcase: { title: 'İmza Lezzetler', render: renderShowcase },
    about: { title: 'Hakkımızda', render: renderAbout },
    testimonials: { title: 'Referanslar', render: renderTestimonials },
    why: { title: 'Neden Biz', render: renderWhy },
    seo: { title: 'SEO & Footer', render: renderSeo },
  };

  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }

  function setByPath(obj, path, value) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (cur[keys[i]] == null) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

  function getList(path) {
    if (path.includes('.')) {
      const [a, b] = path.split('.');
      if (!content[a][b]) content[a][b] = [];
      return content[a][b];
    }
    if (!content[path]) content[path] = [];
    return content[path];
  }

  function syncInputsFromDOM() {
    $$('[data-c]').forEach((el) => {
      setByPath(content, el.dataset.c, el.value);
    });
    $$('[data-list]').forEach((el) => {
      const list = getList(el.dataset.list);
      const i = Number(el.dataset.i);
      const k = el.dataset.k;
      if (list[i]) list[i][k] = el.type === 'number' ? Number(el.value) : el.value;
    });
  }

  function bindPanelEvents() {
    $$('[data-c]').forEach((el) => {
      el.addEventListener('input', () => {
        setByPath(content, el.dataset.c, el.value);
        setSaveStatus('Kaydedilmemiş değişiklik', '');
      });
    });

    $$('[data-list]').forEach((el) => {
      el.addEventListener('input', () => {
        const list = getList(el.dataset.list);
        const i = Number(el.dataset.i);
        const k = el.dataset.k;
        if (!list[i]) return;
        list[i][k] = el.type === 'number' ? Number(el.value) : el.value;
        setSaveStatus('Kaydedilmemiş değişiklik', '');
      });
    });

    $$('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const list = getList(btn.dataset.remove);
        list.splice(Number(btn.dataset.index), 1);
        renderPanel(activePanel);
        setSaveStatus('Kaydedilmemiş değişiklik', '');
      });
    });

    $$('[data-add-list]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const list = getList(btn.dataset.addList);
        const empty = JSON.parse(btn.dataset.empty || '{}');
        list.push({ ...empty, id: empty.id || uid() });
        renderPanel(activePanel);
        setSaveStatus('Kaydedilmemiş değişiklik', '');
      });
    });

    // Sortable lists
    $$('.sort-list').forEach((listEl) => {
      const firstItem = listEl.querySelector('[data-list]');
      if (!firstItem) return;
      const listPath = firstItem.dataset.list;
      mountSortable(listEl, () => {
        const order = [...listEl.querySelectorAll('.sort-item')].map((el) => Number(el.dataset.index));
        const arr = getList(listPath);
        const reordered = order.map((i) => arr[i]).filter(Boolean);
        if (listPath.includes('.')) {
          const [a, b] = listPath.split('.');
          content[a][b] = reordered;
        } else {
          content[listPath] = reordered;
        }
        renderPanel(activePanel);
        setSaveStatus('Kaydedilmemiş değişiklik', '');
      });
    });

    // Media panel
    const dropzone = $('#dropzone');
    const fileInput = $('#fileInput');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) await handleUpload(e.dataTransfer.files);
      });
      fileInput.addEventListener('change', async () => {
        if (fileInput.files.length) await handleUpload(fileInput.files);
        fileInput.value = '';
      });
    }

    $$('[data-add-gallery]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const path = btn.dataset.addGallery;
        content.gallery.items.push({
          id: uid(),
          src: path,
          alt: 'GESES düğün yemekleri',
        });
        toast('Galeriye eklendi — Galeri sekmesinden sıralayın');
        setSaveStatus('Kaydedilmemiş değişiklik', '');
      });
    });

    $$('[data-del-media]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
        await api(`/api/upload/${btn.dataset.delMedia}`, { method: 'DELETE' });
        await loadMedia();
        renderPanel('media');
        toast('Dosya silindi');
      });
    });
  }

  async function handleUpload(files) {
    try {
      setSaveStatus('Yükleniyor...', '');
      await uploadFiles(files);
      renderPanel('media');
      toast(`${files.length} fotoğraf yüklendi`);
      setSaveStatus('Kaydedilmemiş değişiklik (galeriye eklemeyi unutmayın)', '');
    } catch (e) {
      toast(e.message, false);
    }
  }

  async function renderPanel(name) {
    activePanel = name;
    destroySortables();
    syncInputsFromDOM();
    if (name === 'media') await loadMedia();
    const panel = panels[name];
    if (!panel) return;
    $('#panelTitle').textContent = panel.title;
    $$('.sidebar-nav button').forEach((b) => b.classList.toggle('active', b.dataset.panel === name));
    $('#panelWrap').innerHTML = panel.render();
    bindPanelEvents();
  }

  function showApp(show) {
    $('#loginScreen').hidden = show;
    $('#app').hidden = !show;
  }

  async function bootApp() {
    showApp(true);
    await loadContent();
    await loadMedia();
    renderPanel('general');
  }

  // Login
  $('#loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#loginError');
    err.hidden = true;
    try {
      await login($('#loginPassword').value);
      await bootApp();
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });

  $('#logoutBtn')?.addEventListener('click', () => {
    token = '';
    sessionStorage.removeItem(TOKEN_KEY);
    showApp(false);
  });

  $('#saveBtn')?.addEventListener('click', async () => {
    try {
      syncInputsFromDOM();
      await saveContent();
    } catch (e) {
      setSaveStatus('Hata', 'err');
      toast(e.message, false);
    }
  });

  $$('.sidebar-nav button').forEach((btn) => {
    btn.addEventListener('click', () => renderPanel(btn.dataset.panel));
  });

  if (token) {
    bootApp().catch(() => {
      sessionStorage.removeItem(TOKEN_KEY);
      showApp(false);
    });
  } else {
    showApp(false);
  }
})();
