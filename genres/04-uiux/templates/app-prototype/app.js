// UIプロトタイプのロジック（画面遷移・状態・効果音）
SFX.bind();
const app = document.getElementById('app');
const $ = (s) => app.querySelector(s);
const screens = [...app.querySelectorAll('.screen')];
const order = ['onboarding', 'home', 'detail', 'done'];
let current = null;

const state = {
  habits: [
    { id: 1, ico: '💧', name: '水を2L飲む', note: '朝・昼・夜', done: true },
    { id: 2, ico: '📚', name: '読書 10分', note: '寝る前に', done: false },
    { id: 3, ico: '🧘', name: 'ストレッチ 5分', note: 'お風呂上がり', done: false },
    { id: 4, ico: '🚶', name: '8,000歩あるく', note: '通勤で', done: false },
  ],
};

function go(name, opts = {}) {
  if (name === current) return;
  const back = current && order.indexOf(name) < order.indexOf(current);
  screens.forEach((s) => {
    const on = s.dataset.screen === name;
    s.classList.toggle('is-active', on);
    s.classList.toggle('is-back', !on && back);
  });
  if (current && !opts.silent) SFX.play(back ? 'swipe' : 'whoosh');
  current = name;
  if (name === 'home') renderHome(!opts.noSkeleton);
  if (name === 'detail') renderDetail();
  if (name === 'done') { SFX.play('level-up'); setTimeout(() => Motion.confetti({ sound: false }), 700); }
}
document.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go); });

// ---------- オンボーディング（ボタン＋スワイプ） ----------
let ob = 0;
const obSlides = $('#obSlides');
const setOb = (i) => {
  ob = Math.max(0, Math.min(2, i));
  obSlides.style.transform = `translateX(${-ob * 100}%)`;
  app.querySelectorAll('.dots i').forEach((d, k) => d.classList.toggle('on', k === ob));
  $('#obNext').textContent = ob === 2 ? 'はじめる' : '次へ';
};
$('#obNext').addEventListener('click', () => { if (ob === 2) { SFX.play('success'); go('home'); } else { SFX.play('swipe'); setOb(ob + 1); } });
let sx = null;
obSlides.addEventListener('pointerdown', (e) => { sx = e.clientX; });
obSlides.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 40) { SFX.play('swipe'); setOb(ob + (dx < 0 ? 1 : -1)); } sx = null; });

// ---------- ホーム ----------
function renderHome(skeleton) {
  const ul = $('#habits');
  if (skeleton) {
    ul.innerHTML = '<li class="skeleton"></li>'.repeat(4);
    setTimeout(() => drawHabits(), 700); // ドハティの閾値：待ち時間はスケルトンで体感短縮
  } else drawHabits();
}
function drawHabits() {
  const ul = $('#habits');
  ul.textContent = '';
  state.habits.forEach((h, i) => {
    const li = document.createElement('li');
    li.className = 'habit' + (h.done ? ' is-done' : '');
    li.style.animationDelay = i * 60 + 'ms';
    li.innerHTML = `<span class="habit__ico"></span><span class="habit__txt"><b></b><small></small></span><button class="chk" aria-label="完了にする" aria-pressed="${h.done}">✓</button>`;
    li.querySelector('.habit__ico').textContent = h.ico;
    li.querySelector('b').textContent = h.name;
    li.querySelector('small').textContent = h.note;
    li.querySelector('.habit__txt').addEventListener('click', () => { state.sel = h; go('detail'); });
    li.querySelector('.chk').addEventListener('click', () => toggle(h, li));
    ul.appendChild(li);
  });
  updateSummary();
}
function toggle(h, li) {
  h.done = !h.done; // 楽観的UI：サーバー応答を待たずに即反映
  li.classList.toggle('is-done', h.done);
  li.querySelector('.chk').setAttribute('aria-pressed', h.done);
  li.classList.remove('pop'); void li.offsetWidth; li.classList.add('pop');
  SFX.play(h.done ? 'pop' : 'toggle-off');
  if (navigator.vibrate) navigator.vibrate(h.done ? 12 : 6);
  updateSummary();
  if (h.done) toast(`「${h.name}」を記録しました`, () => toggle(h, li));
  if (state.habits.every((x) => x.done)) setTimeout(() => go('done'), 900);
}
function updateSummary() {
  const d = state.habits.filter((x) => x.done).length, t = state.habits.length;
  const p = Math.round((d / t) * 100);
  $('#doneCount').textContent = d; $('#total').textContent = t; $('#pct').textContent = p;
  $('#ringFg').style.strokeDashoffset = 264 - 264 * (d / t);
}

// ---------- 詳細 ----------
function renderDetail() {
  const h = state.sel || state.habits[1];
  $('#dTitle').textContent = h.ico + ' ' + h.name;
  const heat = $('#heat'); heat.textContent = '';
  for (let i = 0; i < 30; i++) { const c = document.createElement('i'); c.style.setProperty('--v', [0, .3, .6, 1][(i * 7 + 3) % 4]); c.style.setProperty('--i', i); heat.appendChild(c); }
  const vals = [40, 65, 55, 80, 72, 90, 100];
  const svg = $('#bars');
  svg.innerHTML = vals.map((v, i) => `<rect x="${i * 42 + 10}" y="${100 - v}" width="26" height="${v}" rx="6" style="animation-delay:${i * 80}ms;opacity:${0.4 + v / 170}"/><text x="${i * 42 + 23}" y="116" text-anchor="middle">W${i + 1}</text>`).join('');
}

// ---------- ボトムシート ----------
$('#fab').addEventListener('click', () => { app.classList.add('is-sheet'); SFX.play('swoosh'); setTimeout(() => $('#newName').focus(), 400); });
$('#sheetBg').addEventListener('click', closeSheet);
function closeSheet() { app.classList.remove('is-sheet'); SFX.play('swipe'); }
$('#icons').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; app.querySelectorAll('#icons button').forEach((x) => x.classList.toggle('on', x === b)); SFX.play('tick'); });
$('#addBtn').addEventListener('click', () => {
  const inp = $('#newName');
  if (!inp.value.trim()) { inp.classList.remove('is-error'); void inp.offsetWidth; inp.classList.add('is-error'); $('#err').hidden = false; SFX.play('error'); return; }
  $('#err').hidden = true; inp.classList.remove('is-error');
  state.habits.push({ id: Date.now(), ico: app.querySelector('#icons .on').textContent, name: inp.value.trim(), note: '新しい習慣', done: false });
  inp.value = '';
  closeSheet(); SFX.play('success'); drawHabits(); toast('習慣を追加しました 🎉');
});

// ---------- トースト（取り消し付き） ----------
let tt;
function toast(msg, undo) {
  const t = $('#toast');
  t.innerHTML = '<span></span>' + (undo ? '<button type="button">取り消す</button>' : '');
  t.firstChild.textContent = msg;
  if (undo) t.querySelector('button').onclick = () => { undo(); t.classList.remove('is-show'); };
  t.classList.add('is-show');
  SFX.play('notify');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-show'), 2600);
}

// ---------- テーマ ----------
document.getElementById('themeBtn').addEventListener('click', (e) => {
  const dark = app.dataset.theme !== 'dark';
  app.dataset.theme = dark ? 'dark' : 'light';
  e.target.textContent = dark ? '☀️ ライトモード' : '🌙 ダークモード';
});

go(new URLSearchParams(location.search).get('screen') || 'onboarding', { silent: true });
