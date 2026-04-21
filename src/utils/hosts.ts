export type ResolvedMediaKind = 'image' | 'iframe' | 'video-direct';

export interface ResolvedMedia {
  kind: ResolvedMediaKind;
  src: string;
}

const TENOR_VIEW = /tenor\.com\/(?:[a-z-]+\/)?view\/[^/?#]*-gif-(\d+)/i;
const GIPHY_GIF = /giphy\.com\/gifs\/[^/?#]*-([a-zA-Z0-9]+)(?:[/?#]|$)/i;
const IMGUR_SINGLE = /^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]{5,8})(?:[/?#.]|$)/i;
const IMGUR_ALBUM = /imgur\.com\/(?:a|gallery)\//i;

/**
 * Resolve a user-pasted host page URL (Tenor / Giphy / Imgur) into an embeddable src.
 * Returns null when the URL doesn't match a supported pattern, letting upstream fall
 * back to direct-file heuristics.
 */
export function resolveMediaUrl(url: string): ResolvedMedia | null {
  if (!url) return null;

  const tenor = url.match(TENOR_VIEW);
  if (tenor) {
    return { kind: 'iframe', src: `https://tenor.com/embed/${tenor[1]}` };
  }

  const giphy = url.match(GIPHY_GIF);
  if (giphy) {
    return { kind: 'image', src: `https://media.giphy.com/media/${giphy[1]}/giphy.gif` };
  }

  if (IMGUR_ALBUM.test(url)) return null;
  const imgur = url.match(IMGUR_SINGLE);
  if (imgur) {
    return { kind: 'image', src: `https://i.imgur.com/${imgur[1]}.gif` };
  }

  return null;
}
