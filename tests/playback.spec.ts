import { test, expect, type Locator } from '@playwright/test';
import { tid } from './helpers/testids';

// Wait for a media element (video or audio) to reach at least HAVE_CURRENT_DATA.
async function waitForReady(locator: Locator) {
  await locator.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        const m = el as HTMLMediaElement;
        if (m.readyState >= 2) {
          resolve();
          return;
        }
        const done = () => resolve();
        m.addEventListener('loadeddata', done, { once: true });
        m.addEventListener('canplay', done, { once: true });
        // Safety net — tests shouldn't hang if the fixture never resolves.
        setTimeout(done, 3000);
      })
  );
}

test.describe('Playback sync', () => {
  test('image + audio: clicking play starts audio and hides play button', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fimage.png&audio=%2Ftest-fixtures%2Faudio.mp3');
    const audio = page.getByTestId(tid.previewAudio);
    const playBtn = page.getByTestId(tid.previewPlay);
    await expect(audio).toHaveCount(1);
    await expect(playBtn).toBeVisible();

    await waitForReady(audio);
    await playBtn.click();

    await expect
      .poll(() => audio.evaluate((el) => (el as HTMLAudioElement).paused), { timeout: 3000 })
      .toBe(false);
    await expect(playBtn).toHaveCount(0);
  });

  test('direct video + audio: clicking play starts both elements', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fvideo.mp4&audio=%2Ftest-fixtures%2Faudio.mp3');
    const video = page.getByTestId(tid.previewVideo);
    const audio = page.getByTestId(tid.previewAudio);
    const playBtn = page.getByTestId(tid.previewPlay);

    await expect(video).toBeVisible();
    await expect(audio).toHaveCount(1);
    await waitForReady(video);
    await waitForReady(audio);
    // Contract check: video element is muted (since we have a custom audio track).
    await expect(video).toHaveAttribute('muted', /.*/);

    await playBtn.click();

    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused), { timeout: 3000 })
      .toBe(false);
    await expect
      .poll(() => audio.evaluate((el) => (el as HTMLAudioElement).paused), { timeout: 3000 })
      .toBe(false);
  });

  test('direct video + audio: pausing video pauses audio', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fvideo.mp4&audio=%2Ftest-fixtures%2Faudio.mp3');
    const video = page.getByTestId(tid.previewVideo);
    const audio = page.getByTestId(tid.previewAudio);

    await waitForReady(video);
    await waitForReady(audio);
    await page.getByTestId(tid.previewPlay).click();

    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused), { timeout: 3000 })
      .toBe(false);

    // Pause the video imperatively; the component's 'pause' listener should mirror to audio.
    await video.evaluate((el) => (el as HTMLVideoElement).pause());

    await expect
      .poll(() => audio.evaluate((el) => (el as HTMLAudioElement).paused), { timeout: 3000 })
      .toBe(true);
  });

  test('direct video + audio: seeking video resyncs audio currentTime', async ({ page }) => {
    await page.goto('/?src=%2Ftest-fixtures%2Fvideo.mp4&audio=%2Ftest-fixtures%2Faudio.mp3');
    const video = page.getByTestId(tid.previewVideo);
    const audio = page.getByTestId(tid.previewAudio);

    await waitForReady(video);
    await waitForReady(audio);

    // Seek the video and wait for the 'seeked' event; the component mirrors currentTime to audio.
    await video.evaluate(
      (el) =>
        new Promise<void>((resolve) => {
          const v = el as HTMLVideoElement;
          v.addEventListener('seeked', () => resolve(), { once: true });
          v.currentTime = 0.5;
        })
    );

    const videoT = await video.evaluate((el) => (el as HTMLVideoElement).currentTime);
    const audioT = await audio.evaluate((el) => (el as HTMLAudioElement).currentTime);
    // Allow a small tolerance — mirroring happens inside a 'seeked' listener.
    expect(Math.abs(videoT - audioT)).toBeLessThan(0.1);
  });
});
