import { test, expect } from '@playwright/test';
import { tid } from './helpers/testids';

test.describe('ViewPage', () => {
  test('renders preview; creator-only controls absent', async ({ page }) => {
    await page.goto('/view?src=%2Ftest-fixtures%2Fimage.png');
    await expect(page.getByTestId(tid.preview)).toBeVisible();
    await expect(page.getByTestId(tid.srcInput)).toHaveCount(0);
    await expect(page.getByTestId(tid.resetButton)).toHaveCount(0);
    await expect(page.getByTestId(tid.themeToggle)).toHaveCount(0);
  });

  test('minimize navigates back to / with query preserved', async ({ page }) => {
    await page.goto('/view?src=%2Ftest-fixtures%2Fimage.png');
    await page.getByTestId(tid.minimize).click();
    const url = new URL(page.url());
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('src')).toBe('/test-fixtures/image.png');
    await expect(page.getByTestId(tid.srcInput)).toHaveValue('/test-fixtures/image.png');
  });

  test('empty /view: empty preview visible, minimize clickable', async ({ page }) => {
    await page.goto('/view');
    await expect(page.getByTestId(tid.previewEmpty)).toBeVisible();
    await page.getByTestId(tid.minimize).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('/view with content: share button visible and enabled', async ({ page }) => {
    await page.goto('/view?src=%2Ftest-fixtures%2Fimage.png');
    const share = page.getByTestId(tid.shareButton);
    await expect(share).toBeVisible();
    await expect(share).toBeEnabled();
  });

  test('/view empty: share button visible but disabled', async ({ page }) => {
    await page.goto('/view');
    const share = page.getByTestId(tid.shareButton);
    await expect(share).toBeVisible();
    await expect(share).toBeDisabled();
  });

  test('round trip: values preserved through maximize/minimize', async ({ page }) => {
    await page.goto('/?top=hello&bottom=world&src=%2Ftest-fixtures%2Fimage.png');
    await page.getByTestId(tid.maximize).click();
    await expect(page).toHaveURL(/\/view/);
    await page.getByTestId(tid.minimize).click();
    await expect(page).toHaveURL(/^[^?]*\/\?/);
    await expect(page.getByTestId(tid.topInput)).toHaveValue('hello');
    await expect(page.getByTestId(tid.bottomInput)).toHaveValue('world');
    await expect(page.getByTestId(tid.srcInput)).toHaveValue('/test-fixtures/image.png');
  });
});
