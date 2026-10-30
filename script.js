// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Demo: flag unusual activity in a row of hourly bars
const barsEl = document.getElementById('bars');
const msgEl = document.getElementById('scanMsg');
const btn = document.getElementById('scanBtn');
const HOURS = 24;
const THRESHOLD = 75; // percent of chart height

let values = [];

function makeData() {
  values = Array.from({ length: HOURS }, () => 20 + Math.random() * 35);
  // Add 2 or 3 spikes at random hours
  const spikes = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < spikes; i++) {
    values[Math.floor(Math.random() * HOURS)] = 82 + Math.random() * 16;
  }
}

function draw() {
  barsEl.innerHTML = '';
  barsEl.classList.remove('scanned');
  const line = document.createElement('div');
  line.className = 'threshold';
  line.style.bottom = THRESHOLD + '%';
  barsEl.appendChild(line);
  values.forEach((v, i) => {
    const b = document.createElement('div');
    b.className = 'bar';
    b.style.height = v + '%';
    b.title = 'Hour ' + i + ': ' + Math.round(v) + '% activity';
    barsEl.appendChild(b);
  });
  msgEl.textContent = 'Each bar is one hour of network activity. Run the scan to flag unusual spikes.';
  btn.textContent = 'Run scan';
}

btn.addEventListener('click', () => {
  if (barsEl.classList.contains('scanned')) {
    makeData();
    draw();
    return;
  }
  let count = 0;
  barsEl.querySelectorAll('.bar').forEach((bar, i) => {
    if (values[i] > THRESHOLD) { bar.classList.add('flag'); count++; }
  });
  barsEl.classList.add('scanned');
  msgEl.textContent = count + ' unusual spikes found above the dashed line. Select "New data" to try again.';
  btn.textContent = 'New data';
});

makeData();
draw();


/* ---------- Documents ----------
   To show a file to EVERY visitor:
   1. Put the file in a folder named "documents" next to index.html.
   2. Add a line to SITE_DOCS below, for example:
      { title: 'Cybersecurity and Digital Forensics', file: 'documents/cybersecurity-forensics.pdf', note: 'Research paper' }
   Files added with the "Add a document" button are saved only in your own browser. */
const SITE_DOCS = [
];

const docListEl = document.getElementById('docList');
const docInput = document.getElementById('docFile');
const docNote = document.getElementById('docNote');
let db = null;

function openDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('portfolio-docs', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('docs', { keyPath: 'id', autoIncrement: true });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) { resolve(null); }
  });
}
function store(mode) { return db.transaction('docs', mode).objectStore('docs'); }
function getAllLocal() {
  return new Promise((resolve) => {
    if (!db) return resolve([]);
    const r = store('readonly').getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => resolve([]);
  });
}
function putLocal(rec) {
  return new Promise((resolve) => {
    if (!db) return resolve(false);
    const r = store('readwrite').add(rec);
    r.onsuccess = () => resolve(true);
    r.onerror = () => resolve(false);
  });
}
function deleteLocal(id) {
  return new Promise((resolve) => {
    const r = store('readwrite').delete(id);
    r.onsuccess = r.onerror = () => resolve();
  });
}
function formatSize(bytes) {
  return bytes > 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

async function renderDocs() {
  const local = await getAllLocal();
  docListEl.innerHTML = '';
  if (!SITE_DOCS.length && !local.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No documents yet. Select "Add a document" to add your first file.';
    docListEl.appendChild(li);
    return;
  }
  SITE_DOCS.forEach((d) => {
    const li = document.createElement('li');
    li.innerHTML = '<h3></h3><p></p><div class="doc-actions"><a target="_blank" rel="noopener">Open</a></div>';
    li.querySelector('h3').textContent = d.title;
    li.querySelector('p').textContent = d.note || '';
    li.querySelector('a').href = d.file;
    docListEl.appendChild(li);
  });
  local.forEach((d) => {
    const url = URL.createObjectURL(d.file);
    const li = document.createElement('li');
    li.innerHTML = '<h3></h3><p></p><div class="doc-actions"><a target="_blank" rel="noopener">Open</a><button class="link-btn" type="button">Remove</button></div>';
    li.querySelector('h3').textContent = d.title;
    li.querySelector('p').textContent = 'Added by you, ' + formatSize(d.file.size) + ' (this browser only)';
    li.querySelector('a').href = url;
    li.querySelector('button').addEventListener('click', async () => {
      await deleteLocal(d.id);
      renderDocs();
    });
    docListEl.appendChild(li);
  });
}

docInput.addEventListener('change', async () => {
  let failed = 0;
  for (const file of docInput.files) {
    const ok = await putLocal({ title: file.name.replace(/\.[^.]+$/, ''), file });
    if (!ok) failed++;
  }
  docInput.value = '';
  docNote.textContent = failed
    ? 'Could not save ' + failed + ' file(s). Your browser may be blocking storage. Use the SITE_DOCS steps in script.js instead.'
    : 'Saved in this browser only. To show a file to every visitor, follow the steps in script.js.';
  renderDocs();
});

openDB().then((d) => { db = d; renderDocs(); });


/* ---------- Gallery ----------
   1. Put your photos in the "images" folder next to index.html.
   2. Add one line per photo below, for example:
      { src: 'images/graduation.jpg', alt: 'Me at the university campus', caption: 'Kalinga University campus' }
   Your portrait goes in the same folder and must be named profile.jpg. */
const GALLERY = [
];

const gridEl = document.getElementById('gallery-grid');
const box = document.getElementById('lightbox');
const boxImg = document.getElementById('lightboxImg');
const boxCap = document.getElementById('lightboxCap');

if (!GALLERY.length) {
  const li = document.createElement('li');
  li.className = 'gallery-empty';
  li.textContent = 'Photos coming soon.';
  gridEl.appendChild(li);
}
GALLERY.forEach((p) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'shot';
  const img = document.createElement('img');
  img.src = p.src;
  img.alt = p.alt || p.caption || '';
  img.loading = 'lazy';
  b.appendChild(img);
  if (p.caption) {
    const s = document.createElement('span');
    s.textContent = p.caption;
    b.appendChild(s);
  }
  b.addEventListener('click', () => {
    boxImg.src = p.src;
    boxImg.alt = img.alt;
    boxCap.textContent = p.caption || '';
    box.showModal();
  });
  li.appendChild(b);
  gridEl.appendChild(li);
});
document.getElementById('lightboxClose').addEventListener('click', () => box.close());
box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
