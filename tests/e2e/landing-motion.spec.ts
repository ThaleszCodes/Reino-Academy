import { test, expect } from '@playwright/test';

test('content enters on scroll, stays revealed, and checkout remains actionable', async ({ page }) => {
  await page.goto('/');
  const resource = page.locator('.lp-resource').first();
  await expect(resource).toHaveAttribute('data-reveal', 'pending');
  await resource.scrollIntoViewIfNeeded();
  await expect(resource).toHaveAttribute('data-reveal', 'visible');
  await expect(resource).toHaveCSS('opacity', '1');
  await expect(resource).toHaveCSS('filter', 'none');
  await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
  await expect(resource).toHaveAttribute('data-reveal', 'visible');
  await page.getByRole('button', { name: 'Conhecer os planos' }).click();
  const checkout = page.getByRole('link', { name: 'Escolher Completo' });
  // Exercise real link navigation without creating an order or calling Cakto.
  await page.route('https://pay.cakto.com.br/r8oymyi', route => route.fulfill({ body: 'Checkout destination verified' }));
  await checkout.click();
  await expect(page).toHaveURL('https://pay.cakto.com.br/r8oymyi');
});

test('keyboard focus reveals an offscreen control immediately', async ({ page }) => {
  await page.goto('/');
  const checkout = page.getByRole('link', { name: 'Escolher Avançado' });
  await checkout.focus();
  await expect(checkout).toBeFocused();
  await expect(page.locator('.lp-offer').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.lp-offer').last()).toHaveCSS('filter', 'none');
});

test('reduced motion works initially and when changed during the visit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  await expect(page.locator('.lp-bottom-glass')).toHaveCSS('display', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.lp-resource').first()).toHaveAttribute('data-reveal', 'pending');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  await expect(page.locator('.lp-resource').first()).toHaveCSS('opacity', '1');
  const firstQuestion = page.locator('.lp-faq-item summary').first();
  await firstQuestion.click();
  await expect(page.locator('.lp-faq-item').first()).toHaveAttribute('open', '');
});

test('content remains usable when entrance observers are unsupported', async ({ page }) => {
  await page.addInitScript(() => { Reflect.deleteProperty(window, 'IntersectionObserver'); });
  await page.goto('/');
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Conhecer os planos' }).click();
  await expect(page.locator('#planos')).toBeInViewport();
  await expect(page.getByRole('link', { name: 'Escolher Completo' })).toBeVisible();
});

test('glass never intercepts input and clears at the page end', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.lp-bottom-glass')).toHaveCSS('pointer-events', 'none');
  await page.locator('.lp-page-end').scrollIntoViewIfNeeded();
  await expect(page.locator('.lp-bottom-glass')).toHaveCSS('opacity', '0');
  await page.getByRole('navigation', { name: 'Links do rodapé' }).getByRole('link', { name: 'Acessar minha conta' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  await expect(page.locator('.lp-bottom-glass')).toHaveCount(0);
});

test('entire landing renders without broken images or horizontal overflow', async ({ page }, info) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  for (const section of await page.locator('.lp section, .lp footer').all()) {
    await section.scrollIntoViewIfNeeded();
    // Visit each animated element, including tall sections on small screens.
    for (const child of await section.locator('[data-reveal]').all()) {
      await child.scrollIntoViewIfNeeded();
      await expect(child).toHaveCSS('opacity', '1');
    }
  }
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  for (const image of await page.locator('.lp img').all()) {
    expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('premium-landing.png'), fullPage: true, animations: 'disabled' });
});

test('small phone layout preserves readable controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'Entrar', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Conhecer os planos' }).click();
  for (const link of await page.locator('.lp-offer-cta').all()) {
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
});
