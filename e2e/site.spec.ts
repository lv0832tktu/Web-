import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test('landmarks, sections and complete screenshots', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const id of ['concept', 'ritual', 'collection']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  for (const target of await page.locator('.reveal').all()) {
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveCSS('opacity', '1');
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `test-results/site-${test.info().project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('no horizontal overflow or clipped headings', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  for (const heading of await page.locator('h1, h2, h3').all()) {
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  }
});

test('reduced motion keeps all content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const target of await page.locator('.reveal').all()) await expect(target).toHaveCSS('opacity', '1');
});

test('navigation supports keyboard, Escape and section focus', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('button.menu');
  if (test.info().project.name === 'desktop') {
    await expect(button).toBeHidden();
  } else {
    await expect(button).toBeVisible();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    // Tablet also has an Explore link between the navigation and toggle.
    await button.focus();
    await page.keyboard.press('Shift+Tab');
    if (test.info().project.name === 'tablet') {
      await expect(page.locator('.header-cta')).toBeFocused();
      await page.keyboard.press('Shift+Tab');
    }
    await expect(page.locator('#navigation a').last()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    await button.click();
  }
  await page.locator('#navigation a[href="#collection"]').click();
  await expect(page).toHaveURL(/#collection$/);
  await expect(page.locator('#collection')).toBeFocused();
  if (test.info().project.name !== 'desktop') await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('skip link moves keyboard focus to main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '本文へスキップ' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('content and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: test.info().project.use.viewport });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.section-main')).toHaveCSS('opacity', '1');
  await expect(page.locator('#navigation a').first()).toBeVisible();
  await page.locator('#navigation a').first().click();
  await expect(page).toHaveURL(/#concept$/);
  await context.close();
});
