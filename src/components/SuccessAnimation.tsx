
interface SuccessAnimationProps {
  message?: string;
}

export function SuccessAnimation({ message = 'Success!' }: SuccessAnimationProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="bg-success/90 text-white px-8 py-4 rounded-full
                    flex items-center space-x-2 animate-scale-in">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}