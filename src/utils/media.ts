import { isYouTubeUrl } from './youtube';
import { resolveMediaUrl } from './hosts';

export type MediaKind = 'none' | 'image' | 'iframe' | 'video-direct' | 'video-youtube';

const VIDEO_EXT = /\.(mp4|webm|mov|ogv|m4v)(?:$|[?#])/i;

/**
 * Detect what kind of media a URL represents.
 * Host page URLs (Tenor / Giphy / Imgur) are resolved first; then YouTube; then
 * direct file extension; then image fallback.
 */
export function detectMediaKind(src: string): MediaKind {
  if (!src) return 'none';
  if (isYouTubeUrl(src)) return 'video-youtube';
  const resolved = resolveMediaUrl(src);
  if (resolved) return resolved.kind;
  if (VIDEO_EXT.test(src)) return 'video-direct';
  return 'image';
}

/**
 * Resolve a src to the actual URL to load, after host-URL resolution.
 * Returns the original src when no resolver matches.
 */
export function resolveMediaSrc(src: string): string {
  if (!src) return src;
  if (isYouTubeUrl(src)) return src;
  const resolved = resolveMediaUrl(src);
  return resolved ? resolved.src : src;
}

export type AudioKind = 'none' | 'direct' | 'youtube';

/**
 * Detect what kind of audio a URL represents:
 * - YouTube links → hidden iframe (audio track of the video)
 * - Anything else non-empty → direct <audio> element
 */
export function detectAudioKind(url: string): AudioKind {
  if (!url) return 'none';
  if (isYouTubeUrl(url)) return 'youtube';
  return 'direct';
}
