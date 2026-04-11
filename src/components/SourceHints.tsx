import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { linkInfo, linkSources, type LinkKind } from '../utils/links';

interface Props {
  kind: LinkKind;
}

/**
 * Info (i) button + recommended-source badges shown under a URL input.
 * Clicking the info button toggles a short blurb explaining what formats work.
 * Badges are always visible and open the source site in a new tab.
 */
export default function SourceHints({ kind }: Props) {
  const [open, setOpen] = useState(false);
  const sources = linkSources[kind];
  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          data-testid={`info-${kind}`}
          aria-label={`Info about ${kind} URLs`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-princess-600 hover:bg-princess-100 dark:text-princess-200 dark:hover:bg-princess-800 focus:outline-none focus:ring-2 focus:ring-princess-400"
        >
          <FontAwesomeIcon icon={faCircleInfo} />
        </button>
        {sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.note}
            data-testid={`source-${kind}-${slug(s.name)}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-princess-100 text-princess-700 hover:bg-princess-200 dark:bg-princess-800 dark:text-princess-100 dark:hover:bg-princess-700 transition-colors"
          >
            {s.name}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[0.65rem]" />
          </a>
        ))}
      </div>
      {open ? (
        <div
          data-testid={`info-panel-${kind}`}
          className="text-sm text-princess-700 dark:text-princess-200 rounded-md bg-princess-50 dark:bg-princess-900 border border-princess-200 dark:border-princess-800 px-3 py-2"
        >
          {linkInfo[kind]}
        </div>
      ) : null}
    </div>
  );
}
