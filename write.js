// The writing effect from football explained ("stroop"): every letter's outline is stroked on, then inked in;
// unwriting runs it backward while the letters drift loose. Ported from football-explained/js/basics.js.
const SVGNS = 'http://www.w3.org/2000/svg';
const WORD_MS = 1000 / 60, LETTER_MS = 14, UNWRITE_MS = 625;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

// Wrap each word of an element in <span class="w"><span class="wt">word</span></span> (once).
function prepare(el) {
  if (el._prepared) return;
  el._prepared = true;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(part);
          else { const w = document.createElement('span'); w.className = 'w'; const t = document.createElement('span'); t.className = 'wt'; t.textContent = part; w.append(t); frag.append(w); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
  };
  walk(el);
}

function overlay(w, i, kind, k) {
  w.querySelector('svg')?.remove();
  const box = w.getBoundingClientRect();
  const { width, height } = box;
  if (!width) return 0;
  const probe = document.createElement('span');
  probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  w.firstChild.append(probe);
  const baseline = probe.getBoundingClientRect().top - box.top;
  probe.remove();
  const size = parseFloat(getComputedStyle(w).fontSize);
  const g = document.createElementNS(SVGNS, 'svg');
  g.setAttribute('width', width); g.setAttribute('height', height); g.setAttribute('aria-hidden', 'true');
  w.append(g);
  const mk = (attrs) => { const t = document.createElementNS(SVGNS, 'text'); for (const a in attrs) t.setAttribute(a, attrs[a]); g.append(t); return t; };
  const text = w.firstChild.textContent;
  const whole = mk({ x: 0, y: baseline });
  whole.textContent = text;
  let at = 0;
  const segs = (segmenter ? [...segmenter.segment(text)].map(x => x.segment) : [...text]).map(s => { const r = [at, s]; at += s.length; return r; });
  const pieces = segs.filter(([, s]) => /\S/.test(s)).map(([idx, s]) => {
    let x = 0, cw = 0;
    try { x = whole.getStartPositionOfChar(idx).x; cw = whole.getExtentOfChar(idx).width; } catch (e) {}
    return { s, x, w: cw };
  });
  whole.remove();
  let last = 0;
  pieces.forEach((pc, j) => {
    const t = mk({ class: kind === 'in' ? 'll' : 'lu', x: pc.x, y: baseline });
    t.textContent = pc.s;
    t.style.setProperty('--len', Math.ceil(4 * (pc.w + size * 0.8) + 10));
    const d = (i * WORD_MS + j * LETTER_MS) * k;
    last = Math.max(last, d);
    t.style.setProperty('--d', `${Math.round(d)}ms`);
    t.style.setProperty('--k', k);
    if (kind === 'out') {
      const r = (a, b) => (a + Math.random() * (b - a)).toFixed(1);
      t.style.setProperty('--dx', `${r(-3, 3)}px`); t.style.setProperty('--dy', `${r(-7, -2)}px`); t.style.setProperty('--r', `${r(-10, 10)}deg`);
    }
  });
  return last;
}

const timers = new WeakMap();
function clearWords(el) { el.querySelectorAll('.w').forEach(w => { w.classList.remove('writing', 'unwriting'); w.querySelector('svg')?.remove(); }); }

function writeIn(el, k = 1) {
  prepare(el);
  clearTimeout(timers.get(el));
  el.classList.remove('hid');
  el._state = 'in';
  if (REDUCED) return;
  el.querySelectorAll('.w').forEach((w, i) => { w.classList.remove('unwriting'); overlay(w, i, 'in', k); w.classList.add('writing'); });
}
function writeOut(el, k = 1) {
  prepare(el);
  clearTimeout(timers.get(el));
  el._state = 'out';
  if (REDUCED) { el.classList.add('hid'); return; }
  let last = 0;
  el.querySelectorAll('.w').forEach((w, i) => { w.classList.remove('writing'); last = Math.max(last, overlay(w, i, 'out', k)); w.classList.add('unwriting'); });
  timers.set(el, setTimeout(() => { if (el._state === 'out') { el.classList.add('hid'); clearWords(el); } }, last + UNWRITE_MS * k + 80));
}
// Hide an element's words immediately, ready to be written in later.
function hideNow(el) { prepare(el); clearTimeout(timers.get(el)); el._state = 'out'; clearWords(el); el.classList.add('hid'); }

// Write in as elements first enter the viewport.
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    const el = e.target;
    if (!el.offsetParent && !e.isIntersecting) return;
    // Text is written in once, the first time it is revealed. Scrolling back up leaves it as it is.
    if (e.isIntersecting && el._state !== 'in') writeIn(el, 0.8);
  });
}, { threshold: 0.2 });
function watch(el) { prepare(el); if (!REDUCED) { hideNow(el); io.observe(el); } }
function unwatch(el) { io.unobserve(el); }

// Words must follow reflow: when the window resizes, drop the overlays so the real text shows.
addEventListener('resize', () => document.querySelectorAll('.w.writing').forEach(w => { w.classList.remove('writing'); w.querySelector('svg')?.remove(); }));
