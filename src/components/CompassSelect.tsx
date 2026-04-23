import { useEffect, useState } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';

const DIRECTIONS = [
  { label: 'North', value: 'N', degrees: 0 },
  { label: 'North East', value: 'NE', degrees: 45 },
  { label: 'East', value: 'E', degrees: 90 },
  { label: 'South East', value: 'SE', degrees: 135 },
  { label: 'South', value: 'S', degrees: 180 },
  { label: 'South West', value: 'SW', degrees: 225 },
  { label: 'West', value: 'W', degrees: 270 },
  { label: 'North West', value: 'NW', degrees: 315 }
] as const;

interface CompassSelectProps {
  value: { direction: typeof DIRECTIONS[number]['value']; degrees: number };
  onChange: (value: { direction: typeof DIRECTIONS[number]['value']; degrees: number }) => void;
}

export function CompassSelect({ value, onChange }: CompassSelectProps) {
  const [isCompassAvailable, setIsCompassAvailable] = useState(false);
  const [isUsingCompass, setIsUsingCompass] = useState(false);
  const selectedDirection = DIRECTIONS.find(d => d.value === value.direction) || DIRECTIONS[0];

  useEffect(() => {
    // Check if the device has compass capabilities
    if ('DeviceOrientationEvent' in window) {
      setIsCompassAvailable(true);
    }
  }, []);

  useEffect(() => {
    if (!isUsingCompass) return;

    let handler: (event: DeviceOrientationEvent) => void;

    const startCompass = async () => {
      try {
        // Request permission if needed (iOS)
        if ((DeviceOrientationEvent as any).requestPermission) {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission !== 'granted') {
            setIsUsingCompass(false);
            return;
          }
        }

        handler = (event: DeviceOrientationEvent) => {
          if (event.alpha === null) return;

          // Convert alpha value (0-360) to closest direction
          const degrees = event.alpha;
          const normalizedDegrees = (degrees + 360) % 360;
          
          // Find the closest direction
          const closest = DIRECTIONS.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.degrees - normalizedDegrees);
            const currDiff = Math.abs(curr.degrees - normalizedDegrees);
            return prevDiff < currDiff ? prev : curr;
          });

          onChange({
            direction: closest.value,
            degrees: normalizedDegrees
          });
        };

        window.addEventListener('deviceorientation', handler);
      } catch (error) {
        console.error('Error accessing compass:', error);
        setIsUsingCompass(false);
      }
    };

    startCompass();

    return () => {
      if (handler) {
        window.removeEventListener('deviceorientation', handler);
      }
    };
  }, [isUsingCompass, onChange]);

  const toggleCompass = async () => {
    setIsUsingCompass(prev => !prev);
  };

  return (
    <div className="space-y-2">
      <Listbox
        value={selectedDirection}
        onChange={(direction) => onChange({ direction: direction.value, degrees: direction.degrees })}
      >
        <div className="relative">
          <Listbox.Button className="input w-full flex justify-between items-center">
            <span className="flex items-center">
              <span className="mr-2">🧭</span>
              {selectedDirection.label}
              {isUsingCompass && <span className="ml-2 text-primary">(Live)</span>}
            </span>
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg max-h-60 overflow-auto">
            {DIRECTIONS.map((direction) => (
              <Listbox.Option
                key={direction.value}
                value={direction}
                className={({ active }) =>
                  `p-4 cursor-pointer ${active ? 'bg-primary/5 text-primary' : 'text-gray-900'}`
                }
              >
                {direction.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {isCompassAvailable && (
        <button
          onClick={toggleCompass}
          className={`btn w-full ${isUsingCompass ? 'btn-primary' : 'btn-secondary'} 
                     flex items-center justify-center gap-2`}
        >
          <ArrowUpIcon className={`h-5 w-5 transform ${isUsingCompass ? 'animate-pulse' : ''}`} 
                      style={{ transform: `rotate(${value.degrees}deg)` }} />
          {isUsingCompass ? 'Stop Compass' : 'Use Device Compass'}
        </button>
      )}

      {isUsingCompass && (
        <div className="text-sm text-center text-gray-500">
          Point your device in the direction you're facing
        </div>
      )}
    </div>
  );
}