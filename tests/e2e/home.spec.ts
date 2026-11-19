import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('reads, changes, saves, and shares a reminder', async ({ page }) => {
  await page.goto('/?item=q:94:6');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('.arabic')).toHaveText('إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا');
  await expect(page.locator('.reference').first()).toContainText('94:6');
  await page.getByRole('button', { name: 'Get New Reminder' }).click();
  await expect(page.locator('.reference').first()).toContainText('13:28');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.share-reference')).toContainText('13:28');
  await page.getByRole('button', { name: 'Copy text' }).click();
  await expect
    .poll(() =>
      page
        .locator('.share-frame')
        .evaluate(
          (frame) =>
            frame.scrollHeight <= frame.clientHeight + 2 &&
            frame.scrollWidth <= frame.clientWidth + 2,
        ),
    )
    .toBe(true);
  await page.locator('.share-preview').screenshot({ path: 'test-results/share-preview.png' });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download image' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^al-hidayah-q-13-28-(post|story)\.png$/);
  await download.saveAs('test-results/share-q-13-28.png');
  expect(await download.failure()).toBeNull();
  await page.getByRole('button', { name: 'Close Share Studio' }).click();
  await page.goto('/favorites/');
  await expect(page.locator('.favorite-card')).toHaveCount(1);
});

test('settings persist and mobile navigation remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/settings/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await page.getByRole('combobox').first().selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByLabel('Text size').selectOption('large');
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('al-hidayah:settings:v1') ?? '{}').theme),
    )
    .toBe('light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large');
  await expect(page.locator('.mobile-nav')).toBeVisible();
});

test('has no critical accessibility violations on the home page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?item=q:94:6');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
});
