export interface PhotoAnnotation {
  id: string;
  type: 'arrow' | 'rectangle';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
}

export interface Photo {
  id: string;
  uri: string;
  category: 'Defect' | 'Risk' | 'Overview';
  referenceId?: string; // Format: DEF-2024-001 or RISK-2024-001
  notes?: string;
  gpsLocation: {
    latitude: number;
    longitude: number;
    altitude: number | null;
  };
  compass: {
    direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
    degrees: number;
  };
  timestamp: string;
  annotations?: PhotoAnnotation[];
}

export interface BuildingSection {
  id: string;
  name: string;
  subsections: string[];
}

export interface Inspection {
  id: string;
  projectId: string;
  status: 'draft' | 'completed';
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
  defectCounter: number;
  riskCounter: number;
  // Optional UI session state persisted for restore-on-reload
  currentStep?: number;
  currentCategory?: 'Defect' | 'Risk' | 'Overview';
  currentNote?: string;
  currentPhoto?: Photo | null;
}