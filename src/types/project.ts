export interface InsuranceLayer {
  name: string;
  percentage: number;
}

export interface Insurance {
  primary: InsuranceLayer[];
  secondary: InsuranceLayer[];
  tertiary?: InsuranceLayer[];
  additional?: InsuranceLayer[];
}

export interface Appointment {
  scopeOfWork: string;
  insuranceProduct: 'New Homes Warranty' | 'Social Housing' | 'Commercial' | 'Build-to-Rent';
  projectType: string;
  reconstructionValue: number;
}

export interface Construction {
  superstructure: {
    type: string;
    details?: Record<string, any>;
  };
  substructure?: {
    type: string;
    details?: Record<string, any>;
  };
}

export interface BlockTimeline {
  id: string;
  name: string;
  type: 'ApartmentBlock' | 'DetachedHouses' | 'SemiDetachedHouses' | 'TerracedHouses' | 'CommercialUnits';
  quantity: number;
  startDate: string;
  substructureDate: string;
  superstructureDate: string;
  completionDate: string;
  details?: {
    numLevels?: number;
    numUnits?: number;
    commercialUnits?: number;
  };
}

export interface ProjectDetails {
  id: string;
  thumbnail?: string;
  name: string;
  reference: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
  };
  client: {
    name: string;
    contact: {
      name: string;
      phone: string;
      email: string;
    };
  };
  inspection: {
    number: number;
    lastDate?: string;
    mainRecipient: {
      name: string;
      email: string;
      phone: string;
    };
  };
  summary?: {
    numApartments: number;
    numLevels: number;
    numCommercialUnitsBlock: number;
    numDetachedHouses: number;
    numSemiDetachedHouses: number;
    numTerracedHouses: number;
    numCommercialUnitsTotal: number;
  };
  blocks: BlockTimeline[];
  appointment?: Appointment;
  insurance: Insurance;
  dates: {
    start: string;
    overallEnd: string;
  };
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  plots?: {
    total: number;
  };
  construction: Construction;
}