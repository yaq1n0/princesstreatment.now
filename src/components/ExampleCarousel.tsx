import { useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faMusic, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getYouTubeId } from '../utils/youtube';
import type { ExampleItem } from '../utils/examples';

interface Props {
  /** Used as the prefix for `data-testid` on every rendered element. */
  testIdPrefix: string;
  items: ExampleItem[];
  /** Currently selected URL — items matching this get a highlighted border + check badge. */
  selectedUrl: string;
  /** Called with the item URL when the user clicks an item to use it. */
  onSelect: (url: string) => void;
}

/**
 * Horizontally scrollable strip of curated example media.
 * Click anywhere on an item to fill the parent input with that URL.
 * Video and audio items have a small inline play/pause button so users can preview
 * without committing to the selection — clicking the play button does NOT select.
 */
export default function ExampleCarousel({ testIdPrefix, items, selectedUrl, onSelect }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs text-princess-700 dark:text-princess-300">Examples</div>
      <div
        data-testid={`${testIdPrefix}-carousel`}
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x"
      >
        {items.map((item, i) => (
          <ExampleCarouselItem
            key={`${item.url}-${i}`}
            testId={`${testIdPrefix}-example-${i}`}
            item={item}
            selected={item.url === selectedUrl}
            onSelect={() => onSelect(item.url)}
          />
        ))}
      </div>
    </div>
  );
}

interface ItemProps {
  testId: string;
  item: ExampleItem;
  selected: boolean;
  onSelect: () => void;
}

function ExampleCarouselItem({ testId, item, selected, onSelect }: ItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: MouseEvent) => {
    e.stopPropagation();
    const el = item.kind === 'video' ? videoRef.current : audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  const borderClass = selected
    ? 'border-princess-500'
    : 'border-princess-200 dark:border-princess-700 hover:border-princess-400';
  const baseClass = `relative flex-shrink-0 snap-start rounded-md overflow-hidden border-2 transition-colors ${borderClass}`;

  if (item.kind === 'image') {
    return (
      <button
        type="button"
        data-testid={testId}
        data-kind="image"
        onClick={onSelect}
        title={item.label}
        aria-label={`Use example: ${item.label}`}
        className={`${baseClass} w-20 h-20 bg-princess-100 dark:bg-princess-900`}
      >
        <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
        {selected ? <SelectedBadge /> : null}
      </button>
    );
  }

  if (item.kind === 'youtube') {
    const id = getYouTubeId(item.url);
    const poster = item.poster ?? (id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : undefined);
    return (
      <button
        type="button"
        data-testid={testId}
        data-kind="youtube"
        onClick={onSelect}
        title={item.label}
        aria-label={`Use example: ${item.label}`}
        className={`${baseClass} w-32 h-20 bg-princess-100 dark:bg-princess-900`}
      >
        {poster ? (
          <img src={poster} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <FontAwesomeIcon icon={faPlay} className="text-white drop-shadow" />
        </span>
        {selected ? <SelectedBadge /> : null}
      </button>
    );
  }

  if (item.kind === 'video') {
    return (
      <div
        data-testid={testId}
        data-kind="video"
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        title={item.label}
        aria-label={`Use example: ${item.label}`}
        className={`${baseClass} w-32 h-20 bg-princess-100 dark:bg-princess-900 cursor-pointer`}
      >
        <video
          ref={videoRef}
          src={item.url}
          poster={item.poster}
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <button
          type="button"
          data-testid={`${testId}-play`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 text-princess-600 text-[0.65rem] shadow"
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        {selected ? <SelectedBadge /> : null}
      </div>
    );
  }

  // audio
  return (
    <div
      data-testid={testId}
      data-kind="audio"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      title={item.label}
      aria-label={`Use example: ${item.label}`}
      className={`${baseClass} w-44 h-12 px-2 flex items-center gap-2 bg-princess-100 dark:bg-princess-900 cursor-pointer`}
    >
      <FontAwesomeIcon icon={faMusic} className="text-princess-500 flex-shrink-0" />
      <span className="flex-1 truncate text-xs text-princess-800 dark:text-princess-100 text-left">
        {item.label}
      </span>
      <button
        type="button"
        data-testid={`${testId}-play`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-princess-500 text-white text-[0.65rem] flex-shrink-0"
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>
      <audio
        ref={audioRef}
        src={item.url}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      {selected ? <SelectedBadge /> : null}
    </div>
  );
}

function SelectedBadge() {
  return (
    <span className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full bg-princess-500 text-white text-[0.6rem] shadow">
      <FontAwesomeIcon icon={faCheck} />
    </span>
  );
}
