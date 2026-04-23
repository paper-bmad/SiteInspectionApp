import type {
  BuildingParameters,
  ComplianceDomain,
  ComplianceQuery,
  ComplianceReport,
  DomainResult,
} from '../types/compliance';
import { supabase } from '../lib/supabase';

const COMPLIANCE_API_URL = import.meta.env.VITE_COMPLIANCE_API_URL;
const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function persistQuery(query: ComplianceQuery, userId: string): Promise<string | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const bp = query.buildingParameters;
  const { data, error } = await supabase.from('compliance_queries').insert({
    id: query.id,
    project_id: query.projectId || null,
    user_id: userId,
    building_use: bp.buildingUse,
    construction_type: bp.constructionType,
    number_of_storeys: bp.numberOfStoreys,
    floor_area_m2: bp.floorAreaM2,
    occupancy_estimate: bp.occupancyEstimate,
    has_basement: bp.hasBasement,
    has_atrium: bp.hasAtrium,
    domains: query.domains,
    additional_context: query.additionalContext || null,
  }).select('id').single();
  if (error) { console.warn('Failed to save compliance query:', error.message); return null; }
  return data.id;
}

async function persistReport(report: ComplianceReport, userId: string): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('compliance_reports').insert({
    id: report.id,
    query_id: report.queryId,
    project_id: report.projectId || null,
    user_id: userId,
    overall_status: report.overallStatus,
    domains: report.domains,
    recommendations: report.recommendations,
    regulation_documents: report.regulationDocuments,
  });
  if (error) console.warn('Failed to save compliance report:', error.message);
}

async function callComplianceAPI(query: ComplianceQuery): Promise<ComplianceReport> {
  const response = await fetch(`${COMPLIANCE_API_URL}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!response.ok) throw new Error(`Compliance API error: ${response.statusText}`);
  return response.json();
}

function generateDemoReport(query: ComplianceQuery): ComplianceReport {
  const { buildingParameters: bp, domains } = query;
  const isHighRise = bp.numberOfStoreys > 4;
  const isLargeBuilding = bp.floorAreaM2 > 500;

  const domainResults: DomainResult[] = domains.map((domain) => {
    switch (domain) {
      case 'fire_safety':
        return {
          domain,
          label: 'Fire Safety (Doc B & L)',
          status: isHighRise ? 'requires_review' : 'compliant',
          summary: isHighRise
            ? `${bp.numberOfStoreys}-storey ${bp.buildingUse} building requires enhanced fire safety measures per Approved Document B.`
            : `${bp.buildingUse} building of ${bp.numberOfStoreys} storeys meets standard fire safety requirements.`,
          items: [
            {
              clause: 'B1',
              document: 'Approved Document B',
              title: 'Means of Escape',
              requirement: 'All occupants must be able to escape to a place of safety without assistance from fire services.',
              status: 'pass',
              notes: `Travel distance limits apply based on ${bp.occupancyEstimate} estimated occupants.`,
            },
            {
              clause: 'B2',
              document: 'Approved Document B',
              title: 'Internal Fire Spread (Linings)',
              requirement: 'Linings must adequately resist flame spread and not produce excessive heat or smoke.',
              status: 'pass',
            },
            {
              clause: 'B3',
              document: 'Approved Document B',
              title: 'Internal Fire Spread (Structure)',
              requirement: 'Building structure must resist collapse for adequate time to evacuate.',
              status: isHighRise ? 'warning' : 'pass',
              notes: isHighRise
                ? `Buildings over 18m require third-party fire engineering review.`
                : undefined,
            },
            {
              clause: 'B4',
              document: 'Approved Document B',
              title: 'External Fire Spread',
              requirement: 'External walls and roofs must not allow fire to spread between buildings.',
              status: bp.constructionType === 'Timber Frame' ? 'warning' : 'pass',
              notes: bp.constructionType === 'Timber Frame'
                ? 'Timber frame buildings require additional fire barrier detailing.'
                : undefined,
            },
            {
              clause: 'B5',
              document: 'Approved Document B',
              title: 'Access & Facilities for Fire Services',
              requirement: 'Adequate access for fire appliances and facilities for firefighting.',
              status: isLargeBuilding ? 'requires_review' : 'pass',
            },
          ],
        };

      case 'ventilation':
        return {
          domain,
          label: 'Ventilation (Doc F)',
          status: 'compliant',
          summary: `Ventilation requirements for ${bp.buildingUse} building with ${bp.floorAreaM2}m² floor area assessed against Approved Document F.`,
          items: [
            {
              clause: 'F1',
              document: 'Approved Document F',
              title: 'Means of Ventilation',
              requirement: 'Adequate ventilation provided for health and safety of occupants.',
              status: 'pass',
            },
            {
              clause: 'F2',
              document: 'Approved Document F',
              title: 'Information about ventilation systems',
              requirement: 'O&M information must be provided to building owner.',
              status: 'info',
              notes: 'O&M manual required at handover.',
            },
          ],
        };

      case 'structural':
        return {
          domain,
          label: 'Structural (Doc A)',
          status: 'compliant',
          summary: `${bp.constructionType} structure for ${bp.numberOfStoreys}-storey building assessed against Approved Document A.`,
          items: [
            {
              clause: 'A1',
              document: 'Approved Document A',
              title: 'Loading',
              requirement: 'Structure must resist applied loads without excessive deflection or deformation.',
              status: 'pass',
            },
            {
              clause: 'A2',
              document: 'Approved Document A',
              title: 'Ground Movement',
              requirement: 'Foundation design must account for ground movement.',
              status: bp.hasBasement ? 'warning' : 'pass',
              notes: bp.hasBasement ? 'Basement construction requires detailed geotechnical assessment.' : undefined,
            },
            {
              clause: 'A3',
              document: 'Approved Document A',
              title: 'Disproportionate Collapse',
              requirement: 'Building must be designed to avoid disproportionate collapse.',
              status: isHighRise ? 'requires_review' : 'pass',
              notes: isHighRise ? 'Class 3 building — formal structural risk assessment required.' : undefined,
            },
          ],
        };

      case 'energy':
        return {
          domain,
          label: 'Energy (Doc L)',
          status: 'requires_review',
          summary: `Energy performance for ${bp.buildingUse} building assessed against Approved Document L.`,
          items: [
            {
              clause: 'L1A',
              document: 'Approved Document L',
              title: 'New Dwellings — Conservation of Fuel & Power',
              requirement: 'Fabric energy efficiency standard and primary energy target must be met.',
              status: 'requires_review',
              notes: 'SAP calculation required to confirm compliance with energy target.',
            },
          ],
        };

      case 'overheating':
        return {
          domain,
          label: 'Overheating (Doc O)',
          status: isHighRise ? 'requires_review' : 'compliant',
          summary: `Overheating risk assessment per Approved Document O for ${bp.buildingUse} building.`,
          items: [
            {
              clause: 'O1',
              document: 'Approved Document O',
              title: 'Overheating Mitigation',
              requirement: 'Buildings must limit the risk of overheating for occupants.',
              status: isHighRise ? 'warning' : 'pass',
              notes: isHighRise
                ? 'Dynamic thermal modelling recommended for high-rise residential.'
                : undefined,
            },
          ],
        };

      case 'acoustics':
        return {
          domain,
          label: 'Sound Insulation (Doc E)',
          status: 'compliant',
          summary: `Acoustic performance requirements for ${bp.buildingUse} building per Approved Document E.`,
          items: [
            {
              clause: 'E1',
              document: 'Approved Document E',
              title: 'Protection Against Sound from Other Parts of Building',
              requirement: 'Separating walls and floors must meet minimum acoustic performance standards.',
              status: 'pass',
            },
            {
              clause: 'E3',
              document: 'Approved Document E',
              title: 'Reverberation in Common Areas',
              requirement: 'Common internal parts of buildings containing dwellings must avoid excessive reverberation.',
              status: 'pass',
            },
          ],
        };

      case 'sap':
        return {
          domain,
          label: 'SAP Energy Rating',
          status: 'requires_review',
          summary: 'SAP calculation required to determine energy rating and compliance with Part L target.',
          items: [
            {
              clause: 'SAP 10.2',
              document: 'SAP 2012 (BREDEM)',
              title: 'Primary Energy Calculation',
              requirement: 'Primary energy target must not be exceeded.',
              status: 'requires_review',
              notes: `Estimated floor area: ${bp.floorAreaM2}m². Full SAP calculation must be submitted to BCO.`,
            },
          ],
        };

      default:
        return {
          domain,
          label: domain,
          status: 'not_applicable',
          summary: 'Domain not applicable or not assessed.',
          items: [],
        };
    }
  });

  const hasFailures = domainResults.some((r) => r.status === 'non_compliant');
  const hasReviews = domainResults.some((r) => r.status === 'requires_review');

  return {
    id: `report-${Date.now()}`,
    queryId: query.id || `query-${Date.now()}`,
    projectId: query.projectId,
    generatedAt: new Date().toISOString(),
    overallStatus: hasFailures ? 'non_compliant' : hasReviews ? 'requires_review' : 'compliant',
    domains: domainResults,
    recommendations: [
      ...(isHighRise ? ['Engage a specialist fire engineer for buildings over 18m (Regulation 38 / Building Safety Act 2022).'] : []),
      ...(bp.constructionType === 'Timber Frame' ? ['Commission a pre-completion acoustic test (Part E) for timber frame separating elements.'] : []),
      'Submit SAP calculation and EPC application before practical completion.',
      'Ensure O&M manuals for all building services are compiled for Handover Stage.',
      ...(bp.hasBasement ? ['Obtain full geotechnical report and waterproofing strategy for basement elements.'] : []),
    ],
    regulationDocuments: [
      ...domains.includes('fire_safety') ? ['Approved Document B (Fire Safety) 2019'] : [],
      ...domains.includes('ventilation') ? ['Approved Document F (Ventilation) 2021'] : [],
      ...domains.includes('structural') ? ['Approved Document A (Structure) 2004'] : [],
      ...domains.includes('energy') || domains.includes('sap') ? ['Approved Document L (Conservation of Fuel and Power) 2021'] : [],
      ...domains.includes('overheating') ? ['Approved Document O (Overheating) 2021'] : [],
      ...domains.includes('acoustics') ? ['Approved Document E (Resistance to Sound) 2003'] : [],
    ],
  };
}

export const complianceService = {
  async check(query: ComplianceQuery): Promise<ComplianceReport> {
    let report: ComplianceReport;
    if (COMPLIANCE_API_URL) {
      try {
        report = await callComplianceAPI(query);
      } catch (err) {
        console.warn('Compliance API unavailable, using demo mode:', err);
        await new Promise((resolve) => setTimeout(resolve, 800));
        report = generateDemoReport(query);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      report = generateDemoReport(query);
    }

    if (SUPABASE_CONFIGURED) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await persistQuery(query, user.id);
        await persistReport(report, user.id);
      }
    }

    return report;
  },

  async getHistory(projectId?: string): Promise<ComplianceReport[]> {
    if (!SUPABASE_CONFIGURED) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let q = supabase
      .from('compliance_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(20);

    if (projectId) q = q.eq('project_id', projectId);

    const { data, error } = await q;
    if (error) { console.warn('Failed to fetch compliance history:', error.message); return []; }

    return (data || []).map((row: any) => ({
      id: row.id,
      queryId: row.query_id,
      projectId: row.project_id,
      generatedAt: row.generated_at,
      overallStatus: row.overall_status,
      domains: row.domains,
      recommendations: row.recommendations,
      regulationDocuments: row.regulation_documents,
    }));
  },
};
