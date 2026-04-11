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
    'Paste a direct image URL (.png, .jpg, .gif, .webp), a direct video URL (.mp4, .webm), or any YouTube link (youtu.be, youtube.com/watch, /shorts, /embed). Page links to image galleries or other video sites will not work — use the direct file URL.',
  audio:
    'Paste a direct audio file URL (.mp3 / .ogg / .wav). SoundCloud and Spotify page links will not work — use a direct file URL.',
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
      name: 'Catbox',
      url: 'https://catbox.moe/',
      note: 'Free anonymous file host for direct images and .mp4 files via files.catbox.moe.',
    },
    {
      name: 'Imgur',
      url: 'https://imgur.com/',
      note: 'Right-click an image → "Copy image address" to get an i.imgur.com URL.',
    },
    {
      name: 'Tenor',
      url: 'https://tenor.com/',
      note: 'Right-click a GIF → "Copy image address" to get a media.tenor.com URL.',
    },
    {
      name: 'Giphy',
      url: 'https://giphy.com/',
      note: 'Right-click a GIF → "Copy image address" to get a media.giphy.com URL.',
    },
    {
      name: 'Wikimedia',
      url: 'https://commons.wikimedia.org/',
      note: 'Public-domain media, served from upload.wikimedia.org.',
    },
    {
      name: 'Internet Archive',
      url: 'https://archive.org/details/movies',
      note: 'Public-domain clips. Use the direct .mp4 download URL.',
    },
  ],
  audio: [
    {
      name: 'Catbox',
      url: 'https://catbox.moe/',
      note: 'Free host for direct .mp3 files via files.catbox.moe.',
    },
    {
      name: 'Internet Archive',
      url: 'https://archive.org/details/audio',
      note: 'Huge free library. Use the direct .mp3 download URL.',
    },
    {
      name: 'Pixabay Music',
      url: 'https://pixabay.com/music/',
      note: 'Royalty-free music with downloadable MP3s you can self-host.',
    },
  ],
};
