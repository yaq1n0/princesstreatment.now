import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';

interface Props {
  onClick: () => void;
}

export default function ResetButton({ onClick }: Props) {
  return (
    <button
      type="button"
      data-testid="reset-button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-princess-100 text-princess-700 font-medium hover:bg-princess-200 dark:bg-princess-800 dark:text-princess-100 dark:hover:bg-princess-700 transition-colors"
    >
      <FontAwesomeIcon icon={faRotateLeft} />
      <span>Reset</span>
    </button>
  );
}
