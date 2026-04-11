import { test, expect } from '@playwright/test';
import { tid } from './helpers/testids';

test.describe('Share', () => {
  test('share from /: copies view URL to clipboard and toasts', async ({ browser }) => {
    const context = await browser.newContext();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await context.addInitScript(() => {
      // @ts-expect-error override navigator.share
      navigator.share = undefined;
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.getByTestId(tid.srcInput).fill('/test-fixtures/image.png');
    await page.getByTestId(tid.topInput).fill('hello');
    await page.getByTestId(tid.shareButton).click();

    const origin = await page.evaluate(() => window.location.origin);
    const query = await page.evaluate(() => window.location.search);
    const expected = `${origin}/view${query}`;

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(expected);
    const toast = page.getByTestId(tid.toast);
    await expect(toast).toContainText('Link copied', { timeout: 3000 });
    await context.close();
  });

  test('share from /view: copies /view URL with same query', async ({ browser }) => {
    const context = await browser.newContext();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await context.addInitScript(() => {
      // @ts-expect-error override navigator.share
      navigator.share = undefined;
    });
    const page = await context.newPage();
    await page.goto('/view?src=%2Ftest-fixtures%2Fimage.png&top=hello');
    await page.getByTestId(tid.shareButton).click();

    const origin = await page.evaluate(() => window.location.origin);
    const expected = `${origin}/view?src=%2Ftest-fixtures%2Fimage.png&top=hello`;

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(expected);
    await expect(page.getByTestId(tid.toast)).toContainText('Link copied', { timeout: 3000 });
    await context.close();
  });
});
