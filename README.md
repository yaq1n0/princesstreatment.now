# princesstreatment.now

Static SPA for composing a shareable artifact: an image **or** video, optional audio overlay, optional top/bottom text. All state lives in the URL — no backend, no database, no accounts. Paste a link, get a fullscreen view.

Deployed as a single static bundle on Cloudflare Pages.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (CSS-first config via `@theme` in [src/index.css](src/index.css))
- **react-router-dom v7** (`createBrowserRouter`)
- **FontAwesome** (free-solid-svg-icons)
- **Playwright** (chromium) for E2E tests
- **ESLint 9** + **Prettier 3**

## Routes

| Path    | Page          | Purpose                                         |
| ------- | ------------- | ----------------------------------------------- |
| `/`     | `CreatorPage` | Composer with live preview and inputs           |
| `/view` | `ViewPage`    | Fullscreen artifact view (no inputs, no chrome) |

Navigation between the two preserves the full query string verbatim. The Reset button on `/` clears state **in place** — pathname stays `/`.

## URL params

| Param    | Values | Notes                                      |
| -------- | ------ | ------------------------------------------ |
| `src`    | URL    | Image, direct video, or YouTube URL        |
| `audio`  | URL    | Optional audio track played over the media |
| `top`    | string | Optional overlay text, top-aligned         |
| `bottom` | string | Optional overlay text, bottom-aligned      |

Standard `URLSearchParams` encoding. YouTube URLs (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`) are detected and rendered via the privacy-friendly `youtube-nocookie.com` embed.

### Example links

```
/?src=https%3A%2F%2Fexample.com%2Fpic.png&top=hello&bottom=world
/?&src=https%3A%2F%2Fyoutu.be%2FdQw4w9WgXcQ&audio=https%3A%2F%2Fexample.com%2Ftrack.mp3
/view&src=https%3A%2F%2Fexample.com%2Fpic.png
```

## Development

```bash
npm install
npm run dev          # Vite dev server on :5173
```

### Scripts

| Command               | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Dev server on the default Vite port        |
| `npm run dev:e2e`     | Dev server on `:5273` (used by Playwright) |
| `npm run build`       | Typecheck + production build to `dist/`    |
| `npm run preview`     | Serve the built bundle locally             |
| `npm run typecheck`   | `tsc -b` only, no emit                     |
| `npm run lint`        | ESLint over `src/` and `tests/`            |
| `npm run lint:fix`    | ESLint with `--fix`                        |
| `npm run fmt`         | Prettier check (used in CI)                |
| `npm run fmt:fix`     | Prettier write across the repo             |
| `npm run e2e`         | Run Playwright E2E tests                   |
| `npm run e2e:ui`      | Playwright UI mode                         |
| `npm run e2e:install` | Install dependencies for UI tests          |

### VSCode

Workspace settings in [.vscode/settings.json](.vscode/settings.json) enable format-on-save with Prettier and `eslint --fix` on save. Recommended extensions are pinned in [.vscode/extensions.json](.vscode/extensions.json).

## Testing

Playwright tests live in [tests/](tests/) and use shared testids from [tests/helpers/testids.ts](tests/helpers/testids.ts). The Playwright config spawns its own dev server on `:5273` (`dev:e2e`) so it never collides with a running `npm run dev` on `:5173`.

Test fixtures (1-frame pink image, 1-second silent video, 1-second silent audio) live in [public/test-fixtures/](public/test-fixtures/) and are generated with `ffmpeg`. They are committed so tests run deterministically.

```bash
npm run e2e                   # all specs, headless
npm run e2e:ui                # interactive UI
```

Playwright spec coverage:

- [creator.spec.ts](tests/creator.spec.ts) — composer URL state, mode toggle, reset, share-enable rules
- [preview.spec.ts](tests/preview.spec.ts) — image / direct video / YouTube rendering, the `muted` attribute gotcha, overlays, maximize
- [playback.spec.ts](tests/playback.spec.ts) — image+audio and video+audio playback sync
- [view.spec.ts](tests/view.spec.ts) — fullscreen view, minimize, round-trip
- [theme.spec.ts](tests/theme.spec.ts) — system preference + toggle persistence
- [share.spec.ts](tests/share.spec.ts) — clipboard fallback when `navigator.share` is unavailable

## Build & deploy

```bash
npm run build
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck, lint-check, format-check, build, and Playwright tests on every push and PR to `main`.

## Architecture notes

- **All state is in the URL.** [useRequestState](src/hooks/useRequestState.ts) wraps `useSearchParams` and is the single source of truth — no React state shadows the URL.
- **YouTube integration is `postMessage`-only.** The app does not load `https://www.youtube.com/iframe_api` or touch `window.YT`. See [src/utils/youtube.ts](src/utils/youtube.ts) and the `infoDelivery` listener in [src/components/Preview.tsx](src/components/Preview.tsx).
- **Theme FOUC is prevented** by an inline script in [index.html](index.html) that sets `class="dark"` on `<html>` before any stylesheet loads.
- **The `<video>` element omits the `muted` attribute entirely** when there's no custom audio track (rather than `muted={false}`). Browsers treat `muted` as a boolean attribute whose mere presence mutes the element regardless of value, so `muted={false}` would mute and prevent native audio playback. This is enforced by [tests/preview.spec.ts](tests/preview.spec.ts).
