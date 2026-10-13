import { test, expect } from '@playwright/test';
test('主要表示、アクセシビリティの基本、ランタイムエラー', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: '本文へ移動' })).toHaveAttribute('href', '#main');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
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
