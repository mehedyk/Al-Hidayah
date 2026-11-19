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
