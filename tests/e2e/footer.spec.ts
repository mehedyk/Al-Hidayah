import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('shared footer uses real application links on internal pages and the 404 page', async ({
  page,
}) => {
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toBeVisible();
  await expect(footer.getByRole('link', { name: 'From the Qur’an' })).toHaveAttribute(
    'href',
    '/quran/',
  );
  await expect(footer.getByRole('link', { name: 'Prayer Times' })).toHaveAttribute(
    'href',
    '/prayer/',
  );
  await expect(footer.getByRole('link', { name: 'Report a content error' })).toHaveAttribute(
    'href',
    /template=content-error\.yml$/,
  );

  await page.goto('/this-page-does-not-exist');
  await expect(page.getByRole('heading', { name: 'This page doesn’t exist.' })).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'Favorites' }),
  ).toHaveAttribute('href', '/favorites/');
});

test('footer does not introduce horizontal overflow from 320px to desktop', async ({ page }) => {
  for (const width of [320, 390, 768, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/about/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        ),
      )
      .toBe(true);
  }
});

test('404 page and footer have no critical accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/this-page-does-not-exist');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
});

test('footer plays the supplied muted ink-landscape video, and the 404 page uses it too', async ({
  page,
}) => {
  const videoUrl =
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260901_122529_931c22c8-8d2d-47c0-ad51-b97f56a91e42.mp4';
  const posterUrl =
    'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4f690bd1-881a-4192-82f2-d714d34c8fb9.png';

  for (const path of ['/about/', '/this-page-does-not-exist']) {
    await page.goto(path);
    const video = page.locator('video.footer-bg');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('poster', posterUrl);
    await expect(video.locator('source')).toHaveAttribute('src', videoUrl);
    for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline']) {
      await expect(video).toHaveAttribute(attribute, /.*/);
    }
    // The clip is decorative and silent: hidden from assistive technology.
    await expect(page.locator('.footer-media')).toHaveAttribute('aria-hidden', 'true');
  }
});

test('reduced motion swaps the film for the still poster', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  await expect(page.locator('video.footer-bg')).toBeHidden();
  const image = await page.locator('footer.site-footer').evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(image).toContain('4f690bd1-881a-4192-82f2-d714d34c8fb9.png');
});
