# princesstreatment.now

Static SPA. Compose an image XOR video + optional audio + optional top/bottom overlay text; share a link to a fullscreen view. All state in URL query params. No backend. Cloudflare Pages.

Title (in header + `<title>`): `Request Princess Treatment ` + `<span className="text-princess-500">NOW</span>`. Playfair Display serif, pastel pink.

**Stack:** React 19 + TS + Vite 7 + Tailwind v4 + react-router-dom v7 (`createBrowserRouter`) + FontAwesome (`@fortawesome/react-fontawesome` + free-solid-svg-icons) + Playwright (chromium). No other libs.

## Routes

- `/` = `CreatorPage` (composer + live preview)
- `/view` = `ViewPage` (fullscreen artifact)

Navigation between them preserves the full query string verbatim. Only the explicit Reset button clears state, and it clears **in place** (pathname unchanged).

## URL params

`mode` = `"image" | "video"` (missing → `"image"`), `src`, `audio`, `top`, `bottom`. Standard `URLSearchParams` encoding.

## File tree

```
├── index.html
├── vite.config.ts
├── playwright.config.ts
├── public/_redirects
├── public/test-fixtures/{image.png,video.mp4,audio.mp3}
├── src/
│   ├── main.tsx  App.tsx  index.css
│   ├── pages/{CreatorPage,ViewPage}.tsx
│   ├── components/{Preview,ResizablePreview,MediaInput,AudioInput,TextInput,ShareButton,ResetButton,ThemeToggle,Toast,SourceHints,ExampleCarousel}.tsx
│   ├── hooks/{useRequestState,useTheme}.ts
│   └── utils/{youtube,media,links,examples}.ts
└── tests/helpers/testids.ts
└── tests/{creator,preview,view,theme,share}.spec.ts
```

## Setup (exact)

Repo already contains `PLAN.md`, `.git/`, `.DS_Store` — preserve. `ffmpeg` available.

```bash
yes | npm create vite@latest . -- --template react-ts
rm -f src/App.css src/assets/react.svg public/vite.svg
npm install react-router-dom @fortawesome/react-fontawesome @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons tailwindcss @tailwindcss/vite
npm install -D @playwright/test
npx playwright install chromium --with-deps
mkdir -p public/test-fixtures
ffmpeg -y -f lavfi -i color=c=pink:s=64x64:d=1 -frames:v 1 public/test-fixtures/image.png
ffmpeg -y -f lavfi -i color=c=pink:s=64x64:d=1 -c:v libx264 -t 1 -pix_fmt yuv420p public/test-fixtures/video.mp4
ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 public/test-fixtures/audio.mp3
```

## Exact configs

**`vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()] });
```

**`src/index.css`** (entire file)

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-princess: 'Playfair Display', Georgia, serif;
  --color-princess-50: #fff5f8;
  --color-princess-100: #ffe4ec;
  --color-princess-200: #ffc9da;
  --color-princess-300: #ffa3c0;
  --color-princess-400: #ff7aa7;
  --color-princess-500: #ff4d8f;
  --color-princess-600: #e03773;
  --color-princess-700: #b52659;
  --color-princess-800: #7a1a3b;
  --color-princess-900: #3d0d1d;
  --color-princess-950: #1a0610;
}

html,
body,
#root {
  height: 100%;
}
body {
  font-family: var(--font-sans);
  background: var(--color-princess-50);
  color: var(--color-princess-900);
}
.dark body {
  background: var(--color-princess-950);
  color: var(--color-princess-100);
}
.font-princess {
  font-family: var(--font-princess);
}
.overlay-text {
  font-family: var(--font-princess);
  color: var(--color-princess-100);
  text-shadow:
    0 0 2px #fff,
    0 0 6px var(--color-princess-300),
    0 2px 8px rgba(0, 0, 0, 0.35);
  letter-spacing: 0.01em;
}
```

**`index.html`** `<head>` (FOUC script must run before any stylesheet link):

```html
<title>Request Princess Treatment NOW</title>
<script>
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored ? stored === 'dark' : prefersDark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,700;1,500&display=swap"
  rel="stylesheet"
/>
```

**`public/_redirects`**: `/*  /index.html  200`

**`package.json`** scripts: `"dev": "vite"`, `"dev:e2e": "vite --port 5273 --strictPort"`, `"build": "tsc -b && vite build"`, `"preview": "vite preview"`, `"test": "playwright test"`, `"test:ui": "playwright test --ui"`

## Hooks

**`useRequestState`** wraps `useSearchParams`. Returns `{ state, setField, setMode, reset, buildViewUrl, buildCreateUrl, queryString }`.

- `state: { mode, src, audio, top, bottom }`; missing `mode` → `'image'`.
- `setMode(m)` also clears `src` in the same update.
- `reset()` = `setSearchParams({})`. **Must not navigate** — pathname stays `/` or `/view`.
- `buildViewUrl()` = `${window.location.origin}/view${queryString}` (read origin at runtime).
- `buildCreateUrl()` = `/${queryString}`.

**`useTheme`** returns `{ theme: 'light'|'dark', toggle }`. Mount reads `localStorage.theme` else `matchMedia('(prefers-color-scheme: dark)')`. Toggle writes localStorage + flips `documentElement.classList` dark.

## `utils/youtube.ts`

`isYouTubeUrl`, `getYouTubeId` must match `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`.
`buildYouTubeEmbedUrl(id, { mute })` = `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&playsinline=1&mute=${mute?1:0}`.
`postYouTubeCommand(iframe, cmd)` = `iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*')`.
**Do NOT load `https://www.youtube.com/iframe_api`. No `window.YT`, no `onYouTubeIframeAPIReady`.**

## Components

Every listed `data-testid` must render exactly as named.

**`Preview`** — props: `{ mode, src, audio, top, bottom, fullscreen? }`.

- Root `<div data-testid="preview">`, `position: relative`, pink placeholder bg.
- Empty (`!src && !top && !bottom`): `<div data-testid="preview-empty" className="font-princess text-princess-300">♡</div>` centered.
- Image mode: `<img data-testid="preview-image" src={src}>` object-contain.
- Direct video: `<video data-testid="preview-video" src={src} playsInline>`. **`muted` attribute is set only when `audio` is non-empty; otherwise the attribute is omitted entirely — never `muted={false}`.** Native controls shown iff no audio; hidden when audio present.
- YouTube: `<iframe data-testid="preview-youtube" src={buildYouTubeEmbedUrl(id, { mute: !!audio })}>`.
- Audio (when `audio` set): hidden `<audio data-testid="preview-audio" src={audio} preload="auto">`.
- Top/bottom text (when non-empty): `<div data-testid="preview-top|preview-bottom" className="overlay-text">`, absolute top / bottom.
- Center play button: `<button data-testid="preview-play">` with FA `faPlay`, shown when there is playable media and nothing is playing, hidden while playing. Above media via z-index + `pointer-events: auto`.

Playback sync:

- Direct video + audio: `play`/`pause`/`seeked` listeners on `<video>` mirror to `<audio>`; audio `currentTime` resets to video's on `seeked`.
- Image + audio: play button toggles `<audio>` directly.
- YouTube + audio: play button calls `postYouTubeCommand(iframe, 'playVideo')` and plays `<audio>`; pause mirrored. Listen on `window` `message` for JSON with `event === 'infoDelivery'` and `info.playerState` to mirror remote pause/end back to audio.
- Media without audio: play button passes through to native.

**`ResizablePreview`** — wraps `<Preview/>`.

- `matchMedia('(min-width: 768px)')`: wide → width resize, narrow → height resize.
- Handle `<div data-testid="resize-handle">`, cursor `col-resize` / `row-resize`.
- `onPointerDown` → `setPointerCapture`, track `pointermove`, clamp width `[280px, 70vw]`, height `[200px, 70vh]`.
- Persist `{ w?, h? }` in `localStorage.previewSize`. On `matchMedia` `change`, reset the inactive-axis value in state + localStorage.
- **Top-left** `<button data-testid="maximize">` with FA `faExpand` → `navigate('/view' + queryString)`.

**`MediaInput`** — `<input data-testid="src-input" placeholder="Paste an image, video, or YouTube URL">` followed by `<SourceHints kind="media" />` and `<ExampleCarousel testIdPrefix="media" items={mediaExamples} />`. Mode is auto-detected from the pasted URL via `detectMediaKind` (no segmented mode buttons).

**`AudioInput`** — `<input data-testid="audio-input" placeholder="Paste an audio URL (optional)">` followed by `<SourceHints kind="audio" />` and `<ExampleCarousel testIdPrefix="audio" items={audioExamples} />`. When `hasVideo && audio`, render `<div data-testid="audio-note">Selected audio will play over the video's audio. Remove the audio to use the video's own sound.</div>`.

**`ExampleCarousel`** — horizontally scrollable strip of curated example media (curated in `src/utils/examples.ts`). Props: `{ testIdPrefix, items, selectedUrl, onSelect }`.

- Root `<div data-testid="${prefix}-carousel">` (flex row, `overflow-x-auto`, `snap-x`).
- Each item gets `data-testid="${prefix}-example-${i}"` and `data-kind` of `image | video | youtube | audio`. Currently selected item (matching `selectedUrl`) shows a check badge and a princess-500 border.
- **Image** items: 80×80 thumbnail `<button>`. Click → `onSelect(url)`.
- **YouTube** items: 128×80 button showing `https://i.ytimg.com/vi/${id}/mqdefault.jpg` poster + play overlay icon. Click → `onSelect(url)`. Not played inline.
- **Video** items: 128×80 box containing a `<video preload="metadata">` and a small `<button data-testid="...-play">` (FA `faPlay` / `faPause`) in the bottom-right corner. The play button calls `el.play()` / `el.pause()` and stops propagation; clicking anywhere else on the box calls `onSelect`.
- **Audio** items: 176×48 row with `faMusic` icon, label, and a small `<button data-testid="...-play">` on the right that toggles a hidden `<audio preload="none">`. Box body click → `onSelect`. Play button click stops propagation.
- Items with no curated entries → component renders nothing (returns `null`).

**`utils/examples.ts`** — exports `ExampleItem` type and `mediaExamples` / `audioExamples` arrays. Editing these arrays is the only way to add/remove curated examples; no other code should hard-code URLs.

**`TextInput`** — two inputs `data-testid="top-input"` / `data-testid="bottom-input"`.

**`ShareButton`** — `<button data-testid="share-button">` princess-400 CTA, FA `faShareNodes`, label `"Share"`. On click: `if (navigator.share)` → `navigator.share({ title: 'Request Princess Treatment NOW', url })` (catch `AbortError` silently); else `navigator.clipboard.writeText(url)` + `onToast('Link copied')`. Same component on both pages.

**`ResetButton`** — `<button data-testid="reset-button">` secondary, FA `faRotateLeft`, label `"Reset"`. **Only on CreatorPage.**

**`ThemeToggle`** — `<button data-testid="theme-toggle">` with FA `faSun`/`faMoon`. Uses `useTheme()`. Header-right on CreatorPage only.

**`Toast`** — exports `Toast` + `useToast` hook returning `{ message, show }`. When visible: `<div data-testid="toast">` bottom-center, auto-dismiss after **3000ms**.

## Pages

**`CreatorPage`**

- Header full width: title (`Request Princess Treatment ` + `<span className="text-princess-500">NOW</span>`, `.font-princess`) + right-aligned `<ThemeToggle/>`.
- Main wide (`md:`) = `flex-row`: left `<ResizablePreview><Preview/></ResizablePreview>`, right = stacked `<MediaInput/>` / `<AudioInput/>` / `<TextInput/>` + CTA row.
- Main narrow = `flex-col-reverse`: inputs on top, preview below (still wrapped in `<ResizablePreview/>`).
- CTA row: `<ShareButton/>` + `<ResetButton/>`.
- Share `disabled = !src && !audio && !top && !bottom`.

**`ViewPage`**

- Fullscreen `bg-princess-950` container. Renders `<Preview fullscreen />` directly (no `ResizablePreview`).
- **Top-left** `<button data-testid="minimize">` with FA `faCompress` → `navigate('/' + queryString)`.
- **Bottom-right** floating `<ShareButton/>`, same disabled rule.
- No inputs, no ResetButton, no ThemeToggle. Play button comes from `Preview`.

**`App.tsx`**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreatorPage from './pages/CreatorPage';
import ViewPage from './pages/ViewPage';
const router = createBrowserRouter([
  { path: '/', element: <CreatorPage /> },
  { path: '/view', element: <ViewPage /> },
]);
export default function App() {
  return <RouterProvider router={router} />;
}
```

**`main.tsx`** standard Vite entry that imports `./index.css`. Theme class already set by inline script in `index.html` — don't duplicate.

## Playwright

**`playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5273', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:5273',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
```

**`tests/helpers/testids.ts`**

```ts
export const tid = {
  preview: 'preview',
  previewEmpty: 'preview-empty',
  previewImage: 'preview-image',
  previewVideo: 'preview-video',
  previewYoutube: 'preview-youtube',
  previewAudio: 'preview-audio',
  previewTop: 'preview-top',
  previewBottom: 'preview-bottom',
  previewPlay: 'preview-play',
  resizeHandle: 'resize-handle',
  maximize: 'maximize',
  minimize: 'minimize',
  modeImage: 'mode-image',
  modeVideo: 'mode-video',
  srcInput: 'src-input',
  audioInput: 'audio-input',
  audioNote: 'audio-note',
  topInput: 'top-input',
  bottomInput: 'bottom-input',
  shareButton: 'share-button',
  resetButton: 'reset-button',
  themeToggle: 'theme-toggle',
  toast: 'toast',
} as const;
```

Every spec imports `tid` and uses `page.getByTestId(tid.xxx)`. Fixtures: `/test-fixtures/{image.png,video.mp4,audio.mp3}`.

### `creator.spec.ts`

1. Goto `/` → `previewEmpty` visible; `shareButton` disabled; `<title>` = `Request Princess Treatment NOW`; header text contains `Request Princess Treatment NOW`.
2. Click `modeVideo` → URL has `mode=video`. Click `modeImage` → URL has `mode=image` or no mode.
3. Fill `srcInput`, click `modeVideo` → `srcInput` empty, URL has no `src`.
4. Fill `srcInput` `/test-fixtures/image.png` → `previewImage` has that src, URL has encoded src.
5. Fill `topInput`/`bottomInput` → `previewTop`/`previewBottom` contain text; URL has `top=` / `bottom=`.
6. `audioNote` visible only when video mode + video src + audio set. Removing audio or switching to image hides it.
7. Fill fields → click `resetButton` → pathname **stays `/`**, no query, inputs empty, `previewEmpty` visible, share disabled.
8. Share enable rule: empty → disabled; any single one of `src`/`audio`/`top`/`bottom` → enabled; reset → disabled (test all four).

### `preview.spec.ts`

1. Goto `/?mode=image&src=%2Ftest-fixtures%2Fimage.png` → `previewImage` present, no video/youtube.
2. Goto `/?mode=video&src=%2Ftest-fixtures%2Fvideo.mp4` → `previewVideo` with src. Assert `await expect(video).not.toHaveAttribute('muted', /.*/)` **and** `await video.evaluate(el => (el as HTMLVideoElement).muted)` returns `false`.
3. Goto with video + audio → `await expect(video).toHaveAttribute('muted', /.*/)`, `previewAudio` present.
4. Goto `/?mode=video&src=https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ` → `previewYoutube` src contains `youtube-nocookie.com/embed/dQw4w9WgXcQ` and `enablejsapi=1`.
5. YouTube + audio → iframe src contains `mute=1`.
6. Image + top + bottom → both overlay elements visible with text.
7. Image + audio → `previewPlay` visible; remove audio → `previewPlay` not rendered.
8. Populated `/` → click `maximize` → URL is `/view?<same query>`.

### `view.spec.ts`

1. Goto `/view?mode=image&src=...` → `preview` visible; `srcInput`/`resetButton`/`themeToggle` **not** in DOM.
2. Click `minimize` → pathname `/`, query preserved, `srcInput` value equals src.
3. Goto `/view` empty → `previewEmpty` visible, `minimize` clickable.
4. `/view` with content → `shareButton` visible and enabled.
5. `/view` empty → `shareButton` visible but disabled.
6. Round trip: `/?top=hello&bottom=world&src=...` → click `maximize` → click `minimize` → all three input values preserved.

### `theme.spec.ts`

1. New context `colorScheme: 'dark'`; goto `/` → `<html>` has class `dark`.
2. Click `themeToggle` → class toggled; reload → class persists.

### `share.spec.ts`

1. `context.grantPermissions(['clipboard-read','clipboard-write'])`; `addInitScript` to set `navigator.share = undefined`; fill state on `/`; click `shareButton`; `navigator.clipboard.readText()` equals `${origin}/view${querystring}` (read origin via `page.evaluate(() => window.location.origin)`, do not hardcode); `toast` contains `Link copied`. Assert within 3000ms.
2. Same from `/view?...`; copied URL targets `/view?...` with same query.

## Execution

1. Scaffold + write exact configs + fixtures. Verify `npm run dev` boots cleanly.
2. Implement `src/` and `tests/` per spec. Optionally parallelize via two general-purpose subagents (one for `src/`, one for `tests/`) — if so, inline this full plan into each prompt.
3. `npm run build` must exit 0 with zero TS errors.
4. Kill stale `:5273`: `lsof -ti:5273 | xargs kill -9` if needed. `npx playwright test`. Fix failures (usually in `src/`) and loop until green.
5. `npm run build && npm run preview`; curl `/`, `/view`, `/assets/...` return 200.
6. Do **not** commit, push, or deploy.

## Critical gotchas (don't regress)

- `<video>` `muted` attribute is **omitted entirely** when there's no custom audio (not `muted={false}`). Test #2 in `preview.spec.ts` enforces this via `not.toHaveAttribute('muted', /.*/)`.
- YouTube integration is **postMessage only** — no `iframe_api` script load, no `window.YT`.
- `reset()` must not navigate; pathname must stay `/`.
- FOUC script must be inline in `<head>` before any stylesheet link.
- Navigation between `/` and `/view` preserves the full query string verbatim — only Reset clears it.
- Playwright spawns its own `:5273` server via `dev:e2e` — never reuses `:5173`.
