# Deferred test work

Items kept out of the matrix intentionally, either because they're flaky,
expensive, or require infrastructure we don't have yet.

## YouTube playback sync (deferred from media.matrix.spec.ts Part 4)

- [ ] Assert that clicking play on `YT_VIDEO + direct audio` starts the
      direct `<audio>` element (observable via `audio.paused`).
      Blocker: YT iframe autoplay policy in headless Chromium may require
      a specific user-gesture sequence we haven't nailed down.
- [ ] Assert that `YT_VIDEO + YT_AUDIO` plays both iframes in sync.
      Blocker: no read-side hook exists to observe YT iframe playing state
      from Playwright — would need the Preview to expose a testable signal
      (e.g. a `data-playing` attribute toggled by the `infoDelivery` listener).

## Link health

- [ ] Optional: periodic CI job that HEAD-pings every URL in
      `examples.txt` and opens an issue when one 404s. Not worth running
      on every PR.
