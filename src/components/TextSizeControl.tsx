import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

interface TextSizeControlProps {
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  onChange: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl') => void;
}

const TEXT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;

export function TextSizeControl({ size, onChange }: TextSizeControlProps) {
  const currentIndex = TEXT_SIZES.indexOf(size);

  const decreaseSize = () => {
    if (currentIndex > 0) {
      onChange(TEXT_SIZES[currentIndex - 1]);
    }
  };

  const increaseSize = () => {
    if (currentIndex < TEXT_SIZES.length - 1) {
      onChange(TEXT_SIZES[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2">
      <button
        onClick={decreaseSize}
        disabled={currentIndex === 0}
        className={`p-2 rounded-lg transition-colors ${
          currentIndex === 0 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        aria-label="Decrease text size"
      >
        <MinusIcon className="w-5 h-5" />
      </button>

      <div className="px-3 py-1 bg-gray-100 rounded-md min-w-[4rem] text-center">
        <span className="text-sm font-medium text-gray-700">
          {size === 'base' ? '100%' : `${(currentIndex + 1) * 25}%`}
        </span>
      </div>

      <button
        onClick={increaseSize}
        disabled={currentIndex === TEXT_SIZES.length - 1}
        className={`p-2 rounded-lg transition-colors ${
          currentIndex === TEXT_SIZES.length - 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        aria-label="Increase text size"
      >
        <PlusIcon className="w-5 h-5" />
      </button>
    </div>
  );
}