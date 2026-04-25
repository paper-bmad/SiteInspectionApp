import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import type { Photo } from '../types/inspection';
import { PhotoAnnotationTool } from './PhotoAnnotationTool';
import { LoadingSpinner } from './LoadingSpinner';
import { storageService } from '../services/storage';

export function InspectionReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [annotatingPhoto, setAnnotatingPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (location.state?.photos) {
      setPhotos(location.state.photos);
      setIsLoading(false);
    } else {
      navigate('/projects');
    }
  }, [location.state, navigate]);

  const handleBack = () => {
    if (location.state?.projectId) {
      navigate(`/inspection/${location.state.projectId}`);
    } else {
      navigate('/projects');
    }
  };

  const PhotoItem = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const photo = photos[index];
    
    return (
      <div style={style}>
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden m-4">
          <div className="relative">
            <img
              src={photo.uri}
              alt={`Inspection photo ${index + 1}`}
              className="w-full aspect-video object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                photo.category === 'Defect' ? 'bg-red-100 text-red-700' :
                photo.category === 'Risk' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {photo.category}
                {photo.referenceId && ` - ${photo.referenceId}`}
              </span>
              {(photo.annotations?.length ?? 0) > 0 && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {photo.annotations!.length} annotations
                </span>
              )}
            </div>
            <button
              onClick={() => setAnnotatingPhoto(photo)}
              className="absolute bottom-4 right-4 btn btn-primary text-sm"
            >
              {photo.annotations?.length ? 'Edit Annotations' : 'Add Annotations'}
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Step {index + 1}</h2>
                <time className="text-sm text-gray-500" dateTime={photo.timestamp}>
                  {new Date(photo.timestamp).toLocaleString()}
                </time>
              </div>
              <button
                onClick={() => {
                  setEditingNoteId(photo.id);
                  setEditedNote(photo.notes || '');
                }}
                className="text-primary hover:text-primary-dark"
              >
                Edit Note
              </button>
            </div>

            {editingNoteId === photo.id ? (
              <div className="space-y-2">
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="input w-full h-32 resize-none"
                  placeholder="Add your notes here..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const updatedPhotos = photos.map(p =>
                        p.id === photo.id ? { ...p, notes: editedNote } : p
                      );
                      setPhotos(updatedPhotos);
                      setEditingNoteId(null);
                      if (location.state?.projectId) {
                        await storageService.savePhoto(
                          location.state.projectId,
                          { ...photo, notes: editedNote }
                        );
                      }
                    }}
                    className="btn btn-primary"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {photo.notes || 'No notes added'}
              </p>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Location Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-gray-600 inline">GPS: </dt>
                  <dd className="inline">
                    {photo.gpsLocation
                      ? `${photo.gpsLocation.latitude.toFixed(6)}, ${photo.gpsLocation.longitude.toFixed(6)}`
                      : 'Unavailable'}
                  </dd>
                </div>
                {photo.gpsLocation?.altitude != null && (
                  <div>
                    <dt className="text-gray-600 inline">Altitude: </dt>
                    <dd className="inline">{photo.gpsLocation.altitude.toFixed(2)}m</dd>
                  </div>
                )}
                {photo.compass && (
                  <div>
                    <dt className="text-gray-600 inline">Facing: </dt>
                    <dd className="inline">{photo.compass.direction} ({photo.compass.degrees}°)</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </article>
      </div>
    );
  });

  const handleSaveAnnotations = async (photo: Photo, annotations: Photo['annotations']) => {
    const updatedPhotos = photos.map(p =>
      p.id === photo.id ? { ...p, annotations } : p
    );
    setPhotos(updatedPhotos);
    setAnnotatingPhoto(null);

    if (location.state?.projectId) {
      await storageService.savePhoto(
        location.state.projectId,
        { ...photo, annotations }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold">Review Inspection</h1>
              <p className="text-sm text-gray-500">{photos.length} photos</p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (location.state?.projectId) {
                await Promise.all(
                  photos.map(photo => 
                    storageService.savePhoto(location.state.projectId, photo)
                  )
                );
              }
              navigate('/projects');
            }}
            className="btn btn-primary"
          >
            Submit Inspection
          </button>
        </div>
      </header>

      <main className="h-[calc(100vh-73px)]">
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={photos.length}
              itemSize={600}
            >
              {PhotoItem}
            </List>
          )}
        </AutoSizer>
      </main>

      {annotatingPhoto && (
        <PhotoAnnotationTool
          imageUrl={annotatingPhoto.uri}
          existingAnnotations={annotatingPhoto.annotations}
          onSave={(annotations) => { handleSaveAnnotations(annotatingPhoto, annotations); }}
          onClose={() => setAnnotatingPhoto(null)}
        />
      )}
    </div>
  );
}