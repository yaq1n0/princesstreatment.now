import { test, expect } from '@playwright/test';
import { tid } from './helpers/testids';
import {
  AUDIO,
  GIPHY,
  IMAGE,
  IMGUR,
  TENOR,
  VIDEO,
  YT_AUDIO,
  YT_EMBED,
  YT_SHORTS,
  YT_VIDEO,
  YT_WATCH,
  currentTimeOf,
  expectOnlyAudio,
  expectOnlyVisual,
  gotoCreator,
  pollPaused,
  waitForMediaReady,
} from './helpers/media';

// ---------------------------------------------------------------------------
// Part 1 — Steady-state (visual × audio) matrix — 15 parameterized cells.
// Mirrors the "Supported media" combination table in README.md.
// ---------------------------------------------------------------------------

type VisualLabel = 'none' | 'image' | 'iframe' | 'video-direct' | 'video-youtube';
type AudioLabel = 'none' | 'direct' | 'youtube';

interface VisualCase {
  label: VisualLabel;
  src?: string;
  visualTid: string | null;
}
interface AudioCase {
  label: AudioLabel;
  audio?: string;
  audioTid: string | null;
}

const visualCases: VisualCase[] = [
  { label: 'none', visualTid: null },
  { label: 'image', src: IMAGE, visualTid: tid.previewImage },
  { label: 'iframe', src: TENOR, visualTid: tid.previewIframe },
  { label: 'video-direct', src: VIDEO, visualTid: tid.previewVideo },
  { label: 'video-youtube', src: YT_VIDEO, visualTid: tid.previewYoutube },
];

const audioCases: AudioCase[] = [
  { label: 'none', audioTid: null },
  { label: 'direct', audio: AUDIO, audioTid: tid.previewAudio },
  { label: 'youtube', audio: YT_AUDIO, audioTid: tid.previewAudioYoutube },
];

test.describe('Media matrix — steady state', () => {
  for (const v of visualCases) {
    for (const a of audioCases) {
      test(`visual=${v.label} audio=${a.label}`, async ({ page }) => {
        await gotoCreator(page, { src: v.src, audio: a.audio });

        // Visual contract.
        await expectOnlyVisual(page, v.visualTid);
        if (v.label === 'none') {
          await expect(page.getByTestId(tid.previewEmpty)).toBeVisible();
        }

        // Audio contract.
        await expectOnlyAudio(page, a.audioTid);

        // Mute contract.
        if (v.label === 'video-direct') {
          const video = page.getByTestId(tid.previewVideo);
          if (a.label === 'none') {
            await expect(video).not.toHaveAttribute('muted', /.*/);
            const muted = await video.evaluate((el) => (el as HTMLVideoElement).muted);
            expect(muted).toBe(false);
          } else {
            await expect(video).toHaveAttribute('muted', /.*/);
          }
        }
        if (v.label === 'video-youtube') {
          const iframeSrc = await page.getByTestId(tid.previewYoutube).getAttribute('src');
          expect(iframeSrc).toContain(a.label === 'none' ? 'mute=0' : 'mute=1');
        }
        if (a.label === 'youtube') {
          const audioSrc = await page.getByTestId(tid.previewAudioYoutube).getAttribute('src');
          expect(audioSrc).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
          expect(audioSrc).toContain('mute=0');
        }

        // Absorb old "hidden YT audio iframe is zero-size" test.
        if (v.label === 'image' && a.label === 'youtube') {
          const box = await page.getByTestId(tid.previewAudioYoutube).boundingBox();
          expect(box?.width ?? 0).toBe(0);
          expect(box?.height ?? 0).toBe(0);
        }
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Part 2 — Playback sync (direct media). Not parameterized.
// ---------------------------------------------------------------------------

test.describe('Playback sync — direct media', () => {
  test('image + direct audio: play starts audio, hides play button', async ({ page }) => {
    await gotoCreator(page, { src: IMAGE, audio: AUDIO });
    const audio = page.getByTestId(tid.previewAudio);
    const playBtn = page.getByTestId(tid.previewPlay);
    await expect(playBtn).toBeVisible();

    await waitForMediaReady(audio);
    await playBtn.click();

    await expect.poll(() => pollPaused(audio), { timeout: 3000 }).toBe(false);
    await expect(playBtn).toHaveCount(0);
  });

  test('video-direct + direct audio: play starts both', async ({ page }) => {
    await gotoCreator(page, { src: VIDEO, audio: AUDIO });
    const video = page.getByTestId(tid.previewVideo);
    const audio = page.getByTestId(tid.previewAudio);

    await waitForMediaReady(video);
    await waitForMediaReady(audio);
    await page.getByTestId(tid.previewPlay).click();

    await expect.poll(() => pollPaused(video), { timeout: 3000 }).toBe(false);
    await expect.poll(() => pollPaused(audio), { timeout: 3000 }).toBe(false);
  });

  test('video-direct + direct audio: pausing video pauses audio', async ({ page }) => {
    await gotoCreator(page, { src: VIDEO, audio: AUDIO });
    const video = page.getByTestId(tid.previewVideo);
    const audio = page.getByTestId(tid.previewAudio);

    await waitForMediaReady(video);
    await waitForMediaReady(audio);
    await page.getByTestId(tid.previewPlay).click();
    await expect.poll(() => pollPaused(video), { timeout: 3000 }).toBe(false);

    await video.evaluate((el) => (el as HTMLVideoElement).pause());
    await expect.poll(() => pollPaused(audio), { timeout: 3000 }).toBe(true);
  });

  test('video-direct + direct audio: seeking video resyncs audio currentTime', async ({ page }) => {
    await gotoCreator(page, { src: VIDEO, audio: AUDIO });
    const video = page.getByTestId(tid.previewVideo);
    const audio = page.getByTestId(tid.previewAudio);

    await waitForMediaReady(video);
    await waitForMediaReady(audio);

    await video.evaluate(
      (el) =>
        new Promise<void>((resolve) => {
          const v = el as HTMLVideoElement;
          v.addEventListener('seeked', () => resolve(), { once: true });
          v.currentTime = 0.5;
        })
    );

    const videoT = await currentTimeOf(video);
    const audioT = await currentTimeOf(audio);
    expect(Math.abs(videoT - audioT)).toBeLessThan(0.1);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — YouTube URL variant normalization (youtu.be covered in Part 1).
// ---------------------------------------------------------------------------

test.describe('YouTube URL variants normalize to nocookie embed', () => {
  for (const ytUrl of [YT_WATCH, YT_SHORTS, YT_EMBED]) {
    test(`variant: ${ytUrl}`, async ({ page }) => {
      await gotoCreator(page, { src: ytUrl });
      const src = await page.getByTestId(tid.previewYoutube).getAttribute('src');
      expect(src).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
      expect(src).toContain('enablejsapi=1');
      expect(src).toContain('rel=0');
      expect(src).toContain('playsinline=1');
    });
  }
});

// ---------------------------------------------------------------------------
// Part 4 — YouTube playback sync via postMessage.
// Deferred: tracked in tests/TODO.md. YT iframe autoplay in headless Chromium
// requires a user-gesture sequence we haven't nailed down; the Preview
// component also doesn't expose a DOM signal for YT playing state.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Part 5 — Reactive audio-kind transition.
// ---------------------------------------------------------------------------

test.describe('Audio kind reacts to input changes', () => {
  test('direct → youtube swaps the audio element', async ({ page }) => {
    await gotoCreator(page, { src: IMAGE, audio: AUDIO });
    await expectOnlyAudio(page, tid.previewAudio);

    await page.getByTestId(tid.audioInput).fill(YT_AUDIO);

    await expectOnlyAudio(page, tid.previewAudioYoutube);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Host resolution smoke (render wiring; parsing covered by hosts.spec).
// ---------------------------------------------------------------------------

test.describe('Host resolution — render smoke', () => {
  test('giphy URL renders as direct image', async ({ page }) => {
    await gotoCreator(page, { src: GIPHY });
    const img = page.getByTestId(tid.previewImage);
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toContain('media.giphy.com/');
    expect(src).toMatch(/\/giphy\.gif$/);
  });

  test('imgur URL renders as direct image', async ({ page }) => {
    await gotoCreator(page, { src: IMGUR });
    const img = page.getByTestId(tid.previewImage);
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toContain('i.imgur.com/');
    expect(src).toMatch(/\.gif$/);
  });
});
