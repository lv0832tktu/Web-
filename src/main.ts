import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';

const menu = document.querySelector<HTMLButtonElement>('.menu');
const nav = document.querySelector<HTMLElement>('#navigation');

function setMenu(open: boolean) {
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-label', open ? 'MENU メニューを閉じる' : 'MENU メニューを開く');
  nav?.classList.toggle('is-open', open);
}
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  setMenu(false);
  const target = document.querySelector<HTMLElement>(a.hash);
  target?.focus({ preventScroll: true });
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
document.addEventListener('click', event => {
  if (event.target instanceof Node && !nav?.contains(event.target) && !menu?.contains(event.target)) setMenu(false);
});
window.matchMedia('(min-width: 801px)').addEventListener('change', () => setMenu(false));

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = document.querySelectorAll<HTMLElement>('.reveal');
if (!reduced && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.08 });
  targets.forEach(target => {
    // Above-the-fold content stays visible without waiting for an observer callback.
    if (target.getBoundingClientRect().top < window.innerHeight) target.classList.add('visible');
    else { target.classList.add('reveal-pending'); observer.observe(target); }
  });
}
