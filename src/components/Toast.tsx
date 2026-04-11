interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;
  return (
    <div
      data-testid="toast"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md bg-princess-600 text-white shadow-lg z-50"
    >
      {message}
    </div>
  );
}

export default Toast;
