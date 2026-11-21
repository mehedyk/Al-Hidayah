import { test, expect } from '@playwright/test';

test('scene themes switch from Settings, persist, and pair with light and dark', async ({ page }) => {
  await page.goto('/settings/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'emerald');
  await expect(page.locator('.scene-card')).toHaveCount(5);

  await page.locator('.scene-card', { hasText: 'Golden Dunes' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'sahara');
  const wall = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--wall-image'),
  );
  expect(wall).toContain('pexels-photo-28829635');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'sahara');
  await expect(page.locator('.scene-card.is-active')).toContainText('Golden Dunes');

  await page.getByRole('button', { name: /Use light theme/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'sahara');
});

test('header scene button cycles through every scene', async ({ page }) => {
  await page.goto('/about/');
  const seen = new Set<string | null>();
  for (let index = 0; index < 5; index += 1) {
    seen.add(await page.locator('html').getAttribute('data-scene'));
    await page.getByRole('button', { name: /^Scene:/ }).click();
  }
  expect(seen.size).toBe(5);
});

test('an unknown stored scene falls back safely', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('al-hidayah:settings:v1', JSON.stringify({ scene: 'nope', theme: 'x' })),
  );
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'emerald');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
