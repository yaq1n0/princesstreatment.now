// Curated example media shown in the carousels under the inputs on CreatorPage.
// Edit the arrays below to add / remove / re-order entries.

export type ExampleKind = 'image' | 'iframe' | 'video' | 'youtube' | 'audio';

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
 * Tenor page URLs — resolved to embed via src/utils/hosts.ts when rendered in Preview.
 */
export const mediaExamples: ExampleItem[] = [
  // Dogs
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/dog-scroll-crying-depression-doomscrolling-gif-4138822033792608878',
    label: 'Doomscrolling dog',
  },
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/doggy-cute-dog-adorable-good-boy-gif-2474655349647830482',
    label: 'Good boy',
  },
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/dog-shivering-gif-7386015284490272884',
    label: 'Shivering dog',
  },
  // Sad
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/sad-gif-1975526499861417359',
    label: 'Sad',
  },
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/%E7%9A%849-gif-12565004940729182637',
    label: 'Sad 9',
  },
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/sadhamstergirl-gif-4231717927828306245',
    label: 'Sad hamster girl',
  },
  // Cats
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/crying-cat-sad-kitty-sad-sad-cat-cat-tearing-up-meme-gif-18116533612288367470',
    label: 'Crying cat',
  },
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/cat-crying-cat-cat-meme-cat-crying-meme-crying-cat-meme-gif-1182720488497099882',
    label: 'Cat crying meme',
  },
  {
    kind: 'iframe',
    url: 'https://tenor.com/en-GB/view/bard1a-sad-cat-sad-dark-dark-side-gif-11200514925795091536',
    label: 'Sad dark cat',
  },
];

/**
 * Items shown in the audio carousel under the audio input.
 * YouTube links only — played via a hidden iframe in Preview.
 */
export const audioExamples: ExampleItem[] = [
  {
    kind: 'youtube',
    url: 'https://www.youtube.com/watch?v=XdofmoYcJNE',
    label: 'Sad violin (sting)',
  },
  {
    kind: 'youtube',
    url: 'https://www.youtube.com/watch?v=kjeg-ZZS__g',
    label: 'Classic sad violin',
  },
  {
    kind: 'youtube',
    url: 'https://www.youtube.com/watch?v=pBUs2R9JV5M',
    label: 'Banana cat crying',
  },
];
