import { useRef, useEffect, useState } from 'react';

interface CameraPreviewProps {
  onCapture: (imageData: string, heading: { direction: string; degrees: number }) => void;
  onClose: () => void;
}

const DIRECTIONS = [
  { label: 'N', degrees: 0, range: [-22.5, 22.5] },
  { label: 'NE', degrees: 45, range: [22.5, 67.5] },
  { label: 'E', degrees: 90, range: [67.5, 112.5] },
  { label: 'SE', degrees: 135, range: [112.5, 157.5] },
  { label: 'S', degrees: 180, range: [157.5, 202.5] },
  { label: 'SW', degrees: 225, range: [202.5, 247.5] },
  { label: 'W', degrees: 270, range: [247.5, 292.5] },
  { label: 'NW', degrees: 315, range: [292.5, 337.5] }
] as const;

export function CameraPreview({ onCapture, onClose }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);
  const [isCompassAvailable, setIsCompassAvailable] = useState(false);

  useEffect(() => {
    async function setupDevices() {
      try {
        // Setup camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Check compass availability
        if ('DeviceOrientationEvent' in window) {
          // Request permission for iOS devices
          if ((DeviceOrientationEvent as any).requestPermission) {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            setIsCompassAvailable(permission === 'granted');
          } else {
            setIsCompassAvailable(true);
          }
        }
      } catch (err) {
        console.error('Error accessing devices:', err);
      }
    }

    setupDevices();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isCompassAvailable) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        const heading = (event.alpha + 360) % 360;
        setCurrentHeading(heading);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isCompassAvailable]);

  const getDirectionFromDegrees = (degrees: number) => {
    // Handle the special case for North (which wraps around 360/0)
    if (degrees > 337.5 || degrees <= 22.5) {
      return 'N';
    }

    // Find the matching direction based on degree ranges
    const direction = DIRECTIONS.find(
      dir => degrees > dir.range[0] && degrees <= dir.range[1]
    );

    return direction?.label || 'N';
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // If compass is available, include heading data
      const heading = currentHeading !== null ? {
        direction: getDirectionFromDegrees(currentHeading),
        degrees: currentHeading
      } : {
        direction: 'N',
        degrees: 0
      };

      onCapture(imageData, heading);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full flex flex-col">
        {/* Camera Preview */}
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Compass Overlay */}
          {isCompassAvailable && currentHeading !== null && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full
                          backdrop-blur-sm flex items-center gap-2">
              <span>🧭</span>
              <span>{getDirectionFromDegrees(currentHeading)}</span>
              <span className="text-sm opacity-75">({Math.round(currentHeading)}°)</span>
            </div>
          )}

          {/* Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            <button
              onClick={onClose}
              className="btn btn-secondary bg-white/10 backdrop-blur-sm"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-white 
                       flex items-center justify-center relative
                       before:absolute before:inset-2 before:rounded-full before:bg-white
                       before:transform hover:before:scale-95 before:transition-transform"
              aria-label="Take photo"
            />

            <div className="w-20" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>
    </div>
  );
}