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

Standard `URLSearchParams` encoding.

## Supported media

This is the source-of-truth audit of what `src` and `audio` accept and how each combination renders. The E2E matrix in [tests/media.matrix.spec.ts](tests/media.matrix.spec.ts) mirrors this table 1:1.

### Visual `src` kinds (`MediaKind`)

| Kind                     | Trigger                                                                          | Render                                                                         | Detected at                              |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| `image`                  | Fallback for any URL not matching below                                          | `<img>`                                                                        | [media.ts:19](src/utils/media.ts#L19)    |
| `iframe` (Tenor embed)   | `tenor.com/[locale/]view/…-gif-<id>`                                             | `<iframe src=tenor.com/embed/<id>>`                                            | [hosts.ts:8,22](src/utils/hosts.ts#L8)   |
| `image` (Giphy resolved) | `giphy.com/gifs/…-<id>` → `media.giphy.com/media/<id>/giphy.gif`                 | `<img>`                                                                        | [hosts.ts:9,27](src/utils/hosts.ts#L9)   |
| `image` (Imgur single)   | `imgur.com/<5–8 char id>` (album/gallery rejected)                               | `<img src=i.imgur.com/<id>.gif>`                                               | [hosts.ts:10,32](src/utils/hosts.ts#L10) |
| `video-direct`           | Extension `.mp4 .webm .mov .ogv .m4v`                                            | `<video>` (omits `muted` attr when no audio)                                   | [media.ts:6,18](src/utils/media.ts#L6)   |
| `video-youtube`          | `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/` | `youtube-nocookie.com` iframe, `enablejsapi=1&rel=0&playsinline=1&mute={0\|1}` | [youtube.ts:8](src/utils/youtube.ts#L8)  |

YouTube is always rendered via the privacy-friendly `youtube-nocookie.com` embed.

### Audio `audio` kinds (`AudioKind`)

| Kind      | Trigger                | Render                                                                                    |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `direct`  | Any non-YouTube URL    | `<audio>`                                                                                 |
| `youtube` | Matches `isYouTubeUrl` | Hidden `youtube-nocookie` iframe; when paired with `video-direct`, the `<video>` is muted |

### (visual × audio) combinations

Rows = visual `src`, columns = `audio`.

| visual \ audio | none                                        | direct audio URL                     | youtube audio                               |
| -------------- | ------------------------------------------- | ------------------------------------ | ------------------------------------------- |
| none           | blank creator (text-only artifact is valid) | audio-only playable                  | audio-only playable                         |
| image          | image shown                                 | image + audio controls               | image + hidden YT iframe                    |
| iframe (Tenor) | embed shown                                 | embed + audio controls               | embed + hidden YT iframe                    |
| video-direct   | native video w/ its own audio               | video muted + audio controls, synced | video muted + hidden YT iframe, synced      |
| video-youtube  | YT iframe unmuted                           | YT iframe muted + audio controls     | two YT iframes (video muted, audio unmuted) |

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

- [media.matrix.spec.ts](tests/media.matrix.spec.ts) — full (visual × audio) matrix; see "Supported media" above
- [creator.spec.ts](tests/creator.spec.ts) — composer URL state, mode toggle, reset, share-enable rules
- [hosts.spec.ts](tests/hosts.spec.ts) — unit tests for Tenor/Giphy/Imgur host detection and URL rewriting
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
