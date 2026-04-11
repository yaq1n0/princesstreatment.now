import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-princess-100 text-princess-700 hover:bg-princess-200 dark:bg-princess-800 dark:text-princess-100 dark:hover:bg-princess-700 transition-colors"
    >
      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
    </button>
  );
}
