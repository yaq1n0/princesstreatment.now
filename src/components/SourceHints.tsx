import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { linkInfo, linkSources, type LinkKind } from '../utils/links';

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

interface InfoButtonProps {
  kind: LinkKind;
  open: boolean;
  onToggle: () => void;
}

/** Round (i) button toggling the info panel. Panel is rendered by the parent via `InfoPanel`. */
export function InfoButton({ kind, open, onToggle }: InfoButtonProps) {
  return (
    <button
      type="button"
      data-testid={`info-${kind}`}
      aria-label={`Info about ${kind} URLs`}
      aria-expanded={open}
      onClick={onToggle}
      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-princess-600 hover:bg-princess-100 dark:text-princess-200 dark:hover:bg-princess-800 focus:outline-none focus:ring-2 focus:ring-princess-400"
    >
      <FontAwesomeIcon icon={faCircleInfo} />
    </button>
  );
}

interface InfoPanelProps {
  kind: LinkKind;
}

export function InfoPanel({ kind }: InfoPanelProps) {
  return (
    <div
      data-testid={`info-panel-${kind}`}
      className="text-sm text-princess-700 dark:text-princess-200 rounded-md bg-princess-50 dark:bg-princess-900 border border-princess-200 dark:border-princess-800 px-3 py-2"
    >
      {linkInfo[kind]}
    </div>
  );
}

interface SourceChipsProps {
  kind: LinkKind;
}

/** Recommended-source chip row. No info button. */
export function SourceChips({ kind }: SourceChipsProps) {
  const sources = linkSources[kind];
  return (
    <div className="flex items-center gap-2 flex-wrap">
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
  );
}
