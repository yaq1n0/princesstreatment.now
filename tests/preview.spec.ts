import { test, expect } from '@playwright/test';
import { tid } from './helpers/testids';

test.describe('Preview', () => {
  test('image URL renders image only', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fimage.png');
    await expect(page.getByTestId(tid.previewImage)).toBeVisible();
    await expect(page.getByTestId(tid.previewVideo)).toHaveCount(0);
    await expect(page.getByTestId(tid.previewYoutube)).toHaveCount(0);
  });

  test('direct video without audio: no muted attribute, muted property false', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fvideo.mp4');
    const video = page.getByTestId(tid.previewVideo);
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('src', '/test-fixtures/video.mp4');
    await expect(video).not.toHaveAttribute('muted', /.*/);
    const mutedProp = await video.evaluate((el) => (el as HTMLVideoElement).muted);
    expect(mutedProp).toBe(false);
  });

  test('direct video with audio: muted attribute set, audio element present', async ({ page }) => {
    await page.goto(
      '/?src=%2Ftest-fixtures%2Fvideo.mp4&audio=%2Ftest-fixtures%2Faudio.mp3'
    );
    const video = page.getByTestId(tid.previewVideo);
    await expect(video).toHaveAttribute('muted', /.*/);
    await expect(page.getByTestId(tid.previewAudio)).toHaveCount(1);
  });

  test('YouTube URL renders iframe with nocookie and enablejsapi', async ({ page }) => {
    await page.goto('/?src=https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ');
    const iframe = page.getByTestId(tid.previewYoutube);
    await expect(iframe).toBeVisible();
    const src = await iframe.getAttribute('src');
    expect(src).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(src).toContain('enablejsapi=1');
  });

  test('YouTube + audio sets mute=1', async ({ page }) => {
    await page.goto(
      '/?src=https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ&audio=%2Ftest-fixtures%2Faudio.mp3'
    );
    const iframe = page.getByTestId(tid.previewYoutube);
    const src = await iframe.getAttribute('src');
    expect(src).toContain('mute=1');
  });

  test('image with top and bottom text shows overlays', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fimage.png&top=hello&bottom=world');
    await expect(page.getByTestId(tid.previewTop)).toContainText('hello');
    await expect(page.getByTestId(tid.previewBottom)).toContainText('world');
  });

  test('image + audio shows play button; removing audio hides it', async ({ page }) => {
    await page.goto(
      '/?src=%2Ftest-fixtures%2Fimage.png&audio=%2Ftest-fixtures%2Faudio.mp3'
    );
    await expect(page.getByTestId(tid.previewPlay)).toBeVisible();
    await page.getByTestId(tid.audioInput).fill('');
    await expect(page.getByTestId(tid.previewPlay)).toHaveCount(0);
  });

  test('maximize navigates to /view with same query', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fimage.png&top=hi');
    await page.getByTestId(tid.maximize).click();
    await expect(page).toHaveURL(/\/view\?/);
    const url = new URL(page.url());
    expect(url.pathname).toBe('/view');
    expect(url.searchParams.get('src')).toBe('/test-fixtures/image.png');
    expect(url.searchParams.get('top')).toBe('hi');
  });
});
