const $ = s => document.querySelector(s);
const root = document.documentElement;

// ---- build experience timeline ----
const tl = $('#timeline');
EXPERIENCE.forEach(e => {
  const li = document.createElement('li');
  li.innerHTML = `<p class="when" data-write></p><h3 class="role" data-write></h3><p class="org" data-write></p><ul class="pts">${e.pts.map(() => '<li data-write></li>').join('')}</ul>`;
  const [when, role, org] = li.querySelectorAll('.when, .role, .org');
  when.textContent = e.when; role.textContent = e.role; org.textContent = e.org;
  li.querySelectorAll('.pts li').forEach((p, i) => p.textContent = e.pts[i]);
  tl.append(li);
});

// ---- theme ----
const DEFAULT_THEME = { bg: '#f3ebe0', fg: '#3b2f2a', accent: '#9c6b43', panel: '#e8dccb' };
function setTheme(t) { for (const k of ['bg', 'fg', 'accent', 'panel']) root.style.setProperty('--' + k, t[k]); }

// ---- tabs ----
let current = null;
const tabs = [...document.querySelectorAll('.tab')];
const links = [...document.querySelectorAll('.tabs a')];
function show(name) {
  if (!tabs.some(t => t.dataset.tab === name)) name = 'home';
  if (name === current) return;
  current = name;
  tabs.forEach(t => {
    const on = t.dataset.tab === name;
    t.hidden = !on;
    t.querySelectorAll('[data-write]').forEach(el => on ? watch(el) : unwatch(el));
  });
  links.forEach(a => a.classList.toggle('on', a.dataset.tab === name));
  if (name !== 'projects') { closeProject(); setTheme(DEFAULT_THEME); }
  scrollTo(0, 0);
}
addEventListener('hashchange', () => show(location.hash.slice(1) || 'home'));

// ---- projects ----
const plist = $('#plist'), detail = $('#detail');
let openId = null, stopGraphic = null;
PROJECTS.forEach(p => {
  const li = document.createElement('li');
  const b = document.createElement('button'); b.type = 'button'; b.textContent = p.title; b.dataset.id = p.id;
  b.addEventListener('click', () => openProject(p.id));
  li.append(b); plist.append(li);
});
function closeProject() {
  stopGraphic?.(); stopGraphic = null; openId = null;
  detail.hidden = true; $('#d-stage').replaceChildren();
  plist.querySelectorAll('button').forEach(b => b.classList.remove('on'));
}
function openProject(id) {
  if (id === openId) return;
  const p = PROJECTS.find(x => x.id === id);
  const first = openId === null;
  openId = id;
  stopGraphic?.(); stopGraphic = null;
  plist.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.id === id));
  setTheme(p.theme);
  const fill = () => {
    detail.hidden = false;
    const title = $('#d-title'), sum = $('#d-sum'), stage = $('#d-stage'), lk = $('#d-links');
    [title, sum].forEach(el => { el._prepared = false; el.textContent = ''; });
    title.textContent = p.title; sum.textContent = p.summary;
    stage.replaceChildren();
    lk.replaceChildren();
    const add = (label, href, off) => { const a = document.createElement(href ? 'a' : 'span'); a.className = 'btn' + (off ? ' off' : ''); a.textContent = label; if (href) { a.href = href; a.target = '_blank'; a.rel = 'noopener'; } lk.append(a); };
    if (p.play) add('Play', p.play); else if (p.playNote) add(p.playNote, null, true);
    if (p.code) add('Code', p.code);
    hideNow(title); hideNow(sum);
    requestAnimationFrame(() => {
      writeIn(title, 1); writeIn(sum, 0.7);
      if (p.graphic) stopGraphic = GRAPHICS[p.graphic](stage);
    });
  };
  if (first || REDUCED) fill();
  else { writeOut($('#d-title'), .6); writeOut($('#d-sum'), .4); setTimeout(() => { if (openId === id) fill(); }, 450); }
}

// ---- brand + start ----
watch($('.brand'));
writeIn($('.brand'), 1);
show(location.hash.slice(1) || 'home');
