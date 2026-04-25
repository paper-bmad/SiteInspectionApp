import React, { useState } from 'react';
import type { Photo } from '../types/inspection';
import { BuildingCategorySelect } from './BuildingCategorySelect';
import { CameraPreview } from './CameraPreview';
import { NoteEditor } from './NoteEditor';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';

interface InspectionStepProps {
  stepNumber: number;
  photo: Photo | null;
  category: 'Defect' | 'Risk' | 'Overview';
  note: string;
  onCategoryChange: (category: 'Defect' | 'Risk' | 'Overview') => void;
  onNoteChange: (note: string) => void;
  onTakePhoto: (imageData: string, heading: { direction: string; degrees: number }) => void;
  onNext: () => void;
  onBack: () => void;
  onDiscard: () => void;
  isLoading: boolean;
  canGoBack: boolean;
}

export function InspectionStep({
  stepNumber,
  photo,
  category,
  note,
  onCategoryChange,
  onNoteChange,
  onTakePhoto,
  onNext,
  onBack,
  onDiscard,
  isLoading,
  canGoBack
}: InspectionStepProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [buildingCategory, setBuildingCategory] = React.useState({
    constructionType: '',
    stage: '',
    item: '',
    subitem: undefined as string | undefined
  });

  const handleCameraCapture = (imageData: string, heading: { direction: string; degrees: number }) => {
    setShowCamera(false);
    onTakePhoto(imageData, heading);
  };

  const getConstructionContext = () => {
    const parts = [];
    if (buildingCategory.constructionType) parts.push(buildingCategory.constructionType);
    if (buildingCategory.stage) parts.push(buildingCategory.stage);
    if (buildingCategory.item) parts.push(buildingCategory.item);
    if (buildingCategory.subitem) parts.push(buildingCategory.subitem);
    return parts.join(' - ');
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="max-w-xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {canGoBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                    aria-label="Go back"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                  </button>
                )}
                <h2 className="text-lg font-semibold">Step {stepNumber}</h2>
              </div>
              {photo && (
                <button
                  onClick={onDiscard}
                  className="text-error hover:text-error/80"
                >
                  Discard
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
            {photo ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] shadow-lg">
                <img
                  src={photo.uri}
                  alt="Current inspection"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">Take a photo to continue</p>
                <button
                  onClick={() => setShowCamera(true)}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Opening Camera...' : '📸 Take Photo'}
                </button>
              </div>
            )}

            {photo && (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Overview', 'Defect', 'Risk'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => onCategoryChange(cat)}
                          className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'} 
                                    py-2.5 text-sm`}
                        >
                          {cat === 'Risk' ? 'Risk Observation' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <BuildingCategorySelect
                    value={buildingCategory}
                    onChange={setBuildingCategory}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <NoteEditor
                      value={note}
                      onChange={onNoteChange}
                      onSave={onNext}
                      onCancel={onDiscard}
                      category={category}
                      constructionContext={getConstructionContext()}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  {canGoBack && (
                    <button
                      onClick={onBack}
                      className="btn btn-secondary flex-1"
                    >
                      ← Previous Step
                    </button>
                  )}
                  <button
                    onClick={onNext}
                    className="btn btn-primary flex-1"
                    disabled={isLoading}
                  >
                    Next Step →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraPreview
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}