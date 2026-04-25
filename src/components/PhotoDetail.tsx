import type { Photo } from '../types/inspection';

interface PhotoDetailProps {
  photo: Photo;
  onClose: () => void;
}

export function PhotoDetail({ photo, onClose }: PhotoDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        <div className="p-4 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            ✕
          </button>
        </div>
        <img
          src={photo.uri}
          alt={`Photo ${photo.id}`}
          className="w-full h-[300px] object-contain"
        />
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-bold">{photo.category}</h3>
          <p className="text-sm text-gray-500">
            {new Date(photo.timestamp).toLocaleString()}
          </p>
          {photo.notes && (
            <p className="text-gray-700">{photo.notes}</p>
          )}
          {photo.gpsLocation && (
            <p className="text-sm text-gray-500">
              📍 {photo.gpsLocation.latitude.toFixed(6)}, {photo.gpsLocation.longitude.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}