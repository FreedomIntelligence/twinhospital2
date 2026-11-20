// Hero: a live isometric digital twin of the campus. Building footprints and
// floor counts follow the site plan (A–G, 30 floors in total). Synthetic
// patients walk the outpatient pathway — registration, consulting room,
// cashier, pharmacy — and each HIS write sends a pulse and a line to the event
// log. Staff and logistics move between buildings. Illustration only; all
// identities are synthetic. Static under prefers-reduced-motion.
(() => {
  const canvas = document.querySelector('[data-twin]');
  if (!canvas) return;
  const visual = canvas.parentElement;
  const hero = canvas.closest('.hero');
  const logEl = visual.querySelector('[data-twin-log]');
  const statsEl = visual.querySelector('[data-twin-stats]');
  const tipEl = visual.querySelector('[data-twin-tip]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const L = (zh, en) => (window.TH2i18n && window.TH2i18n.lang() === 'en' ? en : zh);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- seeded randomness (stable first impression) ---------- */
  let seed = 20261119;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const jitter = (n = 10) => (rand() - 0.5) * n;

  /* ---------- world geometry (same coordinates as the site plan) ---------- */
  const FH = 14; // world units per floor
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const rounded = (x, y, w, h, r, n = 5) => {
    const pts = [];
    const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    corner(x + w - r, y + r, -Math.PI / 2);
    corner(x + w - r, y + h - r, 0);
    corner(x + r, y + h - r, Math.PI / 2);
    corner(x + r, y + r, Math.PI);
    return pts;
  };
  const ellipse = (cx, cy, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * rx, cy + Math.sin((i / n) * Math.PI * 2) * ry]);

  const BUILDINGS = [
    { id: 'A', zh: '门急诊医技楼', en: 'Outpatient & Diagnostics', floors: 5, rooms: 49, poly: rect(84, 298, 482, 122) },
    { id: 'B', zh: '住院综合楼', en: 'Inpatient', floors: 5, rooms: 23, poly: rect(64, 40, 136, 210) },
    { id: 'C', zh: '手术重症中心', en: 'Surgery & ICU', floors: 4, rooms: 12, poly: rect(336, 40, 216, 112) },
    { id: 'D', zh: '药学供应楼', en: 'Pharmacy & Supply', floors: 4, rooms: 14, poly: rect(598, 52, 160, 100) },
    { id: 'E', zh: '健康管理中心', en: 'Health Management', floors: 4, rooms: 16, poly: rounded(680, 186, 210, 84, 42, 6) },
    { id: 'F', zh: '行政信息楼', en: 'Administration & IT', floors: 5, rooms: 20, poly: rect(668, 300, 226, 118) },
    { id: 'G', zh: '后勤仓储中心', en: 'Logistics', floors: 3, rooms: 13, poly: rect(780, 40, 122, 110) },
  ];
  BUILDINGS.forEach((b, i) => {
    b.index = i;
    b.cx = b.poly.reduce((s, p) => s + p[0], 0) / b.poly.length;
    b.cy = b.poly.reduce((s, p) => s + p[1], 0) / b.poly.length;
    b.edges = b.poly.length === 4 ? b.poly : b.poly.filter((_, k) => k % 6 === 0);
    b.rise = 0;
  });
  const SITE = rect(16, 14, 928, 490);
  const ROADS = [rect(16, 448, 928, 30), rect(912, 14, 32, 464), rect(16, 318, 30, 160)];
  const GARDEN = rounded(300, 178, 340, 104, 24);
  const POND = ellipse(470, 230, 58, 26);
  const BRIDGES = [{ poly: rect(200, 92, 136, 12), z: 2 * FH }, { poly: rect(552, 92, 46, 12), z: 2 * FH }, { poly: rect(186, 250, 12, 48), z: FH }];

  /* ---------- projection ---------- */
  const CX = 480;
  const CY = 259;
  let ctx;
  let W = 0;
  let H = 0;
  let k = 1;
  let ox = 0;
  let oy = 0;
  let theta = -0.22;
  let thetaPointer = 0;
  let thetaTarget = 0;
  const project = (x, y, z = 0) => {
    const dx = x - CX;
    const dy = y - CY;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const rx = dx * c - dy * s;
    const ry = dx * s + dy * c;
    return [(rx - ry) * 0.866 * k + ox, (rx + ry) * 0.5 * k - z * k + oy];
  };
  const depth = (x, y) => {
    const dx = x - CX;
    const dy = y - CY;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return dx * c - dy * s + dx * s + dy * c;
  };

  function fit() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.width;
    H = box.height;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Fit the whole site (and the tallest roof) into the canvas.
    k = 1; ox = 0; oy = 0;
    const saved = theta;
    theta = -0.22;
    const pts = SITE.map(([x, y]) => project(x, y, 0)).concat(SITE.map(([x, y]) => project(x, y, 5 * FH)));
    theta = saved;
    const minX = Math.min(...pts.map(p => p[0]));
    const maxX = Math.max(...pts.map(p => p[0]));
    const minY = Math.min(...pts.map(p => p[1]));
    const maxY = Math.max(...pts.map(p => p[1]));
    const narrow = W < 640;
    const padX = narrow ? 18 : 36;
    const padTop = narrow ? 56 : 92;
    const padBottom = narrow ? 70 : 150;
    k = Math.min((W - 2 * padX) / (maxX - minX), (H - padTop - padBottom) / (maxY - minY));
    ox = padX + ((W - 2 * padX) - (maxX - minX) * k) / 2 - minX * k;
    oy = padTop + ((H - padTop - padBottom) - (maxY - minY) * k) / 2 - minY * k;
  }

  /* ---------- simulation ---------- */
  const EVENTS = {
    reg: { where: ['A · 挂号收费处', 'A · Registration desk'], what: ['门诊挂号', 'Outpatient registration'] },
    room: { where: ['A · 门诊诊室', 'A · Consulting room'], what: ['病历 · 医嘱 · 处方', 'Record · orders · prescription'] },
    pay: { where: ['A · 挂号收费处', 'A · Cashier desk'], what: ['门诊收费', 'Outpatient billing'] },
    pharm: { where: ['A · 门急诊药房', 'A · Outpatient pharmacy'], what: ['审方 · 门诊发药', 'Review · dispensing'] },
    stock: { where: ['D · 药学供应楼', 'D · Pharmacy & supply'], what: ['采购入库', 'Purchase receipt'] },
  };
  const COLORS = { patient: '#eaf2f3', staff: '#5fb3ad', logistics: '#d9b878' };
  let agents = [];
  let pulses = [];
  let log = [];
  let simTime = 0;
  let nextPatient = 0.4;
  let nextLogistics = 3;
  let patientNo = 1027;
  let completed = 0;
  let writes = 0;
  const clockStart = 8 * 3600 + 30 * 60;
  const clock = () => {
    const s = Math.floor(clockStart + simTime * 24);
    const h = Math.floor(s / 3600) % 24;
    const m = Math.floor(s / 60) % 60;
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  function spawnPatient() {
    const lane = jitter(16);
    agents.push({
      kind: 'patient', id: `P-${patientNo++}`, speed: 52 + rand() * 16,
      route: [
        { x: 326 + lane, y: 492 },
        { x: 326 + lane, y: 428 },
        { x: 230 + jitter(26), y: 392 + jitter(14), wait: 1.1, event: 'reg' },
        { x: 360 + jitter(60), y: 340 + jitter(14), wait: 1.8, event: 'room' },
        { x: 250 + jitter(26), y: 396 + jitter(12), wait: 0.9, event: 'pay' },
        { x: 500 + jitter(36), y: 392 + jitter(14), wait: 1.3, event: 'pharm' },
        { x: 344 + lane, y: 428 },
        { x: 344 + lane, y: 500, done: true },
      ],
    });
  }
  function spawnLogistics() {
    agents.push({
      kind: 'logistics', id: 'L-07', speed: 46,
      route: [
        { x: 840, y: 166 }, { x: 840, y: 174 }, { x: 680, y: 174 }, { x: 680, y: 160, wait: 1.2, event: 'stock' },
        { x: 680, y: 174 }, { x: 840, y: 174 }, { x: 840, y: 166, done: true },
      ],
    });
  }
  const STAFF_ROUTES = [
    [{ x: 230, y: 250 }, { x: 230, y: 290 }, { x: 250, y: 330, wait: 1.5 }, { x: 230, y: 290 }, { x: 230, y: 252, wait: 2 }],
    [{ x: 444, y: 160 }, { x: 444, y: 196 }, { x: 290, y: 196 }, { x: 290, y: 292 }, { x: 420, y: 300, wait: 1.2 }, { x: 290, y: 292 }, { x: 290, y: 196 }, { x: 444, y: 196 }, { x: 444, y: 160, wait: 1.6 }],
    [{ x: 720, y: 300 }, { x: 720, y: 280 }, { x: 760, y: 270, wait: 1.4 }, { x: 720, y: 280 }, { x: 720, y: 300, wait: 1.8 }],
    [{ x: 600, y: 300 }, { x: 650, y: 290 }, { x: 650, y: 166 }, { x: 640, y: 156, wait: 1.5 }, { x: 650, y: 166 }, { x: 650, y: 290 }, { x: 600, y: 300, wait: 1.2 }],
  ];
  STAFF_ROUTES.forEach((route, i) => agents.push({ kind: 'staff', id: `S-${i}`, speed: 40 + i * 4, route, loop: true, step: i % route.length }));

  function emit(agent, key) {
    const e = EVENTS[key];
    writes += 1;
    log.unshift({ time: clock(), who: agent.id, e });
    if (log.length > 5) log.length = 5;
    pulses.push({ x: agent.x, y: agent.y, t: 0, color: key === 'stock' ? '217,184,120' : '95,179,173' });
    renderLog(true);
  }

  function stepSim(dt) {
    simTime += dt;
    nextPatient -= dt;
    nextLogistics -= dt;
    if (nextPatient <= 0) {
      if (agents.filter(a => a.kind === 'patient').length < 16) spawnPatient();
      nextPatient = 1.3 + rand() * 1.1;
    }
    if (nextLogistics <= 0) {
      spawnLogistics();
      nextLogistics = 9 + rand() * 4;
    }
    agents.forEach(a => {
      if (a.step === undefined) a.step = 0;
      if (a.x === undefined) { a.x = a.route[a.step].x; a.y = a.route[a.step].y; a.trail = []; a.trailClock = 0; }
      a.trailClock += dt;
      if (a.trailClock > 0.06) {
        a.trailClock = 0;
        a.trail.push([a.x, a.y]);
        if (a.trail.length > 9) a.trail.shift();
      }
      if (a.wait > 0) { a.wait -= dt; return; }
      const target = a.route[a.step];
      const dx = target.x - a.x;
      const dy = target.y - a.y;
      const dist = Math.hypot(dx, dy);
      const move = a.speed * dt;
      if (dist <= move) {
        a.x = target.x;
        a.y = target.y;
        if (target.event) emit(a, target.event);
        a.wait = target.wait || 0;
        if (target.done) { a.gone = true; if (a.kind === 'patient') completed += 1; return; }
        a.step = a.loop ? (a.step + 1) % a.route.length : a.step + 1;
      } else {
        a.x += (dx / dist) * move;
        a.y += (dy / dist) * move;
      }
    });
    agents = agents.filter(a => !a.gone);
    pulses.forEach(p => { p.t += dt; });
    pulses = pulses.filter(p => p.t < 1.4);
  }

  /* ---------- HUD ---------- */
  let statsClock = 0;
  function renderStats() {
    if (!statsEl) return;
    const inside = agents.filter(a => a.kind === 'patient').length;
    statsEl.innerHTML = `<span><b>${inside}</b>${esc(L('在院患者', 'in hospital'))}</span><span><b>${completed}</b>${esc(L('完成就诊', 'visits done'))}</span><span><b>${writes}</b>${esc(L('HIS 写入', 'HIS writes'))}</span><span class="clock">${clock()}</span>`;
  }
  function renderLog(fresh) {
    if (!logEl) return;
    logEl.innerHTML = log.map((item, i) => `<li class="${fresh && i === 0 ? 'new' : ''}"><time>${item.time}</time><b>${item.who}</b><span>${esc(L(item.e.where[0], item.e.where[1]))}</span><em>${esc(L(item.e.what[0], item.e.what[1]))}</em><i>${esc(L('✓ 已写入', '✓ written'))}</i></li>`).join('');
  }

  /* ---------- drawing ---------- */
  const strokePoly = (pts, z, close = true) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => { const [sx, sy] = project(x, y, z); if (i) ctx.lineTo(sx, sy); else ctx.moveTo(sx, sy); });
    if (close) ctx.closePath();
  };
  let hover = null;
  let introClock = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const fade = Math.min(1, introClock / 0.8);

    // ground grid
    ctx.lineWidth = 1;
    for (let x = 16; x <= 944; x += 32) {
      ctx.strokeStyle = `rgba(95,179,173,${((x - 16) % 128 === 0 ? 0.11 : 0.05) * fade})`;
      ctx.beginPath(); const a = project(x, 14); const b = project(x, 504); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (let y = 14; y <= 504; y += 32) {
      ctx.strokeStyle = `rgba(95,179,173,${((y - 14) % 128 === 0 ? 0.11 : 0.05) * fade})`;
      ctx.beginPath(); const a = project(16, y); const b = project(944, y); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.fillStyle = `rgba(232,238,240,${0.035 * fade})`;
    ROADS.forEach(r => { strokePoly(r, 0); ctx.fill(); });
    strokePoly(SITE, 0);
    ctx.strokeStyle = `rgba(95,179,173,${0.3 * fade})`;
    ctx.stroke();
    strokePoly(GARDEN, 0);
    ctx.fillStyle = `rgba(95,179,173,${0.06 * fade})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(95,179,173,${0.18 * fade})`;
    ctx.stroke();
    strokePoly(POND, 0);
    ctx.strokeStyle = `rgba(120,200,210,${0.32 * fade})`;
    ctx.stroke();

    // patient route (faint guide)
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = `rgba(234,242,243,${0.16 * fade})`;
    strokePoly([[326, 492], [326, 428], [230, 392], [360, 340], [250, 396], [500, 392], [344, 428], [344, 500]], 0, false);
    ctx.stroke();
    ctx.setLineDash([]);

    // pulses on the ground
    pulses.forEach(p => {
      const r = 6 + p.t * 30;
      const alpha = Math.max(0, 1 - p.t / 1.4);
      strokePoly(ellipse(p.x, p.y, r, r, 24), 1);
      ctx.strokeStyle = `rgba(${p.color},${0.75 * alpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.lineWidth = 1;
    });

    // bridges and buildings, far to near
    const items = BUILDINGS.map(b => ({ b, d: depth(b.cx, b.cy) })).sort((m, n) => m.d - n.d);
    BRIDGES.forEach(br => {
      strokePoly(br.poly, br.z * Math.min(1, introClock / 1.6));
      ctx.fillStyle = `rgba(95,179,173,${0.08 * fade})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(95,179,173,${0.45 * fade})`;
      ctx.stroke();
    });
    items.forEach(({ b }) => {
      const on = hover === b;
      const top = b.floors * FH * b.rise;
      ctx.strokeStyle = on ? 'rgba(190,240,234,.6)' : 'rgba(95,179,173,.34)';
      b.edges.forEach(([x, y]) => {
        const p0 = project(x, y, 0);
        const p1 = project(x, y, top);
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      });
      for (let f = 0; f <= b.floors; f++) {
        const z = f * FH;
        if (z > top + 0.01) break;
        const roof = f === b.floors || z + FH > top + 0.01;
        strokePoly(b.poly, z);
        ctx.fillStyle = roof ? (on ? 'rgba(95,179,173,.32)' : 'rgba(95,179,173,.15)') : (on ? 'rgba(95,179,173,.09)' : 'rgba(95,179,173,.045)');
        ctx.fill();
        ctx.strokeStyle = roof ? (on ? 'rgba(210,248,243,.98)' : 'rgba(140,214,207,.88)') : (on ? 'rgba(170,230,224,.6)' : 'rgba(95,179,173,.36)');
        ctx.stroke();
      }
      if (b.rise > 0.98) {
        const [lx, ly] = project(b.cx, b.cy, top);
        ctx.strokeStyle = on ? 'rgba(232,238,240,.9)' : 'rgba(232,238,240,.45)';
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly - 16); ctx.stroke();
        ctx.font = '600 11px "IBM Plex Mono", Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = on ? '#ffffff' : 'rgba(232,238,240,.85)';
        ctx.fillText(b.id, lx, ly - 21);
      }
    });

    // agents with light trails
    agents.forEach(a => {
      const color = COLORS[a.kind];
      if (a.trail && a.trail.length > 1) {
        for (let i = 1; i < a.trail.length; i++) {
          const p0 = project(a.trail[i - 1][0], a.trail[i - 1][1], 1.5);
          const p1 = project(a.trail[i][0], a.trail[i][1], 1.5);
          ctx.strokeStyle = a.kind === 'patient' ? `rgba(234,242,243,${(i / a.trail.length) * 0.35})` : a.kind === 'staff' ? `rgba(95,179,173,${(i / a.trail.length) * 0.4})` : `rgba(217,184,120,${(i / a.trail.length) * 0.4})`;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        }
      }
      const [sx, sy] = project(a.x, a.y, 1.5);
      ctx.beginPath();
      ctx.arc(sx, sy, a.kind === 'patient' ? 2.6 : 2.3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  /* ---------- hover ---------- */
  const hull = pts => {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    p.forEach(q => { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); });
    const upper = [];
    p.slice().reverse().forEach(q => { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); });
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  };
  const inside = (pt, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      if ((poly[i][1] > pt[1]) !== (poly[j][1] > pt[1]) && pt[0] < ((poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1])) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c;
    }
    return c;
  };
  function pick(mx, my) {
    const items = BUILDINGS.map(b => ({ b, d: depth(b.cx, b.cy) })).sort((m, n) => n.d - m.d);
    for (const { b } of items) {
      const top = b.floors * FH;
      const pts = b.poly.map(([x, y]) => project(x, y, 0)).concat(b.poly.map(([x, y]) => project(x, y, top)));
      if (inside([mx, my], hull(pts))) return b;
    }
    return null;
  }
  visual.addEventListener('pointermove', event => {
    const box = canvas.getBoundingClientRect();
    const mx = event.clientX - box.left;
    const my = event.clientY - box.top;
    thetaTarget = ((mx / box.width) - 0.5) * 0.12;
    const b = pick(mx, my);
    hover = b;
    canvas.style.cursor = b ? 'pointer' : '';
    if (b && tipEl) {
      tipEl.innerHTML = `<b>${b.id} · ${esc(L(b.zh, b.en))}</b><span>${esc(L(`${b.floors} 层 · ${b.rooms} 个空间`, `${b.floors} floors · ${b.rooms} spaces`))}</span>`;
      tipEl.hidden = false;
      tipEl.style.left = `${Math.min(box.width - tipEl.offsetWidth - 8, mx + 14)}px`;
      tipEl.style.top = `${Math.max(8, my - tipEl.offsetHeight - 12)}px`;
    } else if (tipEl) tipEl.hidden = true;
    if (!running) draw();
  });
  visual.addEventListener('pointerleave', () => { hover = null; thetaTarget = 0; if (tipEl) tipEl.hidden = true; if (!running) draw(); });
  canvas.addEventListener('click', () => {
    if (hover) document.querySelector('#campus')?.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
  });

  /* ---------- loop ---------- */
  let running = false;
  let frame = 0;
  let last = 0;
  let visible = true;
  const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) { running = false; return; }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    introClock += dt;
    BUILDINGS.forEach((b, i) => { b.rise = ease((introClock - 0.25 - i * 0.13) / 1.1); });
    thetaPointer += (thetaTarget - thetaPointer) * 0.05;
    theta = -0.22 + Math.sin(introClock * 0.13) * 0.045 + thetaPointer;
    stepSim(dt);
    statsClock += dt;
    if (statsClock > 0.25) { statsClock = 0; renderStats(); }
    draw();
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (running || reduced.matches) return;
    running = true;
    last = 0;
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    running = false;
  }
  function still() {
    // Reduced motion: a settled frame with a few minutes of activity.
    BUILDINGS.forEach(b => { b.rise = 1; });
    introClock = 2;
    for (let i = 0; i < 600; i++) stepSim(1 / 30);
    pulses = [];
    renderStats();
    renderLog(false);
    draw();
  }

  fit();
  if (reduced.matches) still();
  else { renderStats(); start(); }

  let resizeQueued = false;
  window.addEventListener('resize', () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      const box = canvas.getBoundingClientRect();
      if (Math.abs(box.width - W) < 1 && Math.abs(box.height - H) < 1) return;
      fit();
      if (!running) draw();
    });
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(entry => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    })).observe(hero);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : visible && start()));
  reduced.addEventListener('change', () => { stop(); if (reduced.matches) still(); else start(); });
  document.addEventListener('langchange', () => { renderLog(false); renderStats(); if (!running) draw(); });
})();
