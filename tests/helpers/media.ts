import { expect, type Locator, type Page } from '@playwright/test';
import { tid } from './testids';

// Local fixture URLs (served from public/test-fixtures/).
export const IMAGE = '/test-fixtures/image.png';
export const VIDEO = '/test-fixtures/video.mp4';
export const AUDIO = '/test-fixtures/audio.mp3';

// Live URLs — assumed stable; flakiness is acceptable per spec.
export const TENOR = 'https://tenor.com/view/sadhamstergirl-gif-42317179278283062';
export const GIPHY = 'https://giphy.com/gifs/sad-cat-xT9IgG50Fb7Mi0prBC';
export const IMGUR = 'https://imgur.com/gK5Lexn';
export const YT_VIDEO = 'https://youtu.be/jNQXAC9IVRw';
export const YT_AUDIO = 'https://youtu.be/dQw4w9WgXcQ';
export const YT_WATCH = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
export const YT_SHORTS = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
export const YT_EMBED = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
export const DEAD_URL = 'https://example.com/does-not-exist-404.png';

// Testids that identify a visual media element in the preview.
export const visualTestids = [
  tid.previewImage,
  tid.previewIframe,
  tid.previewVideo,
  tid.previewYoutube,
] as const;

// Testids that identify an audio source in the preview.
export const audioTestids = [tid.previewAudio, tid.previewAudioYoutube] as const;

type Params = { src?: string; audio?: string; top?: string; bottom?: string };

export async function gotoCreator(page: Page, params: Params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, v);
  }
  const q = qs.toString();
  await page.goto(q ? `/?${q}` : '/');
}

// Wait until a media element reaches HAVE_CURRENT_DATA (readyState >= 2).
export async function waitForMediaReady(locator: Locator) {
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
        setTimeout(done, 3000);
      })
  );
}

// Assert exactly one visual testid is present, all others absent.
// Pass null to assert all visual testids are absent.
export async function expectOnlyVisual(page: Page, visualTid: string | null) {
  for (const t of visualTestids) {
    const expected = t === visualTid ? 1 : 0;
    await expect(page.getByTestId(t), `visual testid ${t}`).toHaveCount(expected);
  }
}

// Assert exactly one audio testid is present, all others absent.
// Pass null to assert both audio testids are absent.
export async function expectOnlyAudio(page: Page, audioTid: string | null) {
  for (const t of audioTestids) {
    const expected = t === audioTid ? 1 : 0;
    await expect(page.getByTestId(t), `audio testid ${t}`).toHaveCount(expected);
  }
}

export async function pollPaused(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => (el as HTMLMediaElement).paused);
}

export async function currentTimeOf(locator: Locator): Promise<number> {
  return locator.evaluate((el) => (el as HTMLMediaElement).currentTime);
}
