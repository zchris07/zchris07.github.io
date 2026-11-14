// Live graphics for each project. Each returns a stop() function. Colors are read from the page theme.
const GRAPHICS = {};
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function canvasIn(stage, w = 760, h = 427) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const c = document.createElement('canvas');
  c.width = w * dpr; c.height = h * dpr;
  stage.append(c);
  const g = c.getContext('2d'); g.scale(dpr, dpr);
  return { c, g, w, h };
}
function loop(fn) {
  let id, t0 = performance.now(), dead = false;
  const f = now => { if (dead) return; fn((now - t0) / 1000); id = requestAnimationFrame(f); };
  id = requestAnimationFrame(f);
  return () => { dead = true; cancelAnimationFrame(id); };
}

// football: a pass play on the field.
GRAPHICS.football = stage => {
  const { g, w, h } = canvasIn(stage);
  const T = 6;
  return loop(t => {
    const p = (t % T) / T;
    g.fillStyle = '#5d7a45'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 60, h); g.fillRect(w - 60, 0, 60, h);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2;
    for (let x = 60; x <= w - 60; x += (w - 120) / 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    const los = w * 0.36;
    g.strokeStyle = '#2f5f8a'; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(los, 0); g.lineTo(los, h); g.stroke(); g.setLineDash([]);
    const ease = x => x * x * (3 - 2 * x), clamp = x => Math.min(1, Math.max(0, x));
    // offense (dark) and defense (yellow)
    const off = [[0, .5], [-30, .5], [-30, .36], [-30, .64], [-30, .22], [-30, .78], [-70, .5]];
    const dot = (x, y, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); };
    const run = clamp((p - .15) / .35);
    off.forEach(([dx, fy], i) => {
      let x = los + dx, y = h * fy;
      if (i === 5) { x += ease(run) * 190; y -= ease(run) * 20; }          // receiver
      if (i === 6) { x -= 20 * ease(clamp(p / .2)); }                      // QB drop back
      dot(x, y, '#2e2a26');
    });
    for (let i = 0; i < 6; i++) dot(los + 40 + (i % 2) * 14 + ease(clamp(p / .6)) * 20 * (i < 3 ? 1 : 2), h * (.2 + i * .12), '#d9a900');
    // the ball: held, thrown, caught
    const qb = [los - 90 - 20 * ease(clamp(p / .2)), h * .5], wr = [los - 30 + ease(run) * 190 + 190 * 0, h * .78 - ease(run) * 20];
    const th = clamp((p - .45) / .3);
    let bx = qb[0], by = qb[1];
    if (th > 0) { const tx = los + 160, ty = h * .78 - 20; bx = qb[0] + (tx - qb[0]) * ease(th); by = qb[1] + (ty - qb[1]) * ease(th) - Math.sin(th * Math.PI) * 70; }
    g.fillStyle = '#6b3e1f'; g.beginPath(); g.ellipse(bx, by, 8, 5, th * 4, 0, 7); g.fill();
  });
};

// freestyle: scrolling bar grid with colored rhyme cells and a playhead.
GRAPHICS.freestyle = stage => {
  const { g, w, h } = canvasIn(stage);
  const cols = ['#1ed760', '#ffa42b', '#539df5', '#f3727f'];
  const words = ['flow', 'go', 'know', 'show', 'light', 'night', 'right', 'sight'];
  return loop(t => {
    g.fillStyle = '#191414'; g.fillRect(0, 0, w, h);
    const beat = 0.5, cell = 90, ph = w * .3, off = (t / beat) * cell;
    for (let row = 0; row < 4; row++) {
      for (let i = -1; i < w / cell + 2; i++) {
        const idx = Math.floor((off + i * cell) / cell) , x = i * cell - (off % cell);
        const hit = (Math.abs(idx) + row) % 4 === 3;
        const y = 40 + row * 74;
        g.lineWidth = 2;
        g.strokeStyle = hit ? cols[(Math.abs(idx) >> 2) % 4] : '#282828';
        g.fillStyle = '#1f1f1f';
        g.beginPath(); g.roundRect(x + 4, y, cell - 8, 56, 8); g.fill(); g.stroke();
        if (hit) { g.fillStyle = cols[(Math.abs(idx) >> 2) % 4]; g.font = '600 18px Fraunces, Georgia, serif'; g.textAlign = 'center'; g.fillText(words[(Math.abs(idx) + row) % 8], x + cell / 2, y + 34); }
      }
    }
    const pulse = 1 - ((t / beat) % 1);
    g.fillStyle = `rgba(30,215,96,${.5 + pulse * .5})`; g.fillRect(ph - 1.5, 20, 3, h - 40);
    g.fillStyle = '#b3b3b3'; g.font = '14px Fraunces, Georgia, serif'; g.textAlign = 'left'; g.fillText('92 BPM · 32 bars', 16, h - 12);
  });
};

// jade mandarin: sentence → word → character, cycling automatically.
GRAPHICS.jade = stage => {
  const S = [{ w: ['我', '喜欢', '学习', '中文'], py: ['wǒ', 'xǐhuan', 'xuéxí', 'zhōngwén'], en: ['I', 'like', 'to study', 'Chinese'] }];
  const s = S[0];
  const el = document.createElement('div'); el.className = 'jade-demo';
  const zh = document.createElement('div'); zh.className = 'zh';
  const py = document.createElement('div'); py.className = 'py';
  const en = document.createElement('div'); en.className = 'en';
  const chars = [];
  s.w.forEach((word, wi) => [...word].forEach(ch => { const sp = document.createElement('span'); sp.textContent = ch; sp.dataset.w = wi; zh.append(sp); chars.push(sp); }));
  el.append(zh, py, en); stage.append(el);
  let step = 0;
  const tick = () => {
    const n = step % (s.w.length * 3 + 2);
    chars.forEach(c => c.className = '');
    py.textContent = ''; en.textContent = '';
    if (n >= 2) {
      const k = Math.floor((n - 2) / 3), phase = (n - 2) % 3, wi = k;
      chars.filter(c => +c.dataset.w === wi).forEach(c => c.className = 'word');
      py.textContent = s.py[wi]; en.textContent = s.en[wi];
      if (phase === 2) { const cs = chars.filter(c => +c.dataset.w === wi); cs.forEach(c => c.className = 'ch'); }
    } else { chars.forEach(c => c.className = 'word'); en.textContent = 'I like to study Chinese.'; py.textContent = 'wǒ xǐhuan xuéxí zhōngwén'; }
    step++;
  };
  tick(); const id = setInterval(tick, 1100);
  return () => clearInterval(id);
};

// manhunt: flashlight in the fog.
GRAPHICS.manhunt = stage => {
  const { g, w, h } = canvasIn(stage);
  const trees = Array.from({ length: 26 }, (_, i) => [(i * 137) % w, (i * 71 + 40) % h, 10 + (i % 4) * 4]);
  const gens = [[w * .72, h * .3], [w * .25, h * .7], [w * .6, h * .78]];
  return loop(t => {
    const px = w * .5 + Math.cos(t * .5) * w * .28, py = h * .5 + Math.sin(t * .8) * h * .26;
    const ang = Math.atan2(Math.cos(t * .8) * h * .26 * .8, -Math.sin(t * .5) * w * .28 * .5) + Math.sin(t * 1.3) * .25;
    g.fillStyle = '#0a0b0a'; g.fillRect(0, 0, w, h);
    // faint layout in the fog
    g.fillStyle = '#131512'; trees.forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    // the beam
    g.save(); g.beginPath(); g.moveTo(px, py); g.arc(px, py, 230, ang - .35, ang + .35); g.closePath(); g.clip();
    const gr = g.createRadialGradient(px, py, 10, px, py, 230); gr.addColorStop(0, 'rgba(235,225,190,.55)'); gr.addColorStop(1, 'rgba(235,225,190,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a4a36'; trees.forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    gens.forEach(([x, y], i) => { g.fillStyle = (Math.sin(t * 3 + i) > 0) ? '#e0b34a' : '#7a6330'; g.fillRect(x - 9, y - 9, 18, 18); });
    // the killer, only visible inside the beam
    const kx = w * .5 + Math.cos(t * .5 + 2.2) * w * .3, ky = h * .5 + Math.sin(t * .7 + 1) * h * .3;
    g.fillStyle = '#c0392b'; g.beginPath(); g.arc(kx, ky, 9, 0, 7); g.fill();
    g.restore();
    g.fillStyle = '#d8d4cc'; g.beginPath(); g.arc(px, py, 7, 0, 7); g.fill();
    g.fillStyle = 'rgba(216,212,204,.55)'; g.font = '13px Fraunces, Georgia, serif'; g.fillText('3 generators left', 14, h - 14);
  });
};

// deadblock: ability bar with cooldown sweeps and a health bar. Illustrative.
GRAPHICS.deadblock = stage => {
  const { g, w, h } = canvasIn(stage);
  const keys = ['1', '2', '3', '4'], cd = [3, 5, 8, 12];
  return loop(t => {
    g.fillStyle = '#241913'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(241,230,214,.25)'; g.lineWidth = 2;
    const cx = w / 2, cy = h * .38;
    [[-22, -6], [6, 22]].forEach(([a, b]) => { g.beginPath(); g.moveTo(cx + a, cy); g.lineTo(cx + b - (a < 0 ? 0 : 0), cy); g.moveTo(cx, cy + a); g.lineTo(cx, cy + b); g.stroke(); });
    const bar = w * .5, bx = (w - bar) / 2;
    g.fillStyle = '#3a2a20'; g.fillRect(bx, h - 40, bar, 10);
    g.fillStyle = '#e8833a'; g.fillRect(bx, h - 40, bar * (0.55 + 0.35 * Math.sin(t * .6)), 10);
    keys.forEach((k, i) => {
      const x = w / 2 - 150 + i * 80 + 0, y = h - 120, f = ((t + i * 1.7) % cd[i]) / cd[i];
      g.fillStyle = '#2a1d16'; g.strokeStyle = '#e8833a'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, 60, 60, 10); g.fill(); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.moveTo(x + 30, y + 30); g.arc(x + 30, y + 30, 42, -Math.PI / 2, -Math.PI / 2 + (1 - f) * Math.PI * 2); g.closePath();
      g.save(); g.beginPath(); g.roundRect(x, y, 60, 60, 10); g.clip(); g.fill(); g.restore();
      g.fillStyle = '#f1e6d6'; g.font = '600 18px Fraunces, Georgia, serif'; g.textAlign = 'center'; g.fillText(k, x + 30, y + 38);
    });
    g.textAlign = 'left'; g.fillStyle = 'rgba(241,230,214,.5)'; g.font = '13px Fraunces, Georgia, serif'; g.fillText('Illustration of the ability bar', 14, 22);
  });
};

// stroop: the writing effect, live.
GRAPHICS.stroop = stage => {
  const el = document.createElement('div'); el.className = 'stroop-demo';
  const d = document.createElement('div'); el.append(d); stage.append(el);
  const phrases = ['stroke by stroke', 'outline, then ink', 'written in, unwritten'];
  let i = 0, dead = false, timer;
  const cycle = () => {
    if (dead) return;
    d.textContent = phrases[i++ % phrases.length];
    d._prepared = false; d.classList.remove('hid');
    writeIn(d, 1);
    timer = setTimeout(() => { writeOut(d, 1); timer = setTimeout(() => { if (!dead) { clearWords(d); cycle(); } }, 1600); }, 2600);
  };
  cycle();
  return () => { dead = true; clearTimeout(timer); };
};
