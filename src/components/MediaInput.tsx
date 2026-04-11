import SourceHints from './SourceHints';
import ExampleCarousel from './ExampleCarousel';
import { mediaExamples } from '../utils/examples';

interface Props {
  src: string;
  onSrcChange: (v: string) => void;
}

export default function MediaInput({ src, onSrcChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        data-testid="src-input"
        value={src}
        placeholder="Paste an image, video, or YouTube URL"
        onChange={(e) => onSrcChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-princess-200 bg-white dark:bg-princess-900 dark:border-princess-700 focus:outline-none focus:ring-2 focus:ring-princess-400"
      />
      <SourceHints kind="media" />
      <ExampleCarousel
        testIdPrefix="media"
        items={mediaExamples}
        selectedUrl={src}
        onSelect={onSrcChange}
      />
    </div>
  );
}
