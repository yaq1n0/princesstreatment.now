import SourceHints from './SourceHints';
import ExampleCarousel from './ExampleCarousel';
import { audioExamples } from '../utils/examples';

interface Props {
  audio: string;
  hasVideo: boolean;
  onChange: (v: string) => void;
}

export default function AudioInput({ audio, hasVideo, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        data-testid="audio-input"
        value={audio}
        placeholder="Paste an audio URL (optional)"
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-princess-200 bg-white dark:bg-princess-900 dark:border-princess-700 focus:outline-none focus:ring-2 focus:ring-princess-400"
      />
      <SourceHints kind="audio" />
      <ExampleCarousel
        testIdPrefix="audio"
        items={audioExamples}
        selectedUrl={audio}
        onSelect={onChange}
      />
      {hasVideo && audio ? (
        <div data-testid="audio-note" className="text-sm text-princess-700 dark:text-princess-200">
          Selected audio will play over the video's audio. Remove the audio to use the video's own
          sound.
        </div>
      ) : null}
    </div>
  );
}
