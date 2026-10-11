// UMINARI COFFEE LP 固有のインタラクション（共通の動きは shared/js/motion.js が data属性で処理）
SFX.bind();
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// ---------- FVの海：波のキャンバス（色は tokens.css から取得） ----------
document.querySelectorAll('[data-sea-waves]').forEach((cv) => {
  GFX.mount(cv, 'waves', { colors: [css('--c-primary'), css('--c-bg'), css('--c-text')].join(','), layers: 3 });
});

// ---------- 日の入り時刻（沖縄本島 西海岸 付近・NOAAの簡易式。誤差±数分の目安） ----------
const LAT = 26.45, LNG = 127.8, TZ = 9;
const OPEN = 11 * 60, CLOSE = 20 * 60; // タイムラインの表示範囲
const rad = Math.PI / 180;
function sunsetMinutes(date) {
  const n = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 864e5);
  const g = (2 * Math.PI / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * rad) / (Math.cos(LAT * rad) * Math.cos(decl)) - Math.tan(LAT * rad) * Math.tan(decl)) / rad;
  return Math.round(720 - 4 * (LNG - ha) - eq + TZ * 60);
}
const hm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const pct = (m) => ((m - OPEN) / (CLOSE - OPEN)) * 100;

function renderSunset(date) {
  const s = sunsetMinutes(date);
  const from = s - 60, to = s + 30; // サンセット予約枠：日の入り60分前から90分間
  document.querySelectorAll('[data-sunset-out]').forEach((el) => (el.textContent = hm(s)));
  document.querySelectorAll('[data-sunset-slot]').forEach((el) => (el.textContent = `${hm(from)} – ${hm(to)}`));
  document.querySelectorAll('[data-sunset-win]').forEach((el) => { el.style.setProperty('--win-l', pct(from) + '%'); el.style.setProperty('--win-w', pct(to) - pct(from) + '%'); });
  document.querySelectorAll('[data-sunset-dot]').forEach((el) => el.style.setProperty('--dot', pct(s) + '%'));
}

const today = new Date();
document.querySelectorAll('[data-sunset-today]').forEach((el) => (el.textContent = hm(sunsetMinutes(today))));
const dateInputs = document.querySelectorAll('input[data-sunset-date]');
const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 90);
dateInputs.forEach((input) => {
  input.min = iso(today); input.max = iso(maxDate);
  if (!input.name) input.value = iso(today); // 「今日の夕日」セクションは今日を初期表示
  input.addEventListener('change', () => {
    if (!input.value) return;
    const [y, m, d] = input.value.split('-').map(Number);
    // 2つの日付欄（夕日セクションと予約フォーム）を同期
    dateInputs.forEach((o) => { if (o !== input) { o.value = input.value; o.dispatchEvent(new Event('input')); } });
    renderSunset(new Date(y, m - 1, d));
    SFX.play('drop');
  });
});
renderSunset(today);

// ---------- FAQ：1つ開いたら他を閉じる ----------
document.querySelectorAll('.faq details').forEach((d, _, all) => {
  d.addEventListener('toggle', () => { if (d.open) all.forEach((o) => { if (o !== d) o.open = false; }); });
});

// ---------- 追従CTA：FVを過ぎたら出す／フォームが見えたら隠す ----------
const sticky = document.querySelector('.sticky-cta');
const formSec = document.querySelector('#reserve');
if (sticky) {
  let pastFv = false, formVisible = false;
  const upd = () => sticky.classList.toggle('is-show', pastFv && !formVisible);
  new IntersectionObserver(([e]) => { pastFv = !e.isIntersecting; upd(); }).observe(document.querySelector('.fv'));
  if (formSec) new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; upd(); }).observe(formSec);
}

// ---------- 予約フォーム：進捗バー・インライン検証・完了演出 ----------
document.querySelectorAll('.form').forEach((f) => {
  const fields = [...f.querySelectorAll('input,select')];
  const bar = f.querySelector('.form__progress span');
  const progress = () => { bar.style.width = (fields.filter((x) => x.value && x.checkValidity()).length / fields.length) * 100 + '%'; };
  fields.forEach((x) => {
    x.addEventListener('input', progress);
    x.addEventListener('change', progress);
    x.addEventListener('blur', () => { if (x.value) { const ok = x.checkValidity(); x.classList.toggle('is-error', !ok); x.setAttribute('aria-invalid', String(!ok)); } });
  });
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = fields.filter((x) => !x.checkValidity());
    fields.forEach((x) => { x.classList.toggle('is-error', bad.includes(x)); x.setAttribute('aria-invalid', String(bad.includes(x))); });
    if (bad.length) { SFX.play('error'); bad[0].focus(); return; }
    // ここで予約管理サービスへ送信する（README.txt「フォームの接続」参照）
    f.hidden = true;
    const t = f.parentElement.querySelector('.thanks');
    t.hidden = false;
    t.setAttribute('tabindex', '-1'); t.focus();
    SFX.play('soft-bell');
    const r = t.getBoundingClientRect();
    Motion.confetti({ x: r.left + r.width / 2, y: r.top + 60, colors: [css('--c-accent'), css('--c-primary'), css('--c-bg'), css('--c-surface')], sound: false });
  });
});
