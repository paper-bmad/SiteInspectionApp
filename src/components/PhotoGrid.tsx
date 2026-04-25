import type { Photo } from '../types/inspection';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoTap: (photo: Photo) => void;
  onPhotoRemove: (photoId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function PhotoGrid({ photos, onPhotoTap, onPhotoRemove, isLoading: _isLoading }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No photos yet</h2>
        <p className="text-gray-500 text-center">
          Take your first photo to begin this step
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative group bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02]"
        >
          <img
            src={photo.uri}
            alt={`Photo ${photo.id}`}
            className="w-full aspect-square object-cover"
            onClick={() => onPhotoTap(photo)}
            loading="lazy"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPhotoRemove(photo.id);
            }}
            className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full 
                     flex items-center justify-center opacity-0 group-hover:opacity-100 
                     transition-opacity"
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 p-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              photo.category === 'Defect' ? 'bg-red-100 text-red-700' :
              photo.category === 'Risk' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {photo.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}