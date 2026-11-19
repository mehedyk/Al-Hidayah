import { test, expect } from '@playwright/test';

test('complete Quran reader opens deep links, searches all verses, and saves any ayah', async ({
  page,
}) => {
  await page.goto('/quran/?surah=94&ayah=6');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.getByLabel('Choose a surah')).toHaveValue('94');
  await expect(page.getByLabel('Choose a surah').locator('option')).toHaveCount(114);
  await expect(page.locator('.quran-ayah')).toHaveCount(8);

  const ayah = page.locator('#ayah-6');
  await expect(ayah).toBeVisible();
  await expect(ayah.locator('.quran-ayah__arabic')).toHaveAttribute('lang', 'ar');
  await expect(ayah.locator('.quran-ayah__bangla')).toHaveAttribute('lang', 'bn');
  await expect(ayah).toContainText('Qur’an, 94:6');

  await ayah.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(ayah.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await ayah.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.goto('/favorites/');
  await expect(page.locator('.favorite-card')).toHaveCount(1);
  await expect(page.locator('.favorite-card')).toContainText('Qur’an, 94:6');

  await page.goto('/quran/');
  await page.getByRole('searchbox').fill('2:255');
  const result = page.locator('.quran-search-result');
  await expect(result).toHaveCount(1);
  await expect(result).toContainText('Al-Baqara 2:255');
  await result.click();
  await expect(page.getByLabel('Choose a surah')).toHaveValue('2');
  await expect(page.locator('.quran-ayah')).toHaveCount(286);
  await expect(page.locator('#ayah-255')).toContainText('Qur’an, 2:255');
});

test('complete Quran reader has no horizontal overflow on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/quran/?surah=2&ayah=282');
  await expect(page.locator('#ayah-282')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    )
    .toBe(true);
});
