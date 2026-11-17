// The writing effect from football explained: every letter's outline is stroked on, then inked in; unwriting runs it
// backward while the letters drift loose.
//
// Built to be light:
//  - Short text (headings) is drawn letter by letter; long text is drawn a word at a time (one SVG node per word).
//  - All layout is read in one batch before any SVG is built, so the browser lays out once, not once per word.
//  - When a write-in finishes, the SVG copy is removed and the real text takes over, so scrolling stays cheap.
//  - Elements are written in once, the first time they are revealed; scrolling back up never replays them.
const SVGNS = 'http://www.w3.org/2000/svg';
const SPEED = 0.7;                       // 30% quicker than the original timing
const WORD_MS = 1000 / 60, LETTER_MS = 14, UNWRITE_MS = 625;
const LETTER_MODE_MAX = 36;              // characters; longer text is drawn word by word
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

// Builds the SVG copies for every word of `el`. Returns the delay of the last piece, in ms (already scaled by k).
function overlays(el, kind, k) {
  const words = [...el.querySelectorAll('.w')];
  words.forEach(w => w.querySelector('svg')?.remove());
  const letters = el.textContent.length <= LETTER_MODE_MAX;
  // 1) one write pass: a zero-size probe in each word marks its baseline
  const probes = words.map(w => { const p = document.createElement('span'); p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; w.firstChild.append(p); return p; });
  // 2) one read pass: every box and baseline at once (a single layout)
  const geo = words.map((w, i) => { const b = w.getBoundingClientRect(); return { width: b.width, height: b.height, base: probes[i].getBoundingClientRect().top - b.top, size: parseFloat(getComputedStyle(w).fontSize) }; });
  probes.forEach(p => p.remove());
  // 3) one write pass: build the SVG copies
  let last = 0;
  words.forEach((w, i) => {
    const g = geo[i];
    if (!g.width) return;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('width', g.width); svg.setAttribute('height', g.height); svg.setAttribute('aria-hidden', 'true');
    const text = w.firstChild.textContent;
    const mk = (s, x, width, idx) => {
      const t = document.createElementNS(SVGNS, 'text');
      t.setAttribute('class', kind === 'in' ? 'll' : 'lu'); t.setAttribute('x', x); t.setAttribute('y', g.base);
      t.textContent = s;
      t.style.setProperty('--len', Math.ceil(4 * (width + g.size * 0.8) + 10));
      const d = (i * WORD_MS + idx * LETTER_MS) * k;
      last = Math.max(last, d);
      t.style.setProperty('--d', `${Math.round(d)}ms`); t.style.setProperty('--k', k);
      if (kind === 'out') {
        const r = (a, b) => (a + Math.random() * (b - a)).toFixed(1);
        t.style.setProperty('--dx', `${r(-3, 3)}px`); t.style.setProperty('--dy', `${r(-7, -2)}px`); t.style.setProperty('--r', `${r(-10, 10)}deg`);
      }
      svg.append(t);
    };
    if (!letters) mk(text, 0, g.width, 0);
    else {
      // Each letter goes exactly where the whole word would put it, so spacing and kerning are kept.
      const whole = document.createElementNS(SVGNS, 'text');
      whole.setAttribute('x', 0); whole.setAttribute('y', g.base); whole.textContent = text;
      svg.append(whole); w.append(svg);
      let at = 0;
      const segs = (segmenter ? [...segmenter.segment(text)].map(x => x.segment) : [...text]).map(s => { const r = [at, s]; at += s.length; return r; });
      let j = 0;
      segs.filter(([, s]) => /\S/.test(s)).forEach(([idx, s]) => {
        let x = 0, cw = 0;
        try { x = whole.getStartPositionOfChar(idx).x; cw = whole.getExtentOfChar(idx).width; } catch (e) {}
        mk(s, x, cw, j++);
      });
      whole.remove();
      return;
    }
    w.append(svg);
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
  k *= SPEED;
  const words = el.querySelectorAll('.w');
  words.forEach(w => w.classList.remove('unwriting'));
  const last = overlays(el, 'in', k);
  words.forEach(w => w.classList.add('writing'));
  // Once the last letter is inked in, hand over to the real text and drop the SVG copies.
  timers.set(el, setTimeout(() => { if (el._state === 'in') clearWords(el); }, last + 700 * k + 60));
}
function writeOut(el, k = 1) {
  prepare(el);
  clearTimeout(timers.get(el));
  el._state = 'out';
  if (REDUCED) { el.classList.add('hid'); return; }
  k *= SPEED;
  const words = el.querySelectorAll('.w');
  words.forEach(w => w.classList.remove('writing'));
  const last = overlays(el, 'out', k);
  words.forEach(w => w.classList.add('unwriting'));
  timers.set(el, setTimeout(() => { if (el._state === 'out') { el.classList.add('hid'); clearWords(el); } }, last + UNWRITE_MS * k + 80));
}
// Hide an element's words immediately, ready to be written in later.
function hideNow(el) { prepare(el); clearTimeout(timers.get(el)); el._state = 'out'; clearWords(el); el.classList.add('hid'); }

// Text is written in once, the first time it is revealed. Scrolling back up leaves it as it is.
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && e.target._state !== 'in') { writeIn(e.target, 0.8); io.unobserve(e.target); }
  });
}, { threshold: 0.2 });
function watch(el) { prepare(el); if (!REDUCED) { hideNow(el); io.observe(el); } }
function unwatch(el) { io.unobserve(el); }

// Words must follow reflow: when the window is resized, any copies still on screen are dropped.
let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => document.querySelectorAll('.w.writing').forEach(w => { w.classList.remove('writing'); w.querySelector('svg')?.remove(); }), 150); });
