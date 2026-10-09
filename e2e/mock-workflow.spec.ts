import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
const site = '/projects/mock-suminiwa/site/';
test('mock project illustrations, layout, FAQ and accessibility', async ({page}, info) => {
  await page.goto(site);
  await expect(page.locator('h1')).toContainText('余白を植える');
  await expect(page.locator('.project')).toHaveCount(3);
  await expect(page.locator('.project svg[role="img"]')).toHaveCount(3);
  for (const card of await page.locator('.project').all()) await expect(card.locator('svg')).toBeVisible();
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', await page.evaluate(() => window.innerWidth));
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`test-results/mock-${info.project.name}.png`, fullPage:true});
  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await expect(page.locator('details')).toHaveCount(3);
  await page.locator('details summary').first().click();
  await expect(page.locator('details').first()).toHaveAttribute('open','');
});
test('mock navigation keyboard and outside closing, CTA', async ({page}) => {
  await page.goto(site);
  const toggle = page.getByRole('button',{name:'メニュー',exact:true});
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await toggle.click();
    await page.locator('h1').click();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await toggle.click();
  }
  await page.locator('.nav-cta').click();
  await expect(page).toHaveURL(/#consultation$/);
  await expect(page.locator('#name')).toBeInViewport();
});
test('mock invalid input rejected; valid fictional memo downloaded locally', async ({page}) => {
  const posts:string[]=[];
  page.on('request', r => {if(r.method()==='POST') posts.push(r.url());});
  await page.goto(site);
  await page.locator('.submit').click();
  await expect(page.locator('#result')).toBeHidden();
  await page.locator('#name').fill('検証用の架空ユーザー');
  await page.locator('#email').fill('invalid');
  await page.locator('#needs').fill('木陰のある小さな中庭を検討しています。');
  await page.locator('.submit').click();
  await expect(page.locator('#result')).toBeHidden();
  await page.locator('#email').fill('qa-dummy@example.invalid');
  await page.locator('.submit').click();
  await expect(page.getByRole('status')).toContainText('送信はされていません');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('suminiwa-consultation.txt');
  const path = await download.path();
  expect(path).not.toBeNull();
  const memo = await readFile(path!, 'utf8');
  expect(memo).toContain('検証用の架空ユーザー');
  expect(memo).toContain('qa-dummy@example.invalid');
  expect(memo).toContain('木陰のある小さな中庭');
  expect(memo).toContain('サーバーへの送信は行っていません');
  expect(posts).toEqual([]);
});
test('mock reduced motion and doubled text retain readable layout', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(site);
  expect(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollBehavior)).toBe('auto');
  await page.evaluate(() => {
    const elements = [...document.querySelectorAll<HTMLElement>('body, body *')];
    const sizes = elements.map(el => Number.parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => { el.style.fontSize = `${sizes[i] * 2}px`; });
  });
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('#name')).toBeVisible();
});
test('mock without JavaScript retains content, navigation and fallback', async ({browser}, info) => {
  const context = await browser.newContext({javaScriptEnabled:false, viewport:info.project.use.viewport});
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4173${site}`);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.nav-cta')).toBeVisible();
  await expect(page.locator('noscript')).toBeVisible();
  expect(await page.locator('noscript').innerText()).toContain('コピーして保存');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
