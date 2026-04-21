// Recommended sources + paste-format hints for each input kind.
// Edit the arrays below to add / remove / tweak the suggestions shown
// under the media and audio URL inputs on the CreatorPage.

export type LinkKind = 'media' | 'audio';

export interface LinkSource {
  /** Short label rendered on the badge. */
  name: string;
  /** Where the badge links to (opens in a new tab). */
  url: string;
  /** Tooltip shown on hover — brief note on how to get a usable URL from this site. */
  note: string;
}

/** Info blurb shown when the user clicks the (i) button next to an input. */
export const linkInfo: Record<LinkKind, string> = {
  media:
    'Paste a YouTube link, a Tenor / Giphy / Imgur page URL, or a direct image/video URL (.png, .jpg, .gif, .webp, .mp4, .webm). Most page URLs from these hosts will just work.',
  audio:
    "Paste any YouTube link (youtu.be, youtube.com/watch, /shorts) — we use the video's audio track via a hidden player.",
};

/** Recommended, hotlink-friendly sources per input kind. */
export const linkSources: Record<LinkKind, LinkSource[]> = {
  media: [
    {
      name: 'YouTube',
      url: 'https://youtube.com/',
      note: 'Any watch / shorts / youtu.be link — embedded automatically.',
    },
    {
      name: 'Imgur',
      url: 'https://imgur.com/',
      note: 'Paste the image page URL (imgur.com/<id>) — we resolve it automatically.',
    },
    {
      name: 'Tenor',
      url: 'https://tenor.com/',
      note: 'Paste any Tenor GIF page URL — embedded automatically.',
    },
    {
      name: 'Giphy',
      url: 'https://giphy.com/',
      note: 'Paste any Giphy GIF page URL — resolved automatically.',
    },
  ],
  audio: [
    {
      name: 'YouTube',
      url: 'https://youtube.com/',
      note: 'Any watch / shorts / youtu.be link — played via a hidden embed for its audio.',
    },
  ],
};
