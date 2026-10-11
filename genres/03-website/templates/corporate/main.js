// コーポレートサイト共通スクリプト
SFX.bind();
const html = document.documentElement;
const body = document.body;

// ---------- ローディング（セッション中は初回のみ） ----------
const loader = document.querySelector('.loader');
let seen = false;
try { seen = sessionStorage.getItem('loaded') === '1'; } catch (e) { /* ignore */ }
if (loader) {
  if (seen || Motion.reduce) loader.remove();
  else {
    window.addEventListener('load', () => setTimeout(() => {
      loader.classList.add('is-done');
      try { sessionStorage.setItem('loaded', '1'); } catch (e) { /* ignore */ }
      setTimeout(() => loader.remove(), 1200);
    }, 1300));
  }
}

// ---------- ページ遷移（カーテン） ----------
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || a.target || e.metaKey || e.ctrlKey || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname === location.pathname || a.getAttribute('href').startsWith('#')) return;
  e.preventDefault();
  SFX.play('whoosh');
  body.classList.add('is-leaving');
  setTimeout(() => { location.href = a.href; }, Motion.reduce ? 0 : 550);
});
window.addEventListener('pageshow', () => body.classList.remove('is-leaving'));

// ---------- メニュー ----------
const menuBtn = document.querySelector('.menu-btn');
menuBtn && menuBtn.addEventListener('click', () => {
  const open = !body.classList.contains('is-menu');
  body.classList.toggle('is-menu', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  SFX.play(open ? 'swoosh' : 'swipe');
});

// ---------- スクロールでヘッダーを隠す ----------
const hd = document.querySelector('.hd');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  if (hd && !body.classList.contains('is-menu')) hd.classList.toggle('is-hidden', y > lastY && y > 200);
  lastY = y;
}, { passive: true });

// ---------- 背景色が変わるセクション ----------
const dark = document.querySelectorAll('[data-bg="dark"]');
if (dark.length) {
  new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) body.classList.add('is-dark'); else if (e.boundingClientRect.top > 0) body.classList.remove('is-dark'); }), { rootMargin: '-45% 0px -45% 0px' }).observe(dark[0]);
}

// ---------- サービス一覧：ホバーで画像が追従 ----------
const follow = document.querySelector('.follow-img');
if (follow) {
  let x = 0, y = 0, fx = 0, fy = 0;
  document.querySelectorAll('[data-follow]').forEach((a) => {
    a.addEventListener('pointerenter', () => { follow.style.background = a.dataset.follow; follow.classList.add('is-on'); });
    a.addEventListener('pointerleave', () => follow.classList.remove('is-on'));
  });
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; });
  (function loop() { fx += (x - fx) * 0.15; fy += (y - fy) * 0.15; follow.style.left = fx + 'px'; follow.style.top = fy + 'px'; requestAnimationFrame(loop); })();
}

// ---------- 横スクロール実績 ----------
document.querySelectorAll('.hs').forEach((sec) => {
  const track = sec.querySelector('.hs__track');
  const size = () => { sec.style.height = (track.scrollWidth - innerWidth + innerHeight) + 'px'; };
  const upd = () => {
    const r = sec.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    track.style.transform = `translate3d(${-(track.scrollWidth - innerWidth) * p}px,0,0)`;
  };
  size(); upd();
  addEventListener('resize', () => { size(); upd(); });
  addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
});

// ---------- トップへ戻る ----------
document.querySelectorAll('.to-top').forEach((b) => b.addEventListener('click', () => { SFX.play('riser'); scrollTo({ top: 0, behavior: Motion.reduce ? 'auto' : 'smooth' }); }));

// ---------- お問い合わせフォーム ----------
const form = document.querySelector('.form');
form && form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) { SFX.play('error'); return; }
  // 実送信は Formspree / Googleフォーム / Netlify Forms 等に接続
  form.innerHTML = '<p class="statement">送信が完了しました。<br><span class="dim">2営業日以内にご連絡いたします。</span></p>';
  SFX.play('chime');
  Motion.confetti({ colors: [getComputedStyle(html).getPropertyValue('--c-primary').trim(), getComputedStyle(html).getPropertyValue('--c-accent').trim(), '#ffffff'], sound: false });
});
