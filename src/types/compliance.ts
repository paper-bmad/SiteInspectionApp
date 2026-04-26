export type ComplianceDomain =
  | 'fire_safety'
  | 'ventilation'
  | 'structural'
  | 'energy'
  | 'overheating'
  | 'acoustics'
  | 'sap'
  | 'drainage'
  | 'access'
  | 'electrical'
  | 'security'
  | 'site_prep'
  | 'sanitation'
  | 'falling'
  | 'broadband'
  | 'ev_charging'
  | 'insulation'
  | 'combustion'
  | 'glazing';

export type BuildingUse =
  | 'Residential'
  | 'Commercial'
  | 'Mixed Use'
  | 'Industrial'
  | 'Education'
  | 'Healthcare';

export type ConstructionType =
  | 'Timber Frame'
  | 'Masonry'
  | 'Steel Frame'
  | 'Concrete Frame'
  | 'Cross Laminated Timber';

export interface BuildingParameters {
  buildingUse: BuildingUse;
  constructionType: ConstructionType;
  numberOfStoreys: number;
  floorAreaM2: number;
  occupancyEstimate: number;
  hasBasement: boolean;
  hasAtrium: boolean;
}

export interface ComplianceQuery {
  id?: string;
  projectId?: string;
  buildingParameters: BuildingParameters;
  domains: ComplianceDomain[];
  additionalContext?: string;
  createdAt?: string;
}

export interface RegulationItem {
  clause: string;
  document: string;
  title: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  notes?: string;
}

export interface DomainResult {
  domain: ComplianceDomain;
  label: string;
  status: 'compliant' | 'non_compliant' | 'requires_review' | 'not_applicable';
  summary: string;
  items: RegulationItem[];
}

export interface ComplianceReport {
  id: string;
  queryId: string;
  projectId?: string;
  generatedAt: string;
  overallStatus: 'compliant' | 'non_compliant' | 'requires_review';
  domains: DomainResult[];
  recommendations: string[];
  regulationDocuments: string[];
}

export interface DrawingClassification {
  drawing_type: 'floor_plan' | 'elevation' | 'section' | 'site_plan' | 'detail' | 'schedule' | 'unknown';
  confidence: number;
  scale: string | null;
  north_arrow_present: boolean;
  notes: string;
}

export interface ComplianceRisk {
  regulation: string;
  observation: string;
  riskLevel: 'low' | 'medium' | 'high';
  action: string;
}

export interface DrawingAnalysis {
  classification: DrawingClassification;
  buildingParameters: BuildingParameters;
  complianceRisks: ComplianceRisk[];
  extractionConfidence: number;
  extractionNotes: string;
}

export const DOMAIN_LABELS: Record<ComplianceDomain, string> = {
  fire_safety: 'Fire Safety (Doc B)',
  ventilation: 'Ventilation (Doc F)',
  structural: 'Structural (Doc A)',
  energy: 'Energy (Doc L)',
  overheating: 'Overheating (Doc O)',
  acoustics: 'Sound Insulation (Doc E)',
  sap: 'SAP Energy Rating',
  drainage: 'Drainage (Doc H)',
  access: 'Accessibility (Doc M)',
  electrical: 'Electrical Safety (Doc P)',
  security: 'Security (Doc Q)',
  site_prep: 'Site Preparation (Doc C)',
  sanitation: 'Sanitation (Doc G)',
  falling: 'Falling Protection (Doc K)',
  broadband: 'Broadband (Doc R)',
  ev_charging: 'EV Charging (Doc S)',
  insulation: 'Cavity Insulation (Doc D)',
  combustion: 'Combustion Appliances (Doc J)',
  glazing: 'Glazing Safety (Doc N)',
};
