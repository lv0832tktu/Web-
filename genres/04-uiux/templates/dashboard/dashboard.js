// ダッシュボードのロジック（ダミーデータ → 実データAPIに差し替えて使う）
SFX.bind();
const $ = (s, r = document) => r.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const NS = 'http://www.w3.org/2000/svg';

// ---------- データ（シード付き乱数で毎回同じ） ----------
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const series = (n, base, vol) => { let v = base; return Array.from({ length: n }, () => (v = Math.max(base * 0.4, v + (rnd() - 0.45) * vol))); };
const KPI = { 7: [312, 84, 23.4, 1.8], 30: [1284, 342, 24.8, 1.6], 90: [3920, 1012, 25.6, 1.7] };
const deals = [
  ['株式会社アオバ', '佐藤', '提案', 1200000, '2026-10-10'], ['ミナト商事', '鈴木', '交渉', 3400000, '2026-10-09'], ['Hikari Labs', '田中', '成約', 860000, '2026-10-08'],
  ['北斗フーズ', '高橋', 'リード', 450000, '2026-10-08'], ['株式会社ツムギ', '伊藤', '提案', 2100000, '2026-10-06'], ['Sora Design', '佐藤', '失注', 300000, '2026-10-05'],
  ['カゼ工務店', '渡辺', '交渉', 5200000, '2026-10-03'], ['Mori Clinic', '田中', '成約', 1750000, '2026-10-02'],
];
const STAGE = { リード: '#64748b', 提案: '#2563eb', 交渉: '#d97706', 成約: '#16a34a', 失注: '#e11d48' };

// ---------- KPI ----------
function renderKpi(r) {
  document.querySelectorAll('[data-k]').forEach((el) => {
    const v = KPI[r][+el.dataset.k];
    el.dataset.counter = v; el.dataset.decimals = String(v).includes('.') ? 1 : 0; el.dataset.duration = 900;
    Motion.counter(el);
  });
  document.querySelectorAll('.spark path').forEach((p) => {
    const s = series(16, 15, 6);
    p.setAttribute('d', s.map((v, i) => `${i ? 'L' : 'M'}${(i / 15) * 100},${30 - v}`).join(''));
    const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)'; p.style.strokeDashoffset = 0;
  });
}

// ---------- 折れ線グラフ（ホバーでツールチップ） ----------
function renderChart(r) {
  const svg = $('#chart svg'); svg.textContent = '';
  const W = 600, H = 240, P = 16, n = Math.min(r, 30);
  const cur = series(n, 120, 40), prev = series(n, 100, 30);
  const max = Math.max(...cur, ...prev) * 1.1;
  const x = (i) => P + (i / (n - 1)) * (W - P * 2), y = (v) => H - P - (v / max) * (H - P * 2);
  const el = (t, a) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); svg.appendChild(e); return e; };
  svg.innerHTML = `<defs><linearGradient id="gArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${css('--c-primary')}" stop-opacity=".25"/><stop offset="1" stop-color="${css('--c-primary')}" stop-opacity="0"/></linearGradient></defs>`;
  const g = el('g', { class: 'grid' });
  for (let i = 0; i < 4; i++) { const l = document.createElementNS(NS, 'line'); const yy = P + (i * (H - P * 2)) / 3; l.setAttribute('x1', 0); l.setAttribute('x2', W); l.setAttribute('y1', yy); l.setAttribute('y2', yy); g.appendChild(l); }
  const path = (s) => s.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  el('path', { class: 'prev', d: path(prev) });
  el('path', { class: 'area', d: path(cur) + `L${x(n - 1)},${H - P}L${x(0)},${H - P}Z` });
  const line = el('path', { class: 'line', d: path(cur) });
  const L = line.getTotalLength(); line.style.strokeDasharray = L; line.style.strokeDashoffset = L;
  line.getBoundingClientRect(); line.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.65,0,.35,1)'; line.style.strokeDashoffset = 0;
  const hl = el('line', { class: 'hover-line', y1: P, y2: H - P, x1: 0, x2: 0, visibility: 'hidden' });
  const hd = el('circle', { class: 'hover-dot', r: 5, cx: 0, cy: 0, visibility: 'hidden' });
  const tip = $('#tip'); let lastI = -1;
  svg.onpointermove = (e) => {
    const b = svg.getBoundingClientRect();
    const i = Math.round(((e.clientX - b.left) / b.width * W - P) / (W - P * 2) * (n - 1));
    if (i < 0 || i >= n) return;
    hl.setAttribute('visibility', 'visible'); hd.setAttribute('visibility', 'visible');
    hl.setAttribute('x1', x(i)); hl.setAttribute('x2', x(i)); hd.setAttribute('cx', x(i)); hd.setAttribute('cy', y(cur[i]));
    tip.style.left = (x(i) / W) * 100 + '%'; tip.style.top = (y(cur[i]) / H) * 100 + '%'; tip.style.opacity = 1;
    const d = new Date(2026, 9, 11 - (n - 1 - i));
    tip.innerHTML = `${d.getMonth() + 1}/${d.getDate()}<b>¥${Math.round(cur[i] * 1000).toLocaleString()}</b>`;
    if (i !== lastI) { lastI = i; SFX.play('tick'); }
  };
  svg.onpointerleave = () => { tip.style.opacity = 0; hl.setAttribute('visibility', 'hidden'); hd.setAttribute('visibility', 'hidden'); };
}

// ---------- ドーナツ ----------
function renderDonut() {
  const data = [['検索', 42, css('--c-primary')], ['SNS', 26, css('--c-accent')], ['紹介', 18, '#16a34a'], ['広告', 14, '#94a3b8']];
  const svg = $('#donut'); svg.textContent = '';
  const C = 2 * Math.PI * 46; let off = 0;
  data.forEach(([, v, c], i) => {
    const ci = document.createElementNS(NS, 'circle');
    Object.entries({ cx: 60, cy: 60, r: 46, stroke: c, 'stroke-dasharray': `${(v / 100) * C - 2} ${C}`, 'stroke-dashoffset': C, transform: `rotate(${-90 + off * 3.6} 60 60)` }).forEach(([k, val]) => ci.setAttribute(k, val));
    svg.appendChild(ci); off += v;
    setTimeout(() => ci.setAttribute('stroke-dashoffset', 0), 100 + i * 120);
  });
  $('#channels').innerHTML = data.map(([n, v, c]) => `<li><i style="background:${c}"></i>${n}<b>${v}%</b></li>`).join('');
}

// ---------- テーブル（ソート・絞り込み） ----------
let sortKey = 'date', sortDir = -1;
const keys = ['name', 'owner', 'stage', 'amount', 'date'];
function renderTable() {
  const q = $('#filter').value.trim();
  const rows = deals.filter((d) => !q || d.join(' ').includes(q)).sort((a, b) => { const i = keys.indexOf(sortKey); return (a[i] > b[i] ? 1 : -1) * sortDir; });
  const tb = $('#tbl tbody'); tb.textContent = '';
  rows.forEach((d) => {
    const tr = document.createElement('tr');
    [d[0], d[1], null, '¥' + d[3].toLocaleString(), d[4].replace(/-/g, '/')].forEach((v, i) => {
      const td = document.createElement('td');
      if (i === 2) { const s = document.createElement('span'); s.className = 'stage'; s.style.setProperty('--st', STAGE[d[2]]); s.textContent = d[2]; td.appendChild(s); } else td.textContent = v;
      if (i === 3) td.className = 'r';
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });
  document.querySelectorAll('#tbl th').forEach((th) => th.className = (th.dataset.s === sortKey ? (sortDir > 0 ? 'asc' : 'desc') : '') + (th.dataset.s === 'amount' ? ' r' : ''));
}
document.querySelectorAll('#tbl th').forEach((th) => th.addEventListener('click', () => { sortDir = sortKey === th.dataset.s ? -sortDir : 1; sortKey = th.dataset.s; SFX.play('tick'); renderTable(); }));
$('#filter').addEventListener('input', renderTable);

// ---------- 期間切替 ----------
$('#range').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('#range button').forEach((x) => x.classList.toggle('on', x === b));
  renderKpi(+b.dataset.r); renderChart(+b.dataset.r);
});

// ---------- トースト ----------
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2800);
}
$('#bell').addEventListener('click', () => toast('📈 ミナト商事の商談が「交渉」に進みました'));

// ---------- テーマ・サイドバー ----------
const setTheme = (dark) => { document.documentElement.dataset.theme = dark ? 'dark' : ''; $('#theme').textContent = dark ? '☀️' : '🌙'; renderChart(+$('#range .on').dataset.r); renderDonut(); };
$('#theme').addEventListener('click', () => setTheme(document.documentElement.dataset.theme !== 'dark'));
$('#collapse').addEventListener('click', () => $('#layout').classList.toggle('is-collapsed'));

// ---------- コマンドパレット ----------
const cmds = [
  ['📊', 'レポートを作成', 'R', () => toast('レポートを作成しました')], ['👤', '顧客を追加', 'N', () => toast('顧客追加フォームを開きます')],
  ['🌙', 'ダークモード切替', 'D', () => setTheme(document.documentElement.dataset.theme !== 'dark')], ['⟨', 'サイドバーを折りたたむ', 'B', () => $('#layout').classList.toggle('is-collapsed')],
  ['⬇', 'CSVをエクスポート', 'E', () => { SFX.play('success'); toast('CSVを書き出しました'); }],
];
let sel = 0, list = cmds;
const cmd = $('#cmd'), input = $('#cmdInput');
function drawCmd() {
  const ul = $('#cmdList'); ul.textContent = '';
  list.forEach(([ico, label, key], i) => { const li = document.createElement('li'); li.className = i === sel ? 'sel' : ''; li.innerHTML = '<span></span><span></span><small></small>'; li.children[0].textContent = ico; li.children[1].textContent = label; li.children[2].textContent = key; li.onclick = () => run(i); ul.appendChild(li); });
}
function openCmd() { cmd.hidden = false; input.value = ''; list = cmds; sel = 0; drawCmd(); input.focus(); SFX.play('swoosh'); }
function closeCmd() { cmd.hidden = true; }
function run(i) { const c = list[i]; closeCmd(); if (c) { SFX.play('click'); c[3](); } }
$('#openCmd').addEventListener('click', openCmd);
cmd.addEventListener('click', (e) => { if (e.target === cmd) closeCmd(); });
input.addEventListener('input', () => { list = cmds.filter((c) => c[1].includes(input.value) || input.value.includes(c[1].slice(0, 2))); sel = 0; drawCmd(); });
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmd.hidden ? openCmd() : closeCmd(); }
  if (cmd.hidden) return;
  if (e.key === 'Escape') closeCmd();
  if (e.key === 'ArrowDown') { sel = (sel + 1) % list.length; drawCmd(); SFX.play('tick'); }
  if (e.key === 'ArrowUp') { sel = (sel - 1 + list.length) % list.length; drawCmd(); SFX.play('tick'); }
  if (e.key === 'Enter') run(sel);
});

renderKpi(30); renderChart(30); renderDonut(); renderTable();
