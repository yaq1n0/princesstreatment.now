import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

interface Props {
  url: string;
  disabled?: boolean;
  onToast: (msg: string) => void;
  className?: string;
}

export default function ShareButton({ url, disabled, onToast, className }: Props) {
  const handleClick = async () => {
    if (disabled) return;
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; url?: string }) => Promise<void>;
    };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: 'Request Princess Treatment NOW', url });
      } catch (err) {
        // Plan: catch AbortError silently. Any other share failure is also
        // swallowed — the user still has the URL in the address bar.
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
