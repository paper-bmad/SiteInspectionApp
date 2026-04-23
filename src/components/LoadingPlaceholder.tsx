import { StyleSheet } from 'react-nativescript';

interface LoadingPlaceholderProps {
  count?: number;
}

export function LoadingPlaceholder({ count = 3 }: LoadingPlaceholderProps) {
  return (
    <stackLayout>
      {Array.from({ length: count }).map((_, index) => (
        <stackLayout key={index} className="card" opacity={0.6}>
          <stackLayout className="h-4 w-3/4 bg-gray-200 rounded" />
          <stackLayout className="mt-2">
            <stackLayout className="h-3 w-1/2 bg-gray-200 rounded" />
            <stackLayout className="h-3 w-2/3 bg-gray-200 rounded mt-1" />
          </stackLayout>
        </stackLayout>
      ))}
    </stackLayout>
  );
}