import { test, expect } from '@playwright/test';
import { tid } from './helpers/testids';

test.describe('CreatorPage', () => {
  test('initial state: empty preview, share disabled, title and header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId(tid.previewEmpty)).toBeVisible();
    await expect(page.getByTestId(tid.shareButton)).toBeDisabled();
    await expect(page).toHaveTitle('Request Princess Treatment NOW');
    await expect(page.locator('header')).toContainText('Request Princess Treatment NOW');
  });

  test('no mode picker is rendered', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('mode-image')).toHaveCount(0);
    await expect(page.getByTestId('mode-video')).toHaveCount(0);
  });

  test('src input accepts a video URL without any mode toggle', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(tid.srcInput).fill('/test-fixtures/video.mp4');
    await expect(page.getByTestId(tid.previewVideo)).toBeVisible();
    await expect(page).toHaveURL(/src=%2Ftest-fixtures%2Fvideo\.mp4/);
    await expect(page).not.toHaveURL(/mode=/);
  });

  test('filling src renders image preview and encodes URL', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(tid.srcInput).fill('/test-fixtures/image.png');
    const img = page.getByTestId(tid.previewImage);
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', '/test-fixtures/image.png');
    await expect(page).toHaveURL(/src=%2Ftest-fixtures%2Fimage\.png/);
  });

  test('top and bottom text inputs render overlays and encode URL', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(tid.topInput).fill('hello');
    await page.getByTestId(tid.bottomInput).fill('world');
    await expect(page.getByTestId(tid.previewTop)).toContainText('hello');
    await expect(page.getByTestId(tid.previewBottom)).toContainText('world');
    await expect(page).toHaveURL(/top=hello/);
    await expect(page).toHaveURL(/bottom=world/);
  });

  test('audio note visibility rules', async ({ page }) => {
    await page.goto('/');
    // video src + audio → visible
    await page.getByTestId(tid.srcInput).fill('/test-fixtures/video.mp4');
    await page.getByTestId(tid.audioInput).fill('/test-fixtures/audio.mp3');
    await expect(page.getByTestId(tid.audioNote)).toBeVisible();
    // remove audio → hidden
    await page.getByTestId(tid.audioInput).fill('');
    await expect(page.getByTestId(tid.audioNote)).toHaveCount(0);
    // add audio back → visible again
    await page.getByTestId(tid.audioInput).fill('/test-fixtures/audio.mp3');
    await expect(page.getByTestId(tid.audioNote)).toBeVisible();
    // swap src to an image URL → hidden
    await page.getByTestId(tid.srcInput).fill('/test-fixtures/image.png');
    await expect(page.getByTestId(tid.audioNote)).toHaveCount(0);
  });

  test('reset clears in place and keeps pathname', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(tid.srcInput).fill('/test-fixtures/image.png');
    await page.getByTestId(tid.topInput).fill('hi');
    await page.getByTestId(tid.bottomInput).fill('there');
    await page.getByTestId(tid.audioInput).fill('/test-fixtures/audio.mp3');
    await page.getByTestId(tid.resetButton).click();
    const url = new URL(page.url());
    expect(url.pathname).toBe('/');
    expect(url.search).toBe('');
    await expect(page.getByTestId(tid.srcInput)).toHaveValue('');
    await expect(page.getByTestId(tid.topInput)).toHaveValue('');
    await expect(page.getByTestId(tid.bottomInput)).toHaveValue('');
    await expect(page.getByTestId(tid.audioInput)).toHaveValue('');
    await expect(page.getByTestId(tid.previewEmpty)).toBeVisible();
    await expect(page.getByTestId(tid.shareButton)).toBeDisabled();
  });

  test('share enabled when any single field is set', async ({ page }) => {
    const fields: Array<{ id: string; value: string }> = [
      { id: tid.srcInput, value: '/test-fixtures/image.png' },
      { id: tid.audioInput, value: '/test-fixtures/audio.mp3' },
      { id: tid.topInput, value: 'top' },
      { id: tid.bottomInput, value: 'bottom' },
    ];
    for (const field of fields) {
      await page.goto('/');
      await expect(page.getByTestId(tid.shareButton)).toBeDisabled();
      await page.getByTestId(field.id).fill(field.value);
      await expect(page.getByTestId(tid.shareButton)).toBeEnabled();
      await page.getByTestId(tid.resetButton).click();
      await expect(page.getByTestId(tid.shareButton)).toBeDisabled();
    }
  });
});
