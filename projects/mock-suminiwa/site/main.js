/* Original mock-project enhancement; no remote services or persistent storage. */
(() => {
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-button');
  const nav = document.querySelector('#nav');
  const close = (restoreFocus = false) => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close(true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.header')) close();
  });
  document.addEventListener('focusin', (event) => {
    if (!event.target.closest('.header')) close();
  });
  window.matchMedia('(min-width: 769px)').addEventListener('change', () => close());
  const form = document.querySelector('#inquiry-form');
  const summary = document.querySelector('#summary');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const needs = form.elements.needs.value.trim();
    form.elements.name.setCustomValidity(name ? '' : 'お名前を入力してください。');
    form.elements.needs.setCustomValidity(needs.length >= 10 ? '' : '相談内容を10文字以上で入力してください。');
    if (!form.reportValidity()) return;
    summary.value = `澄庭 SUMINIWA — 相談準備メモ（架空案件デモ）\n\nお名前: ${name}\nメールアドレス: ${form.elements.email.value.trim()}\n\nつくりたい庭・気になること:\n${needs}\n\nこのメモはブラウザ内で作成しました。サーバーへの送信は行っていません。`;
    document.querySelector('#result').hidden = false;
    document.querySelector('#result-status').textContent = '相談メモを作成しました。内容を確認して保存できます。送信はされていません。';
  });
  ['name', 'needs'].forEach((field) => form.elements[field].addEventListener('input', () => form.elements[field].setCustomValidity('')));
  document.querySelector('#download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([summary.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suminiwa-consultation.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
