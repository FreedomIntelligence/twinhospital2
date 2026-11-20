// TwinHospital2 page behaviour. Nothing moves on its own: every change follows
// a user action (hover, focus, click, play). Figures that carry text are
// rendered here so they can switch language; they re-render on `langchange`.
(() => {
  const L = (zh, en) => (window.TH2i18n && window.TH2i18n.lang() === 'en' ? en : zh);
  const t = zh => (window.TH2i18n ? window.TH2i18n.t(zh) : zh);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- navigation ---------- */
  const nav = document.querySelector('#siteNav');
  const toggle = document.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  // Scroll-spy: mark the nav link of the section in the reading band.
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const byId = new Map(links.map(link => [link.getAttribute('href').slice(1), link]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.removeAttribute('aria-current'));
      const link = byId.get(entry.target.id);
      if (link) link.setAttribute('aria-current', 'true');
    }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => spy.observe(section));
  }

  /* ---------- dialogs ---------- */
  function setupDialog(dialog, { onClose } = {}) {
    if (!dialog || !dialog.showModal) return null;
    let startedOutside = false;
    let opener = null;
    const outside = event => {
      const box = dialog.getBoundingClientRect();
      return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    };
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('pointerdown', event => { startedOutside = outside(event); });
    dialog.addEventListener('click', event => {
      if (startedOutside && outside(event)) dialog.close();
      startedOutside = false;
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      if (onClose) onClose();
      if (opener) opener.focus({ preventScroll: true });
    });
    return trigger => {
      opener = trigger || document.activeElement;
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = 'hidden';
    };
  }
  const playFrom = (video, time) => {
    const start = () => {
      video.currentTime = time;
      video.play().catch(() => {});
    };
    if (video.readyState >= 1) start();
    else {
      video.addEventListener('loadedmetadata', start, { once: true });
      video.preload = 'auto';
      video.load();
    }
  };

  // Lightbox for figures.
  const lightbox = document.querySelector('#lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxTitle = lightbox.querySelector('#lightbox-title');
  const openLightbox = setupDialog(lightbox);
  document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    lightboxImg.src = button.dataset.lightbox;
    lightboxImg.alt = t(button.dataset.lightboxTitle);
    lightboxTitle.textContent = t(button.dataset.lightboxTitle);
    openLightbox(button);
  }));

  // Campus tour: a silent loop that plays while it is on screen. With reduced
  // motion it waits for an explicit play; a manual pause is always respected.
  (() => {
    const fig = document.querySelector('[data-tour]');
    if (!fig) return;
    const video = fig.querySelector('video');
    const toggle = fig.querySelector('[data-tour-toggle]');
    let held = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let inView = false;
    const sync = () => { fig.dataset.state = video.paused ? 'paused' : 'playing'; };
    ['play', 'pause'].forEach(type => video.addEventListener(type, sync));
    sync();
    toggle.addEventListener('click', () => {
      held = !video.paused;
      if (held) video.pause();
      else video.play().catch(() => {});
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => entries.forEach(entry => {
        inView = entry.isIntersecting;
        if (!inView) video.pause();
        else if (!held) video.play().catch(() => {});
      }), { threshold: 0.35 }).observe(fig);
    }
  })();

  // Full replay: the stage buttons in the pathway table seek the inline player.
  const journeyVideo = document.querySelector('[data-journey] video');
  document.querySelectorAll('[data-journey-at]').forEach(button => button.addEventListener('click', () => {
    if (!journeyVideo) return;
    const box = journeyVideo.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) {
      journeyVideo.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    playFrom(journeyVideo, Number(button.dataset.journeyAt));
  }));

  /* ---------- demo tabs ---------- */
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const select = name => {
    tabs.forEach(tab => {
      const on = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('[data-panel]').forEach(panel => {
      const on = panel.dataset.panel === name;
      panel.hidden = !on;
      if (!on) panel.querySelectorAll('video').forEach(video => video.pause());
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = tabs[(i + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      select(next.dataset.tab);
    });
  });

  /* ---------- agent recording: chapters follow playback ---------- */
  document.querySelectorAll('[data-player]').forEach(player => {
    const video = player.querySelector('video');
    const buttons = [...player.querySelectorAll('[data-at]')];
    const times = buttons.map(button => Number(button.dataset.at));
    const mark = () => {
      const now = video.currentTime;
      const current = video.played.length || now > 0 ? times.reduce((acc, time, i) => (now >= time ? i : acc), -1) : -1;
      buttons.forEach((button, i) => {
        button.classList.toggle('active', i === current);
        button.classList.toggle('done', i < current);
        if (i === current) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
    };
    buttons.forEach(button => button.addEventListener('click', () => playFrom(video, Number(button.dataset.at))));
    ['timeupdate', 'seeked', 'play'].forEach(type => video.addEventListener(type, mark));
  });

  /* ---------- campus site plan ---------- */
  const BUILDINGS = [
    { id: 'A', zh: '门急诊医技楼', en: 'Outpatient & Diagnostics', floors: 5, rooms: 49, rects: [[84, 298, 482, 122], [290, 420, 72, 14], [48, 336, 36, 56]], at: [96, 308] },
    { id: 'B', zh: '住院综合楼', en: 'Inpatient', floors: 5, rooms: 23, rects: [[64, 40, 136, 210], [200, 176, 62, 74]], at: [76, 50] },
    { id: 'C', zh: '手术重症中心', en: 'Surgery & ICU', floors: 4, rooms: 12, rects: [[336, 40, 216, 112], [408, 152, 72, 12]], at: [348, 50] },
    { id: 'D', zh: '药学供应楼', en: 'Pharmacy & Supply', floors: 4, rooms: 14, rects: [[598, 52, 160, 100]], at: [610, 62] },
    { id: 'E', zh: '健康管理中心', en: 'Health Management', floors: 4, rooms: 16, round: [680, 186, 210, 84], at: [716, 190] },
    { id: 'F', zh: '行政信息楼', en: 'Administration & IT', floors: 5, rooms: 20, rects: [[668, 300, 226, 118]], at: [680, 310] },
    { id: 'G', zh: '后勤仓储中心', en: 'Logistics', floors: 3, rooms: 13, rects: [[780, 40, 122, 110]], docks: true, at: [790, 50] },
  ];
  const plan = document.querySelector('[data-plan]');
  const rows = [...document.querySelectorAll('[data-building]')].filter(el => el.tagName === 'TR');
  let pinned = null;
  let planDrawn = false;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

  function renderPlan() {
    if (!plan) return;
    const stats = b => {
      const narrow = (b.round ? b.round[2] : b.rects[0][2]) < 150;
      const floors = L(`${b.floors} 层`, `${b.floors} floors`);
      const rooms = L(`${b.rooms} 个空间`, `${b.rooms} spaces`);
      return narrow ? [floors, rooms] : [`${floors} · ${rooms}`];
    };
    let svg = `<svg viewBox="0 0 1000 520" role="img" aria-label="${esc(L('数字院区总平面示意：A–G 七栋楼宇环绕中心花园布置', 'Campus site plan: buildings A–G arranged around a central garden'))}">`;
    svg += '<rect class="p-site" x="16" y="14" width="928" height="490" rx="4"/>';
    svg += '<rect class="p-road" x="16" y="448" width="928" height="30"/><rect class="p-road" x="912" y="14" width="32" height="464"/><rect class="p-road" x="16" y="318" width="30" height="160"/>';
    svg += '<rect class="p-green" x="300" y="178" width="340" height="104" rx="24"/><ellipse class="p-water" cx="470" cy="230" rx="58" ry="26"/><circle class="p-bridge" cx="470" cy="230" r="8"/>';
    svg += `<text class="p-label" x="470" y="274" text-anchor="middle">${esc(L('中心花园', 'Central garden'))}</text>`;
    svg += '<rect class="p-bridge" x="200" y="92" width="136" height="12"/><rect class="p-bridge" x="552" y="92" width="46" height="12"/><rect class="p-bridge" x="186" y="250" width="12" height="48"/>';
    svg += '<g class="p-park"><rect x="588" y="312" width="62" height="100"/>';
    for (let y = 324; y < 412; y += 12) svg += `<path d="M588 ${y}h22M628 ${y}h22"/>`;
    svg += `</g><text class="p-label" x="619" y="430" text-anchor="middle">${esc(L('停车场', 'Parking'))}</text>`;
    BUILDINGS.forEach(b => {
      const [lx, ly] = b.at;
      const label = `${b.id} ${L(b.zh, b.en)}，${L(`${b.floors} 层，${b.rooms} 个空间`, `${b.floors} floors, ${b.rooms} spaces`)}`;
      svg += `<g class="p-bld" data-building="${b.id}" tabindex="0" role="button" aria-label="${esc(label)}">`;
      const d = BUILDINGS.indexOf(b);
      const box = (x, y, w, h) => `<path class="shape" pathLength="1" style="--d:${d}" d="M${x} ${y}h${w}v${h}h${-w}z"/>`;
      if (b.round) {
        const [x, y, w, h] = b.round;
        const r = h / 2;
        svg += `<path class="shape" pathLength="1" style="--d:${d}" d="M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 0 ${h}h${-(w - 2 * r)}a${r} ${r} 0 0 1 0 ${-h}z"/>`;
      }
      (b.rects || []).forEach(([x, y, w, h]) => { svg += box(x, y, w, h); });
      if (b.docks) [794, 824, 854].forEach(x => { svg += box(x, 150, 22, 8); });
      svg += `<circle class="badge" style="--d:${d}" cx="${lx + 12}" cy="${ly + 13}" r="12"/><text class="badge-t" style="--d:${d}" x="${lx + 12}" y="${ly + 18}" text-anchor="middle">${b.id}</text>`;
      svg += `<text class="name" style="--d:${d}" x="${lx}" y="${ly + 48}">${esc(L(b.zh, b.en))}</text>`;
      stats(b).forEach((line, i) => { svg += `<text class="stat" style="--d:${d}" x="${lx}" y="${ly + 68 + i * 17}">${esc(line)}</text>`; });
      svg += '</g>';
    });
    const ROUTE = 'M326 486V428L230 392L360 340L250 396L500 392L344 428V500';
    svg += `<path class="p-route" d="${ROUTE}"/>`;
    if (!REDUCED.matches) svg += `<circle class="p-walker" r="6"><animateMotion dur="11s" repeatCount="indefinite" path="${ROUTE}"/></circle>`;
    svg += `<path class="p-entry" d="M326 440l-6 8h12z"/><text class="p-label" x="326" y="468" text-anchor="middle">${esc(L('门诊主入口', 'Main entrance'))}</text>`;
    svg += `<text class="p-label" x="64" y="410" text-anchor="middle">${esc(L('急诊', 'ER'))}</text>`;
    svg += `<text class="p-label" x="928" y="240" text-anchor="middle" transform="rotate(90 928 240)">${esc(L('后勤通道', 'Service road'))}</text>`;
    svg += '<g class="p-north"><circle cx="972" cy="62" r="16"/><path d="M972 48l6 18-6-4-6 4z"/><text x="972" y="98" text-anchor="middle">N</text></g>';
    svg += '</svg>';
    plan.innerHTML = svg;
    if (planDrawn) plan.classList.add('drawn');
    plan.querySelectorAll('.p-bld').forEach(group => {
      const id = group.dataset.building;
      group.addEventListener('pointerenter', () => highlight(id));
      group.addEventListener('pointerleave', () => highlight(pinned));
      group.addEventListener('focus', () => highlight(id));
      group.addEventListener('blur', () => highlight(pinned));
      group.addEventListener('click', () => { pinned = pinned === id ? null : id; highlight(pinned || id); });
      group.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pinned = pinned === id ? null : id; highlight(pinned || id); }
      });
    });
    highlight(pinned);
  }
  function highlight(id) {
    document.querySelectorAll('[data-building]').forEach(el => el.classList.toggle('on', el.dataset.building === id));
  }
  rows.forEach(row => {
    const id = row.dataset.building;
    row.addEventListener('pointerenter', () => highlight(id));
    row.addEventListener('pointerleave', () => highlight(pinned));
    row.addEventListener('focus', () => highlight(id));
    row.addEventListener('blur', () => highlight(pinned));
    row.addEventListener('click', () => { pinned = pinned === id ? null : id; highlight(pinned || id); });
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pinned = pinned === id ? null : id; highlight(pinned || id); }
    });
  });

  /* ---------- role architecture ---------- */
  (() => {
    const root = document.querySelector('[data-roles]');
    if (!root) return;
    const svg = root.querySelector('.arch');
    const cards = [...root.querySelectorAll('[data-role]')];
    const parts = [...svg.querySelectorAll('[data-r]')];
    let fixed = null;
    const focus = role => {
      svg.classList.toggle('focusing', !!role);
      parts.forEach(part => part.classList.toggle('on', !!role && part.dataset.r.split(' ').includes(role)));
      cards.forEach(card => card.classList.toggle('on', card.dataset.role === role));
    };
    cards.forEach(card => {
      const role = card.dataset.role;
      card.addEventListener('pointerenter', () => { if (!fixed) focus(role); });
      card.addEventListener('pointerleave', () => { if (!fixed) focus(null); });
      card.addEventListener('focus', () => focus(role));
      card.addEventListener('blur', () => focus(fixed));
      card.addEventListener('click', () => { fixed = fixed === role ? null : role; focus(fixed); });
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fixed = fixed === role ? null : role; focus(fixed || role); }
      });
    });
  })();

  /* ---------- figure 8: dumbbell chart of the time measures ---------- */
  // Sample data, identical to Table 3. Minutes on one shared axis.
  const CHART = [
    { no: '01', zh: '单张处方平均耗时', en: 'Avg. time per prescription', base: 2.4, value: 38 / 60, baseName: ['人工', 'manual'], valueText: ['38 秒', '38 s'], delta: '−74%' },
    { no: '02', zh: '医生问诊时长', en: 'Consultation time', base: 12.4, value: 8.7, baseName: ['基线', 'baseline'], delta: '−30%' },
    { no: '02', zh: '患者在院总时长', en: 'Total time in hospital', base: 19.6, value: 23.5, baseName: ['基线', 'baseline'], delta: '+20%', cost: true },
    { no: '04', zh: '端到端平均耗时', en: 'Avg. end-to-end time', base: 26.8, value: 18.6, baseName: ['人工', 'manual'], delta: '−31%' },
    { no: '07', zh: '平均等待 · 排班', en: 'Avg. wait · staffing', base: 27.9, value: 21.6, baseName: ['固定班', 'fixed shift'], delta: '−23%' },
    { no: '08', zh: '平均等待 · 资源预约', en: 'Avg. wait · booking', base: 24.7, value: 19.4, baseName: ['先到先得', 'FCFS'], delta: '−21%' },
  ];
  const chartHost = document.querySelector('[data-chart]');
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  const minutes = v => L(`${v.toFixed(1)} 分钟`, `${v.toFixed(1)} min`);
  let chartPending = false;
  function animateChart() {
    if (!chartHost || REDUCED.matches) return;
    const groups = [...chartHost.querySelectorAll('.c-row')];
    const parts = groups.map(g => {
      const base = g.querySelector('.c-dot-base');
      const dot = g.querySelector('.c-dot-new');
      const link = g.querySelector('.c-link');
      const labels = [...g.querySelectorAll('.c-val, .c-delta')];
      const xb = Number(base.getAttribute('cx'));
      const xv = Number(dot.getAttribute('cx'));
      labels.forEach(label => { label.style.opacity = '0'; label.style.transition = 'opacity .5s'; });
      dot.setAttribute('cx', xb);
      link.setAttribute('x1', xb);
      link.setAttribute('x2', xb);
      return { dot, link, labels, xb, xv };
    });
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = now => {
      let done = true;
      parts.forEach((p, i) => {
        const t = Math.min(1, Math.max(0, (now - start - i * 110) / 900));
        if (t < 1) done = false;
        const x = p.xb + (p.xv - p.xb) * ease(t);
        p.dot.setAttribute('cx', x);
        p.link.setAttribute('x1', Math.min(p.xb, x));
        p.link.setAttribute('x2', Math.max(p.xb, x));
        if (t >= 1) p.labels.forEach(label => { label.style.opacity = '1'; });
      });
      if (!done) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function renderChart() {
    if (!chartHost) return;
    const W = chartHost.clientWidth;
    if (!W) return;
    const narrow = W < 560;
    const labelW = narrow ? 0 : Math.min(290, W * 0.34);
    const deltaW = narrow ? 58 : 76;
    const rowH = narrow ? 62 : 48;
    const top = 6;
    const x0 = labelW + (narrow ? 14 : 22);
    const x1 = W - deltaW - 10;
    const X = v => x0 + (v / 30) * (x1 - x0);
    const H = top + CHART.length * rowH + 30;
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(L('六项时间指标的对照与 TwinHospital2 方案取值，完整数值见表 3', 'Six time measures, comparison vs. TwinHospital2; full values in Table 3'))}">`;
    [0, 10, 20, 30].forEach(v => {
      const x = Math.round(X(v)) + 0.5;
      svg += `<line class="c-grid" x1="${x}" x2="${x}" y1="${top}" y2="${H - 26}"/>`;
      svg += `<text class="c-axis" x="${x}" y="${H - 8}" text-anchor="${v === 30 ? 'end' : v === 0 ? 'start' : 'middle'}">${v === 30 ? L('30 分钟', '30 min') : v}</text>`;
    });
    const width = text => [...text].reduce((s, ch) => s + (/[一-鿿]/.test(ch) ? 12 : 6.6), 0);
    CHART.forEach((row, i) => {
      const y0 = top + i * rowH;
      const yc = narrow ? y0 + 40 : y0 + rowH / 2 + 4;
      const xb = X(row.base);
      const xv = X(row.value);
      const baseLabel = row.base.toFixed(1);
      const valueLabel = row.valueText ? L(row.valueText[0], row.valueText[1]) : row.value.toFixed(1);
      svg += `<g class="c-row" data-row="${i}" tabindex="0" aria-label="${esc(`${row.no} ${L(row.zh, row.en)}：${L(row.baseName[0], row.baseName[1])} ${minutes(row.base)}，TwinHospital2 ${row.valueText ? valueLabel : minutes(row.value)}，${row.delta}`)}">`;
      svg += `<rect class="c-hit" x="0" y="${y0}" width="${W}" height="${rowH}"/>`;
      if (narrow) {
        svg += `<text class="c-label" x="${x0}" y="${y0 + 18}"><tspan class="c-label-no">${row.no}</tspan><tspan dx="8">${esc(L(row.zh, row.en))}</tspan></text>`;
      } else {
        svg += `<text class="c-label" x="0" y="${yc + 4}"><tspan class="c-label-no">${row.no}</tspan><tspan dx="10">${esc(L(row.zh, row.en))}</tspan></text>`;
      }
      svg += `<line class="c-link" x1="${Math.min(xb, xv)}" x2="${Math.max(xb, xv)}" y1="${yc}" y2="${yc}"/>`;
      svg += `<circle class="c-dot-base" cx="${xb}" cy="${yc}" r="6"/><circle class="c-dot-new" cx="${xv}" cy="${yc}" r="6"/>`;
      // Value labels sit above their dots; if the two would collide, the
      // left-hand one drops below its dot.
      const left = xb < xv ? { x: xb, text: baseLabel } : { x: xv, text: valueLabel };
      const right = xb < xv ? { x: xv, text: valueLabel } : { x: xb, text: baseLabel };
      const clash = right.x - left.x < (width(left.text) + width(right.text)) / 2 + 6;
      svg += `<text class="c-val" x="${left.x}" y="${clash ? yc + 21 : yc - 11}" text-anchor="middle">${esc(left.text)}</text>`;
      svg += `<text class="c-val" x="${right.x}" y="${yc - 11}" text-anchor="middle">${esc(right.text)}</text>`;
      svg += `<text class="c-delta${row.cost ? ' cost' : ''}" x="${W - 2}" y="${yc + 4}" text-anchor="end">${row.cost ? '! ' : ''}${row.delta}</text>`;
      svg += '</g>';
    });
    svg += '</svg>';
    chartHost.innerHTML = svg;
    chartHost.append(tip);
    if (chartPending) {
      chartPending = false;
      animateChart();
    }
    chartHost.querySelectorAll('.c-row').forEach(group => {
      const row = CHART[Number(group.dataset.row)];
      const show = (x, y) => {
        tip.innerHTML = `<strong>${row.no} · ${esc(L(row.zh, row.en))}</strong>`
          + `<span><i style="background:#a4acb2"></i>${esc(L('对照', 'Comparison'))}（${esc(L(row.baseName[0], row.baseName[1]))}）${esc(minutes(row.base))}</span>`
          + `<span><i style="background:#06899d"></i>TwinHospital2 ${esc(row.valueText ? L(row.valueText[0], row.valueText[1]) : minutes(row.value))}</span>`
          + `<span>${esc(L('变化', 'Change'))} ${row.delta}${row.cost ? esc(L('（成本上升）', ' (cost increase)')) : ''}</span>`;
        tip.hidden = false;
        const box = chartHost.getBoundingClientRect();
        const left = Math.min(box.width - tip.offsetWidth - 4, Math.max(4, x + 16));
        tip.style.left = `${left}px`;
        tip.style.top = `${Math.max(0, y - tip.offsetHeight - 10)}px`;
      };
      group.addEventListener('pointermove', event => {
        const box = chartHost.getBoundingClientRect();
        show(event.clientX - box.left, event.clientY - box.top);
      });
      group.addEventListener('pointerleave', () => { tip.hidden = true; });
      group.addEventListener('focus', () => {
        const r = group.getBoundingClientRect();
        const box = chartHost.getBoundingClientRect();
        show(r.left - box.left + r.width * 0.55, r.top - box.top + 8);
      });
      group.addEventListener('blur', () => { tip.hidden = true; });
    });
  }

  /* ---------- citation ---------- */
  (() => {
    const button = document.querySelector('[data-copy-cite]');
    const source = document.querySelector('[data-cite-text]');
    if (!button || !source) return;
    const reset = () => { button.textContent = t('复制'); button.classList.remove('copied'); };
    document.addEventListener('langchange', reset);
    button.addEventListener('click', async () => {
      const text = source.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      button.textContent = t('已复制');
      button.classList.add('copied');
      setTimeout(reset, 1600);
    });
  })();

  /* ---------- motion layer ---------- */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const masthead = document.querySelector('[data-masthead]');
  const heroEl = document.querySelector('.hero');
  const bar = document.querySelector('[data-progress]');
  const ink = document.querySelector('.nav-ink');

  // Masthead: dark glass over the hero, white after it; reading progress.
  let queued = false;
  const onScroll = () => {
    queued = false;
    const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
    masthead.classList.toggle('on-dark', heroBottom > 64);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Sliding indicator under the active nav link.
  const moveInk = () => {
    if (!ink) return;
    const active = nav.querySelector('a[aria-current="true"]');
    if (!active || nav.classList.contains('open')) { ink.style.opacity = '0'; return; }
    ink.style.left = `${active.offsetLeft}px`;
    ink.style.width = `${active.offsetWidth}px`;
    ink.style.top = `${active.offsetTop + active.offsetHeight + 4}px`;
    ink.style.opacity = '1';
  };
  new MutationObserver(moveInk).observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  window.addEventListener('resize', moveInk, { passive: true });
  document.addEventListener('langchange', () => requestAnimationFrame(moveInk));

  // Count-up numbers.
  const countUp = el => {
    const target = Number(el.dataset.count);
    if (REDUCED.matches || !target) { el.textContent = target.toLocaleString('en-US'); return; }
    const t0 = performance.now();
    const dur = 1100 + Math.min(900, target * 2);
    const step = now => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4))).toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Scroll reveals; staggered rows; per-figure entrances.
  document.querySelectorAll('[data-stagger]').forEach(group => {
    group.querySelectorAll('tbody tr, :scope > li').forEach((row, i) => row.style.setProperty('--n', Math.min(i, 30)));
  });
  document.querySelectorAll('[data-facts] dl > div').forEach((cell, i) => cell.style.setProperty('--n', i));
  const onReveal = el => {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(countUp);
    if (el.classList.contains('plan-figure')) {
      planDrawn = true;
      plan.classList.add('drawn');
    }
    if (el.classList.contains('chart-figure')) {
      chartPending = true;
      renderChart();
    }
  };
  if ('IntersectionObserver' in window && !REDUCED.matches) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      onReveal(entry.target);
      io.unobserve(entry.target);
    }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('[data-reveal], [data-facts]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal], [data-facts]').forEach(onReveal);
  }

  // Evidence images tilt toward the pointer, with a soft glare.
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('pointermove', event => {
      if (!fine.matches || REDUCED.matches) return;
      const r = el.getBoundingClientRect();
      const px = (event.clientX - r.left) / r.width;
      const py = (event.clientY - r.top) / r.height;
      el.classList.add('moving');
      el.style.setProperty('--ry', `${(px - 0.5) * 7}deg`);
      el.style.setProperty('--rx', `${(0.5 - py) * 6}deg`);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('moving');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  // Cursor spotlight in the dark band.
  document.querySelectorAll('.section-dark').forEach(section => {
    section.addEventListener('pointermove', event => {
      if (REDUCED.matches) return;
      const r = section.getBoundingClientRect();
      section.style.setProperty('--mx', `${event.clientX - r.left}px`);
      section.style.setProperty('--my', `${event.clientY - r.top}px`);
    });
  });

  // Loops that only run while their figure is on screen.
  const whileVisible = (el, onTick, period) => {
    if (!el || REDUCED.matches || !('IntersectionObserver' in window)) return;
    let timer = 0;
    new IntersectionObserver(entries => entries.forEach(entry => {
      clearInterval(timer);
      timer = 0;
      if (entry.isIntersecting) { onTick(); timer = setInterval(onTick, period); }
    }), { threshold: 0.25 }).observe(el);
  };

  // Outpatient pathway: the current stage advances across the table.
  (() => {
    const wrap = document.querySelector('[data-pathway]');
    if (!wrap) return;
    const table = wrap.querySelector('.pathway');
    const heads = [...table.querySelectorAll('thead tr:not(.pw-rail-row) th')].slice(1);
    const rail = table.querySelector('.pw-rail span');
    let stage = -1;
    let paused = false;
    let following = false;
    wrap.addEventListener('pointerenter', () => { paused = true; });
    wrap.addEventListener('pointerleave', () => { paused = false; });
    // `fill` (0–1) draws the rail part-way through the stage column.
    const show = (i, fill = 1) => {
      table.querySelectorAll('.now').forEach(el => el.classList.remove('now'));
      heads.forEach(th => th.querySelector('button').removeAttribute('aria-current'));
      if (i < 0) { rail.style.width = '0'; return; }
      heads[i].classList.add('now');
      if (following) heads[i].querySelector('button').setAttribute('aria-current', 'step');
      table.querySelectorAll('tbody tr').forEach(row => row.children[i + 1].classList.add('now'));
      const th = heads[i];
      rail.style.width = `${th.offsetLeft + th.offsetWidth * fill}px`;
    };
    whileVisible(wrap, () => {
      if (paused || following || wrap.closest('[hidden]')) return;
      stage = (stage + 1) % (heads.length + 1);
      show(stage === heads.length ? -1 : stage);
    }, 1700);
    // Once the replay is playing, the table follows the video instead.
    const video = document.querySelector('[data-journey] video');
    if (!video) return;
    const STARTS = [0, 3, 13, 32, 44, 72];
    const follow = () => {
      if (!video.played.length && video.currentTime === 0) return;
      following = true;
      table.classList.add('following');
      const now = video.currentTime;
      const i = STARTS.reduce((acc, start, k) => (now >= start ? k : acc), 0);
      const end = i + 1 < STARTS.length ? STARTS[i + 1] : video.duration || 86;
      show(i, Math.min(1, Math.max(0, (now - STARTS[i]) / (end - STARTS[i]))));
    };
    ['timeupdate', 'seeked', 'play'].forEach(type => video.addEventListener(type, follow));
    video.addEventListener('ended', () => {
      following = false;
      table.classList.remove('following');
    });
  })();

  // System stack: layers light up from the foundation to the evidence.
  (() => {
    const fig = document.querySelector('[data-stack]');
    if (!fig) return;
    const layers = [...fig.querySelectorAll('.layer')].reverse();
    let i = 0;
    whileVisible(fig, () => {
      layers.forEach((layer, k) => layer.classList.toggle('pulse', k === i));
      i = (i + 1) % layers.length;
    }, 800);
  })();

  // Architecture: the live data chain steps from dialogue to HIS record.
  (() => {
    const svg = document.querySelector('.arch');
    if (!svg) return;
    const boxes = [...svg.querySelectorAll('.a-flow rect')];
    let i = 0;
    whileVisible(svg, () => {
      boxes.forEach((box, k) => box.classList.toggle('lit', k === i));
      i = (i + 1) % (boxes.length + 1);
    }, 850);
  })();

  /* ---------- render & re-render ---------- */
  if (REDUCED.matches) planDrawn = true;
  renderPlan();
  renderChart();
  document.addEventListener('langchange', () => { renderPlan(); renderChart(); });
  if ('ResizeObserver' in window && chartHost) {
    let lastWidth = chartHost.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(chartHost.clientWidth - lastWidth) < 2) return;
      lastWidth = chartHost.clientWidth;
      renderChart();
    }).observe(chartHost);
  }
})();
