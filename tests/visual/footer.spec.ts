import { test, expect } from '@playwright/test';

async function expectArtworkLoaded(page: import('@playwright/test').Page) {
  await expect
    .poll(() =>
      page
        .locator('.site-footer__media img')
        .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
}

test('desktop shared footer matches the approved local-art treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expectArtworkLoaded(page);
  await expect(page.locator('.site-footer')).toHaveScreenshot('desktop-footer.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});

test('mobile shared footer remains readable without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expectArtworkLoaded(page);
  await page.addStyleTag({ content: '.skip-link, .mobile-nav { display: none !important; }' });
  await expect(page.locator('.site-footer')).toHaveScreenshot('mobile-footer-isolated.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});

test('404 page includes the shared footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/this-page-does-not-exist');
  await expect(page.locator('.site-footer')).toBeVisible();
  await expectArtworkLoaded(page);
  await expect(page).toHaveScreenshot('404-page.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  });
});
