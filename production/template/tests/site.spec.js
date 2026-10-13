import { test, expect } from '@playwright/test';
test('主要表示、アクセシビリティの基本、ランタイムエラー', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  page.on('requestfailed', r => errors.push(r.url()));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: '本文へ移動' })).toHaveAttribute('href', '#main');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});
test('画像とページ内リンク・同一オリジンリンクに欠損がない', async ({ page, request }) => {
  await page.goto('/');
  const images = await page.locator('img').evaluateAll(items => items.map(i => ({ src:i.src, alt:i.hasAttribute('alt'), valid:i.complete && i.naturalWidth > 0, dimensions:i.hasAttribute('width') && i.hasAttribute('height') })));
  for (const image of images) { expect(image.alt).toBe(true); expect(image.valid).toBe(true); expect(image.dimensions).toBe(true); }
  for (const href of await page.locator('a[href]').evaluateAll(items => items.map(i => i.getAttribute('href')))) {
    expect(href.trim()).not.toBe('');
    const url = new URL(href,'http://127.0.0.1:4173');
    if (url.origin !== 'http://127.0.0.1:4173') continue; // 外部リンクは納品前に個別確認
    if (url.hash) expect(await page.evaluate(hash => !!document.getElementById(decodeURIComponent(hash.slice(1))),url.hash)).toBe(true);
    else expect((await request.get(url.href)).status()).toBeLessThan(400);
  }
});
test('実行中のreduced-motion変更でアニメーションを解除', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion:'reduce' });
  await expect.poll(() => page.locator('[data-char]').first().evaluate(e => getComputedStyle(e).opacity)).toBe('1');
  await page.locator('#concept').scrollIntoViewIfNeeded();
  await expect(page.locator('#concept')).toBeVisible();
});
test('reduced-motionで表示できる', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
test('キーボードでスキップリンクに到達できる', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '本文へ移動' })).toBeFocused();
});
