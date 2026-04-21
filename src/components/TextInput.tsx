import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
  top: string;
  bottom: string;
  onTopChange: (v: string) => void;
  onBottomChange: (v: string) => void;
}

const inputCls =
  'w-full px-3 py-2 pr-9 rounded-md border border-princess-200 bg-white dark:bg-princess-900 dark:border-princess-700 focus:outline-none focus:ring-2 focus:ring-princess-400';
const clearCls =
  'absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-princess-600 hover:bg-princess-100 dark:text-princess-200 dark:hover:bg-princess-800';
const headingCls = 'text-sm font-medium text-princess-700 dark:text-princess-300';

export default function TextInput({ top, bottom, onTopChange, onBottomChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className={headingCls}>Top text</span>
        <div className="relative">
          <input
            type="text"
            data-testid="top-input"
            value={top}
            placeholder="Top text (optional)"
            onChange={(e) => onTopChange(e.target.value)}
            className={inputCls}
          />
          {top ? (
            <button
              type="button"
              data-testid="top-clear"
              aria-label="Clear top text"
              onClick={() => onTopChange('')}
              className={clearCls}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          ) : null}
        </div>
      </label>
      <label className="flex flex-col gap-1">
        <span className={headingCls}>Bottom text</span>
        <div className="relative">
          <input
            type="text"
            data-testid="bottom-input"
            value={bottom}
            placeholder="Bottom text (optional)"
            onChange={(e) => onBottomChange(e.target.value)}
            className={inputCls}
          />
          {bottom ? (
            <button
              type="button"
              data-testid="bottom-clear"
              aria-label="Clear bottom text"
              onClick={() => onBottomChange('')}
              className={clearCls}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          ) : null}
        </div>
      </label>
    </div>
  );
}
