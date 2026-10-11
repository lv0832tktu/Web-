// LP固有のインタラクション（共通の動きは shared/js/motion.js が data属性で処理）
SFX.bind();

// ビフォーアフタースライダー
document.querySelectorAll('.ba__slider').forEach((el) => {
  const input = el.querySelector('input');
  let last = 50;
  input.addEventListener('input', () => {
    el.style.setProperty('--pos', input.value + '%');
    if (Math.abs(input.value - last) >= 10) { SFX.play('tick'); last = +input.value; }
  });
});

// カウントダウン（data-deadline 未指定なら今月末）
document.querySelectorAll('.countdown').forEach((el) => {
  const now = new Date();
  const end = el.dataset.deadline ? new Date(el.dataset.deadline) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    el.querySelector('.d').textContent = pad(Math.floor(s / 86400));
    el.querySelector('.h').textContent = pad(Math.floor(s / 3600) % 24);
    el.querySelector('.m').textContent = pad(Math.floor(s / 60) % 60);
    el.querySelector('.s').textContent = pad(s % 60);
  };
  tick(); setInterval(tick, 1000);
});

// FAQ：1つ開いたら他を閉じる
document.querySelectorAll('.faq details').forEach((d, _, all) => {
  d.addEventListener('toggle', () => { if (d.open) all.forEach((o) => { if (o !== d) o.open = false; }); });
});

// 追従CTA：FVを過ぎたら出す／フォームが見えたら隠す
const sticky = document.querySelector('.sticky-cta');
const form = document.querySelector('#form');
if (sticky) {
  let pastFv = false, formVisible = false;
  const upd = () => sticky.classList.toggle('is-show', pastFv && !formVisible);
  new IntersectionObserver(([e]) => { pastFv = !e.isIntersecting; upd(); }).observe(document.querySelector('.fv'));
  if (form) new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; upd(); }).observe(form);
}

// フォーム：進捗バー・インラインバリデーション・完了演出
document.querySelectorAll('.form').forEach((f) => {
  const fields = [...f.querySelectorAll('input,select')];
  const bar = f.querySelector('.form__progress span');
  const progress = () => { bar.style.width = (fields.filter((x) => x.checkValidity() && x.value).length / fields.length) * 100 + '%'; };
  fields.forEach((x) => {
    x.addEventListener('input', progress);
    x.addEventListener('blur', () => { if (x.value) { const ok = x.checkValidity(); x.classList.toggle('is-error', !ok); if (ok) SFX.play('tick'); } });
  });
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = fields.filter((x) => !x.checkValidity());
    fields.forEach((x) => x.classList.toggle('is-error', bad.includes(x)));
    if (bad.length) { SFX.play('error'); bad[0].focus(); return; }
    // ここで実際の送信（Formspree / Googleフォーム / 自社API 等）を行う
    f.hidden = true;
    const t = f.parentElement.querySelector('.thanks');
    t.hidden = false;
    SFX.play('success');
    const r = t.getBoundingClientRect();
    Motion.confetti({ x: r.left + r.width / 2, y: r.top + 60 });
  });
});
