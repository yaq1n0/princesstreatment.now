import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { InfoButton, InfoPanel, SourceChips } from './SourceHints';
import ExampleCarousel from './ExampleCarousel';
import { audioExamples } from '../utils/examples';

interface Props {
  audio: string;
  hasVideo: boolean;
  onChange: (v: string) => void;
}

export default function AudioInput({ audio, hasVideo, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-princess-700 dark:text-princess-300">Audio</h2>
      <label className="flex flex-col gap-1">
        <span className="sr-only">Audio URL</span>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              data-testid="audio-input"
              value={audio}
              placeholder="Paste an audio URL or YouTube link (optional)"
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 pr-9 rounded-md border border-princess-200 bg-white dark:bg-princess-900 dark:border-princess-700 focus:outline-none focus:ring-2 focus:ring-princess-400"
            />
            {audio ? (
              <button
                type="button"
                data-testid="audio-clear"
                aria-label="Clear audio URL"
                onClick={() => onChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-princess-600 hover:bg-princess-100 dark:text-princess-200 dark:hover:bg-princess-800"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            ) : null}
          </div>
          <InfoButton kind="audio" open={open} onToggle={() => setOpen((v) => !v)} />
        </div>
      </label>
      <SourceChips kind="audio" />
      {open ? <InfoPanel kind="audio" /> : null}
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
