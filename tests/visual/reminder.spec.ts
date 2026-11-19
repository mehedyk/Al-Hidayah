import { test, expect } from '@playwright/test';

test('desktop reminder hero matches the golden image', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?item=q:94:6');
  await expect(page.locator('.arabic')).toBeVisible();
  await expect(page).toHaveScreenshot('desktop-home.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});

test('mobile reminder hero matches the golden image', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?item=q:13:28');
  await expect(page.locator('.reference').first()).toContainText('13:28');
  await expect(page.locator('.arabic')).toBeVisible();
  await expect(page).toHaveScreenshot('mobile-home.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});

test('light theme fits the longer reminder without clipping', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/settings/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await page.getByRole('combobox').first().selectOption('light');
  await page.goto('/?item=q:13:28');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect
    .poll(() =>
      page
        .locator('.reminder-card')
        .evaluate(
          (card) =>
            card.scrollHeight <= card.clientHeight + 2 && card.scrollWidth <= card.clientWidth + 2,
        ),
    )
    .toBe(true);
  await expect(page).toHaveScreenshot('light-long-reminder.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});
