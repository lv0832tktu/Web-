import { test, expect } from '@playwright/test';
test('3Dは操作前にロードしない・軽減設定で解除', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(0);
  const button = page.getByRole('button',{name:'3D表示を読み込む'});
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(button).toHaveCount(0);
});
