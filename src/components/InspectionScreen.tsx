import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Photo } from '../types/inspection';
import { InspectionStep } from './InspectionStep';
import { SuccessAnimation } from './SuccessAnimation';
import { cameraService } from '../services/camera';
import { storageService } from '../services/storage';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function InspectionScreen() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  void location.state?.project; // consumed via router state; keep for future use
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [currentCategory, setCurrentCategory] = useState<'Defect' | 'Risk' | 'Overview'>('Overview');
  const [currentNote, setCurrentNote] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date>(new Date());

  // Load saved photos on mount
  useEffect(() => {
    if (!projectId) return;

    const loadSavedData = async () => {
      try {
        const savedPhotos = await storageService.getPhotos(projectId);
        setPhotos(savedPhotos);

        const saved = await storageService.getAutoSave();
        if (saved && saved.projectId === projectId) {
          setCurrentStep(saved.currentStep || 1);
          setCurrentCategory(saved.currentCategory || 'Overview');
          setCurrentNote(saved.currentNote || '');
          if (saved.currentPhoto) {
            setCurrentPhoto(saved.currentPhoto);
          }
        }
      } catch (err) {
        console.error('Error loading saved data:', err);
        setError('Failed to load saved data. Please try again.');
      }
    };

    loadSavedData();
  }, [projectId]);

  // Auto-save periodically
  useEffect(() => {
    if (!projectId) return;

    const autoSave = async () => {
      const now = new Date();
      if (now.getTime() - lastAutoSave.getTime() >= AUTO_SAVE_INTERVAL) {
        await storageService.saveAutoSave({
          projectId,
          photos,
          currentStep,
          currentCategory,
          currentNote,
          currentPhoto,
          updatedAt: now.toISOString()
        });
        setLastAutoSave(now);
      }
    };

    const interval = setInterval(autoSave, 5000);
    return () => clearInterval(interval);
  }, [projectId, photos, currentStep, currentCategory, currentNote, currentPhoto, lastAutoSave]);

  // Save before unload
  useEffect(() => {
    if (!projectId) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';

      await storageService.saveAutoSave({
        projectId,
        photos,
        currentStep,
        currentCategory,
        currentNote,
        currentPhoto,
        updatedAt: new Date().toISOString()
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId, photos, currentStep, currentCategory, currentNote, currentPhoto]);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const takePhoto = async (imageData: string, heading: { direction: string; degrees: number }) => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setError(null);

      const location = await cameraService.getLocation();

      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: imageData,
        category: currentCategory,
        notes: currentNote,
        gpsLocation: location,
        compass: {
          direction: heading.direction as 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW',
          degrees: heading.degrees
        },
        timestamp: new Date().toISOString()
      };

      // Save photo immediately
      await storageService.savePhoto(projectId, newPhoto);
      
      setCurrentPhoto(newPhoto);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!projectId || !currentPhoto) return;

    const updatedPhotos = [...photos, currentPhoto];
    setPhotos(updatedPhotos);
    setCurrentPhoto(null);
    setCurrentNote('');
    setCurrentCategory('Overview');
    setCurrentStep(prev => prev + 1);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);

    await storageService.saveAutoSave({
      projectId,
      photos: updatedPhotos,
      currentStep: currentStep + 1,
      currentCategory: 'Overview',
      currentNote: '',
      currentPhoto: null,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDiscard = async () => {
    if (!projectId || !currentPhoto) return;
    
    const confirmed = window.confirm('Are you sure you want to discard this photo?');
    if (confirmed) {
      await storageService.removePhoto(projectId, currentPhoto.id);
      setCurrentPhoto(null);
      setCurrentNote('');
    }
  };

  const handleFinish = async () => {
    if (!projectId) return;

    const finalPhotos = currentPhoto ? [...photos, currentPhoto] : photos;
    await storageService.clearAutoSave();
    navigate(`/inspection/${projectId}/review`, { 
      state: { 
        photos: finalPhotos,
        projectId 
      }
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-error mb-4">{error}</h2>
          <button
            onClick={() => setError(null)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </button>
            <h1 className="text-xl font-bold">Site Inspection</h1>
          </div>
          <button
            onClick={handleFinish}
            className="btn btn-primary text-sm"
            disabled={photos.length === 0 && !currentPhoto}
          >
            Finish Inspection
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <InspectionStep
          stepNumber={currentStep}
          photo={currentPhoto}
          category={currentCategory}
          note={currentNote}
          onCategoryChange={setCurrentCategory}
          onNoteChange={setCurrentNote}
          onTakePhoto={takePhoto}
          onNext={handleNext}
          onDiscard={handleDiscard}
          onBack={handleBack}
          isLoading={isLoading}
          canGoBack={currentStep > 1}
        />
      </main>

      {showSuccess && (
        <SuccessAnimation message="Photo saved!" />
      )}
    </div>
  );
}