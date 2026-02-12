
type ErrorAlertProps = {
  message: string;
  onClose: () => void;
};

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="alert alert--error">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
      <button onClick={onClose} className="alert__close">
        ×
      </button>
    </div>
  );
}
