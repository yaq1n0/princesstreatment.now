import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { InfoButton, InfoPanel, SourceChips } from './SourceHints';
import ExampleCarousel from './ExampleCarousel';
import { mediaExamples } from '../utils/examples';

interface Props {
  src: string;
  onSrcChange: (v: string) => void;
}

export default function MediaInput({ src, onSrcChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-princess-700 dark:text-princess-300">
        Image / Video / GIF
      </h2>
      <label className="flex flex-col gap-1">
        <span className="sr-only">Media URL</span>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              data-testid="src-input"
              value={src}
              placeholder="Paste an image, video, or YouTube URL"
              onChange={(e) => onSrcChange(e.target.value)}
              className="w-full px-3 py-2 pr-9 rounded-md border border-princess-200 bg-white dark:bg-princess-900 dark:border-princess-700 focus:outline-none focus:ring-2 focus:ring-princess-400"
            />
            {src ? (
              <button
                type="button"
                data-testid="src-clear"
                aria-label="Clear media URL"
                onClick={() => onSrcChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-princess-600 hover:bg-princess-100 dark:text-princess-200 dark:hover:bg-princess-800"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            ) : null}
          </div>
          <InfoButton kind="media" open={open} onToggle={() => setOpen((v) => !v)} />
        </div>
      </label>
      <SourceChips kind="media" />
      {open ? <InfoPanel kind="media" /> : null}
      <ExampleCarousel
        testIdPrefix="media"
        items={mediaExamples}
        selectedUrl={src}
        onSelect={onSrcChange}
      />
    </div>
  );
}
