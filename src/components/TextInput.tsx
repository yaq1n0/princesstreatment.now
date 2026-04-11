interface Props {
  top: string;
  bottom: string;
  onTopChange: (v: string) => void;
  onBottomChange: (v: string) => void;
}

export default function TextInput({ top, bottom, onTopChange, onBottomChange }: Props) {
  const cls =
    'w-full px-3 py-2 rounded-md border border-princess-200 bg-white dark:bg-princess-900 dark:border-princess-700 focus:outline-none focus:ring-2 focus:ring-princess-400';
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        data-testid="top-input"
        value={top}
        placeholder="Top text (optional)"
        onChange={(e) => onTopChange(e.target.value)}
        className={cls}
      />
      <input
        type="text"
        data-testid="bottom-input"
        value={bottom}
        placeholder="Bottom text (optional)"
        onChange={(e) => onBottomChange(e.target.value)}
        className={cls}
      />
    </div>
  );
}
