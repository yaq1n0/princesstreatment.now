import { test, expect } from '@playwright/test';
import { tid } from './helpers/testids';

const YT_AUDIO = 'https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ';
const YT_VIDEO = 'https%3A%2F%2Fyoutu.be%2FjNQXAC9IVRw';

test.describe('YouTube as audio source', () => {
  test('image + YT audio: hidden YT iframe rendered, no <audio> element', async ({ page }) => {
    await page.goto(`/?src=%2Ftest-fixtures%2Fimage.png&audio=${YT_AUDIO}`);

    const audioIframe = page.getByTestId(tid.previewAudioYoutube);
    await expect(audioIframe).toHaveCount(1);
    await expect(page.getByTestId(tid.previewAudio)).toHaveCount(0);

    const src = await audioIframe.getAttribute('src');
    expect(src).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(src).toContain('enablejsapi=1');
    // Audio source is unmuted — that's the whole point.
    expect(src).toContain('mute=0');

    await expect(page.getByTestId(tid.previewPlay)).toBeVisible();
  });

  test('hidden YT audio iframe is zero-size and not interactive', async ({ page }) => {
    await page.goto(`/?src=%2Ftest-fixtures%2Fimage.png&audio=${YT_AUDIO}`);
    const box = await page.getByTestId(tid.previewAudioYoutube).boundingBox();
    expect(box?.width ?? 0).toBe(0);
    expect(box?.height ?? 0).toBe(0);
  });

  test('direct video + YT audio: video muted, hidden YT audio iframe present', async ({ page }) => {
    await page.goto(`/?src=%2Ftest-fixtures%2Fvideo.mp4&audio=${YT_AUDIO}`);
    const video = page.getByTestId(tid.previewVideo);
    await expect(video).toHaveAttribute('muted', /.*/);
    await expect(page.getByTestId(tid.previewAudioYoutube)).toHaveCount(1);
    await expect(page.getByTestId(tid.previewAudio)).toHaveCount(0);
  });

  test('YT video + YT audio: both iframes coexist, visible one is muted', async ({ page }) => {
    await page.goto(`/?src=${YT_VIDEO}&audio=${YT_AUDIO}`);
    const videoIframe = page.getByTestId(tid.previewYoutube);
    const audioIframe = page.getByTestId(tid.previewAudioYoutube);
    await expect(videoIframe).toBeVisible();
    await expect(audioIframe).toHaveCount(1);

    const videoSrc = await videoIframe.getAttribute('src');
    const audioSrc = await audioIframe.getAttribute('src');
    expect(videoSrc).toContain('mute=1');
    expect(audioSrc).toContain('mute=0');
    expect(videoSrc).toContain('jNQXAC9IVRw');
    expect(audioSrc).toContain('dQw4w9WgXcQ');
  });

  test('switching audio from direct to YT swaps the element', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fimage.png&audio=%2Ftest-fixtures%2Faudio.mp3');
    await expect(page.getByTestId(tid.previewAudio)).toHaveCount(1);
    await expect(page.getByTestId(tid.previewAudioYoutube)).toHaveCount(0);

    await page.getByTestId(tid.audioInput).fill('https://youtu.be/dQw4w9WgXcQ');

    await expect(page.getByTestId(tid.previewAudio)).toHaveCount(0);
    await expect(page.getByTestId(tid.previewAudioYoutube)).toHaveCount(1);
  });

  test('YT audio URL round-trips through /view', async ({ page }) => {
    await page.goto(`/?src=%2Ftest-fixtures%2Fimage.png&audio=${YT_AUDIO}`);
    await page.getByTestId(tid.maximize).click();
    await expect(page).toHaveURL(/\/view\?/);
    await expect(page.getByTestId(tid.previewAudioYoutube)).toHaveCount(1);
  });
});
