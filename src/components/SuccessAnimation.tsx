interface SuccessAnimationProps {
  message?: string;
  variant?: 'success' | 'warning';
}

export function SuccessAnimation({ message = 'Success!', variant = 'success' }: SuccessAnimationProps) {
  const isWarning = variant === 'warning';
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className={`${isWarning ? 'bg-amber-500/90' : 'bg-success/90'} text-white px-8 py-4 rounded-full
                    flex items-center space-x-2 animate-scale-in`}>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isWarning ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          )}
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}