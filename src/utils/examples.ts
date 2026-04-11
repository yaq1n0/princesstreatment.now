// Curated example media shown in the carousels under the inputs on CreatorPage.
// Edit the arrays below to add / remove / re-order entries.
//
// URLs MUST be hotlink-friendly direct file URLs (.png/.jpg/.gif/.webp/.mp4/.webm/.mp3/.ogg)
// or YouTube links (youtu.be/, youtube.com/watch, /shorts, /embed) — page links to galleries
// or streaming sites won't render. See `linkSources` in ./links.ts for recommended hosts.

export type ExampleKind = 'image' | 'video' | 'youtube' | 'audio';

export interface ExampleItem {
  /** What the item represents. Drives how it's rendered in the carousel. */
  kind: ExampleKind;
  /** The URL pasted into the input when the item is selected. */
  url: string;
  /** Short label shown in tooltip / audio row. */
  label: string;
  /** Optional poster image URL (used for direct video items if you want a custom thumbnail). */
  poster?: string;
}

/**
 * Items shown in the media (image / video / YouTube) carousel under the src input.
 * Mix freely — image, direct video, and youtube items all live in this single list.
 */
export const mediaExamples: ExampleItem[] = [
  // ── Wikimedia Commons images ──────────────────────────────────────────────
  // Public-domain royalty / princess imagery served from upload.wikimedia.org.
  {
    kind: 'image',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Empress_Josephine_Tiara_at_HMNS.jpg/250px-Empress_Josephine_Tiara_at_HMNS.jpg',
    label: 'Empress Joséphine tiara',
  },
  {
    kind: 'image',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/%22Diana%22_diadem_by_Henry_Wilson.jpg/120px-%22Diana%22_diadem_by_Henry_Wilson.jpg',
    label: 'Diana diadem',
  },
  {
    kind: 'image',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Chinese_kingfisher_tiara.jpg/120px-Chinese_kingfisher_tiara.jpg',
    label: 'Kingfisher tiara',
  },
  {
    kind: 'image',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Cinderella_by_Elena_Ringo.jpg/250px-Cinderella_by_Elena_Ringo.jpg',
    label: 'Cinderella',
  },
  {
    kind: 'image',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Pumpkin_carriage_by_SMART_DAYS%2C_INC.jpg/120px-Pumpkin_carriage_by_SMART_DAYS%2C_INC.jpg',
    label: 'Pumpkin carriage',
  },
  {
    kind: 'image',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Fragrant_Rose_with_a_Knot.jpg/120px-Fragrant_Rose_with_a_Knot.jpg',
    label: 'Pink rose',
  },
  {
    kind: 'image',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flamingo_Hotel_and_Casino_%2820480574938%29.jpg/120px-Flamingo_Hotel_and_Casino_%2820480574938%29.jpg',
    label: 'Flamingo (Vegas)',
  },

  // ── Direct video — Internet Archive ───────────────────────────────────────
  // The classic "sad violin → air horn" meme rendered as a single mp4 (~46MB H.264).
  {
    kind: 'video',
    url: 'https://archive.org/download/sad-violin-melody-air-horn-full/Sad%20Violin%20Melody%20-%20Air%20Horn%20FULL.ia.mp4',
    label: 'Sad violin → air horn',
  },

  // ── YouTube — sad hamster meme ────────────────────────────────────────────
  // The on-vibe canon: hamster with comically large eyes scored to a sad violin.
  {
    kind: 'youtube',
    url: 'https://www.youtube.com/shorts/jPFYtXTbCbg',
    label: 'Sad hamster (short)',
  },
  {
    kind: 'youtube',
    url: 'https://www.youtube.com/watch?v=RHuhsNtp9As',
    label: 'Original sad hamster violin',
  },
  {
    kind: 'youtube',
    url: 'https://www.youtube.com/watch?v=b3rNUhDqciM',
    label: 'Sad hamster violin (full)',
  },
  {
    kind: 'youtube',
    url: 'https://www.youtube.com/watch?v=3Ri_wUKuBHM',
    label: 'Sad hamster violin (extended)',
  },

  // Reference rickroll — handy fallback / sanity check that YouTube embedding works.
  { kind: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ', label: 'Never Gonna Give You Up' },
];

/**
 * Items shown in the audio carousel under the audio input.
 * Direct .mp3/.ogg/.wav only. SoundCloud / Spotify page links will not work.
 */
export const audioExamples: ExampleItem[] = [
  // The actual sad-violin meme sting (~75KB) — the one you hear under every TikTok.
  {
    kind: 'audio',
    url: 'https://archive.org/download/sad-violin-sound-effect/Sad%20Violin%20sound%20effect.mp3',
    label: 'Sad violin (sting)',
  },
  // Longer melancholy violin track (~8.5MB) for full-length dramatic moments.
  {
    kind: 'audio',
    url: 'https://archive.org/download/SadViolinPart1/SadViolin.mp3',
    label: 'Sad violin (full)',
  },
];
