import { expect, test } from '@playwright/test';

test('トップ画面を表示できる', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Season Anime Picker');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Season Anime Picker' }),
  ).toBeVisible();
});
