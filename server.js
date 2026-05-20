/**
 * GESES site + CMS API
 * npm start → http://localhost:8765 (site) + http://localhost:8765/admin
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8765;
const CONTENT_PATH = path.join(ROOT, 'data', 'content.json');
const CONTENT_DEFAULT = path.join(ROOT, 'data', 'content.default.json');
const UPLOADS_DIR = path.join(ROOT, 'assets', 'uploads');
const AUTH_PATH = path.join(ROOT, 'data', 'cms-auth.json');

const CMS_PASSWORD = process.env.CMS_PASSWORD || 'geses2025';
const sessions = new Map();

function ensureContent() {
  if (!fs.existsSync(CONTENT_PATH) && fs.existsSync(CONTENT_DEFAULT)) {
    fs.mkdirSync(path.dirname(CONTENT_PATH), { recursive: true });
    fs.copyFileSync(CONTENT_DEFAULT, CONTENT_PATH);
  }
}

function readContent() {
  ensureContent();
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
}

function writeContent(data) {
  fs.mkdirSync(path.dirname(CONTENT_PATH), { recursive: true });
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Oturum gerekli' });
  }
  next();
}

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safe = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error('Sadece görsel dosyaları yüklenebilir'), ok);
  },
});

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/api/content', (_req, res) => {
  try {
    res.json(readContent());
  } catch (e) {
    res.status(500).json({ error: 'İçerik okunamadı' });
  }
});

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== CMS_PASSWORD) {
    return res.status(401).json({ error: 'Şifre hatalı' });
  }
  const token = newToken();
  sessions.set(token, { at: Date.now() });
  res.json({ token });
});

app.put('/api/content', authMiddleware, (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Geçersiz içerik' });
    }
    writeContent(req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Kayıt başarısız' });
  }
});

app.post('/api/upload', authMiddleware, upload.array('files', 20), (req, res) => {
  const files = (req.files || []).map((f) => ({
    path: `assets/uploads/${f.filename}`,
    name: f.filename,
    size: f.size,
  }));
  res.json({ files });
});

app.get('/api/media', authMiddleware, (_req, res) => {
  const list = [];
  const scan = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (!fs.statSync(full).isFile()) continue;
      if (!/\.(jpe?g|png|webp|gif)$/i.test(name)) continue;
      list.push({ path: `${prefix}/${name}`, name, size: fs.statSync(full).size });
    }
  };
  scan(UPLOADS_DIR, 'assets/uploads');
  scan(path.join(ROOT, 'assets', 'gallery'), 'assets/gallery');
  res.json({ items: list.sort((a, b) => b.name.localeCompare(a.name)) });
});

app.delete('/api/upload/:name', authMiddleware, (req, res) => {
  const file = path.join(UPLOADS_DIR, path.basename(req.params.name));
  if (!file.startsWith(UPLOADS_DIR)) return res.status(400).json({ error: 'Geçersiz dosya' });
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.json({ ok: true });
});

app.use('/admin', express.static(path.join(ROOT, 'admin')));
app.use(express.static(ROOT));

app.listen(PORT, '0.0.0.0', () => {
  ensureContent();
  console.log(`GESES site:  http://127.0.0.1:${PORT}`);
  console.log(`CMS panel:  http://127.0.0.1:${PORT}/admin`);
  console.log(`Varsayılan CMS şifresi: ${CMS_PASSWORD} (CMS_PASSWORD ile değiştirin)`);
});
