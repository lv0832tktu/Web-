const menu = document.querySelector<HTMLButtonElement>('.menu');
const nav = document.querySelector<HTMLElement>('#navigation');
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く'); nav?.classList.toggle('is-open',open); });
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click',()=> {nav.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','メニューを開く');}));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = document.querySelectorAll<HTMLElement>('.reveal');
if (reduced || !('IntersectionObserver' in window)) targets.forEach(x => x.classList.add('visible'));
else { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }}),{threshold:0.08});targets.forEach(x=>observer.observe(x)); }
