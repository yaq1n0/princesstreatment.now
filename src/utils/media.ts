import { isYouTubeUrl } from './youtube';

export type MediaKind = 'none' | 'image' | 'video-direct' | 'video-youtube';

const VIDEO_EXT = /\.(mp4|webm|mov|ogv|m4v)(?:$|[?#])/i;

/**
 * Detect what kind of media a URL represents, based on the URL itself:
 * - YouTube links → embedded iframe
 * - URLs ending in a known video extension → direct <video>
 * - Everything else (including unknown / no extension) → <img>
 *
 * The image fallback is intentional: it's the most common case, and an <img>
 * with a bad URL just shows nothing, which is a graceful failure mode.
 */
export function detectMediaKind(src: string): MediaKind {
  if (!src) return 'none';
  if (isYouTubeUrl(src)) return 'video-youtube';
  if (VIDEO_EXT.test(src)) return 'video-direct';
  return 'image';
}
