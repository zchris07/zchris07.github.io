const $ = s => document.querySelector(s);
const root = document.documentElement;

// ---- experience timeline ----
const tl = $('#timeline');
EXPERIENCE.forEach(e => {
  const li = document.createElement('li');
  li.innerHTML = `<p class="when" data-write></p><h3 class="role" data-write></h3><p class="org" data-write></p><ul class="pts">${e.pts.map(() => '<li data-write></li>').join('')}</ul>`;
  li.querySelector('.when').textContent = e.when;
  li.querySelector('.role').textContent = e.role;
  li.querySelector('.org').textContent = e.org;
  li.querySelectorAll('.pts li').forEach((p, i) => p.textContent = e.pts[i]);
  tl.append(li);
});

// ---- scroll-driven theme ----
function setTheme(t) { for (const k of ['bg', 'fg', 'accent', 'panel']) root.style.setProperty('--' + k, t[k]); }
const secs = ['hero', 'experience', 'projects'].map(id => document.getElementById(id));
const navLinks = [...document.querySelectorAll('.links a')];
let openId = null, stopMedia = null, lastKey = null, queued = false;

function currentSection() {
  const mid = innerHeight * 0.5;
  return secs.find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; }) || secs[0];
}
function sync() {
  queued = false;
  const sec = currentSection();
  const key = sec.id === 'projects' && openId ? 'p:' + openId : sec.id;
  navLinks.forEach(a => a.classList.toggle('on', a.dataset.sec === sec.id));
  if (key === lastKey) return;
  lastKey = key;
  setTheme(sec.id === 'projects' && openId ? PROJECTS.find(p => p.id === openId).theme : THEMES[sec.id]);
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(sync); } }, { passive: true });
addEventListener('resize', sync);

// ---- project list: magnification by proximity to the cursor ----
const plist = $('#plist');
const items = [];
PROJECTS.forEach(p => {
  const li = document.createElement('li');
  const b = document.createElement('button'); b.type = 'button'; b.textContent = p.title; b.dataset.id = p.id;
  b.addEventListener('click', () => openProject(p.id));
  li.append(b); plist.append(li); items.push({ li, b });
});
const RADIUS = 55, GAIN = 0.45;   // pixels of reach; extra scale at the cursor (1 + GAIN). At most three names grow.
let geo = [], mouseY = null, frame = 0;
function measure() {
  const top = plist.getBoundingClientRect().top;
  geo = items.map(({ li }) => { const r = li.getBoundingClientRect(); return { c: r.top - top + r.height / 2, h: r.height }; });
}
function magnify() {
  frame = 0;
  if (mouseY === null) { items.forEach(({ b }) => { b.style.transform = ''; }); return; }
  let k = 0; geo.forEach((g, i) => { if (Math.abs(mouseY - g.c) < Math.abs(mouseY - geo[k].c)) k = i; });
  const s = geo.map((g, i) => Math.abs(i - k) <= 1 ? 1 + GAIN * Math.exp(-(((mouseY - g.c) / RADIUS) ** 2)) : 1);
  const grow = geo.map((g, i) => g.h * (s[i] - 1));
  const before = i => grow.slice(0, i).reduce((a, b) => a + b, 0);
  const ref = before(k) + grow[k] / 2;           // keeps the name under the cursor in place
  items.forEach(({ b }, i) => { b.style.transform = `translateY(${(before(i) + grow[i] / 2 - ref).toFixed(1)}px) scale(${s[i].toFixed(3)})`; });
}
const queue = () => { if (!frame) frame = requestAnimationFrame(magnify); };
plist.addEventListener('pointerenter', measure);
plist.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; if (!geo.length) measure(); mouseY = e.clientY - plist.getBoundingClientRect().top; queue(); });
plist.addEventListener('pointerleave', () => { mouseY = null; queue(); });
addEventListener('resize', () => { geo = []; });

// ---- project detail with real captures ----
const detail = $('#detail'), hint = $('#hint');
function buildMedia(p) {
  stopMedia?.(); stopMedia = null;
  const main = $('#m-main'), thumbs = $('#m-thumbs');
  main.replaceChildren(); thumbs.replaceChildren();
  const m = p.media || {};
  const entries = [];
  if (m.video) entries.push({ kind: 'video', src: m.video, poster: (m.shots || [])[0] });
  (m.shots || []).forEach(s => entries.push({ kind: 'img', src: s }));
  if (!entries.length) return;
  const show = i => {
    main.replaceChildren();
    const e = entries[i];
    let node;
    if (e.kind === 'video') {
      node = document.createElement('video');
      node.muted = true; node.loop = true; node.autoplay = true; node.playsInline = true; node.controls = false;
      node.setAttribute('muted', ''); node.poster = e.poster || ''; node.src = e.src;
      node.addEventListener('error', () => { if (e.poster) { const im = document.createElement('img'); im.src = e.poster; im.alt = p.title + ' screenshot'; node.replaceWith(im); } });
      node.addEventListener('click', () => node.paused ? node.play() : node.pause());
      node.play?.().catch(() => {});
    } else {
      node = document.createElement('img'); node.src = e.src; node.alt = p.title + ' screenshot'; node.loading = 'lazy';
    }
    main.append(node);
    [...thumbs.children].forEach((t, j) => t.classList.toggle('on', j === i));
  };
  entries.forEach((e, i) => {
    const t = document.createElement('button'); t.type = 'button'; t.className = 'thumb';
    t.setAttribute('aria-label', e.kind === 'video' ? 'Play recording' : 'Show screenshot ' + (i + (m.video ? 0 : 1)));
    const im = document.createElement('img'); im.src = e.kind === 'video' ? e.poster : e.src; im.alt = ''; t.append(im);
    if (e.kind === 'video') { const pl = document.createElement('span'); pl.className = 'play'; pl.textContent = '▶'; t.append(pl); }
    t.addEventListener('click', () => show(i));
    thumbs.append(t);
  });
  show(0);
  stopMedia = () => main.querySelector('video')?.pause();
}
function openProject(id) {
  if (id === openId) return;
  const p = PROJECTS.find(x => x.id === id);
  const first = openId === null;
  openId = id;
  plist.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.id === id));
  sync();
  const fill = () => {
    hint.hidden = true; detail.hidden = false;
    const title = $('#d-title'), sum = $('#d-sum'), lk = $('#d-links');
    [title, sum].forEach(el => { el._prepared = false; el.textContent = ''; });
    title.textContent = p.title; sum.textContent = p.summary;
    lk.replaceChildren();
    const add = (label, href, off) => { const a = document.createElement(href ? 'a' : 'span'); a.className = 'btn' + (off ? ' off' : ''); a.textContent = label; if (href) { a.href = href; a.target = '_blank'; a.rel = 'noopener'; } lk.append(a); };
    if (p.play) add('Play', p.play); else if (p.playNote) add(p.playNote, null, true);
    if (p.code) add('Code', p.code);
    buildMedia(p);
    hideNow(title); hideNow(sum);
    requestAnimationFrame(() => { writeIn(title, 1); writeIn(sum, 0.7); });
  };
  if (first || REDUCED) fill();
  else { writeOut($('#d-title'), .6); writeOut($('#d-sum'), .4); setTimeout(() => { if (openId === id) fill(); }, 450); }
}

// ---- hero quote: written in a second after the job title ----
const quote = $('#quote');
prepare(quote); hideNow(quote);
let quoteTimer = null;
new IntersectionObserver(es => es.forEach(e => {
  clearTimeout(quoteTimer);
  if (e.isIntersecting) quoteTimer = setTimeout(() => writeIn(quote, 1), 1200);
  else if (quote._state === 'in') writeOut(quote, 0.5);
}), { threshold: 0.4 }).observe(quote);

// ---- start ----
document.querySelectorAll('[data-write]').forEach(watch);
sync();
