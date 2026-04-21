import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

interface Props {
  url: string;
  disabled?: boolean;
  onToast: (msg: string) => void;
  className?: string;
  variant?: 'full' | 'icon';
}

export default function ShareButton({
  url,
  disabled,
  onToast,
  className,
  variant = 'full',
}: Props) {
  const handleClick = async () => {
    if (disabled) return;
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; url?: string }) => Promise<void>;
    };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: 'Request Princess Treatment NOW', url });
      } catch (err) {
        if ((err as DOMException)?.name !== 'AbortError') {
          // no-op
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      onToast('Link copied');
    } catch {
      // ignore
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        data-testid="share-button"
        disabled={disabled}
        onClick={handleClick}
        aria-label="Share"
        className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-princess-700 hover:bg-white shadow disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ''}`}
      >
        <FontAwesomeIcon icon={faShareNodes} />
      </button>
    );
  }

  return (
    <button
      type="button"
      data-testid="share-button"
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-princess-400 text-white font-medium hover:bg-princess-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className ?? ''}`}
    >
      <FontAwesomeIcon icon={faShareNodes} />
      <span>Share</span>
    </button>
  );
}
