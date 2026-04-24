import type {
  ComplianceQuery,
  ComplianceReport,
  DomainResult,
  DrawingAnalysis,
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

async function callComplianceAPIStream(
  query: ComplianceQuery,
  onChunk: (text: string) => void,
): Promise<ComplianceReport> {
  const response = await fetch(`${COMPLIANCE_API_URL}/check/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!response.ok) throw new Error(`Compliance API error: ${response.statusText}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    let eventName = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        try {
          const payload = JSON.parse(line.slice(6));
          if (eventName === 'chunk' && payload.text) onChunk(payload.text);
          if (eventName === 'complete' && payload.report) return payload.report as ComplianceReport;
          if (eventName === 'error') throw new Error(payload.message || 'Stream error');
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }
  throw new Error('Stream ended without a complete event');
}

function generateDemoReport(query: ComplianceQuery): ComplianceReport {
  const { buildingParameters: bp, domains } = query;
  const isHighRise = bp.numberOfStoreys > 4;
  const isLargeBuilding = bp.floorAreaM2 > 500;

  const domainResults: DomainResult[] = domains.map((domain): DomainResult => {
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
              status: isLargeBuilding ? 'warning' : 'pass',
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
              status: isHighRise ? 'warning' : 'pass',
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
              status: 'info',
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
              status: 'info',
              notes: `Estimated floor area: ${bp.floorAreaM2}m². Full SAP calculation must be submitted to BCO.`,
            },
          ],
        };

      case 'drainage':
        return {
          domain,
          label: 'Drainage (Doc H)',
          status: 'compliant',
          summary: `Drainage and waste disposal requirements for ${bp.buildingUse} building assessed against Approved Document H.`,
          items: [
            {
              clause: 'H1',
              document: 'Approved Document H',
              title: 'Foul Water Drainage',
              requirement: 'Adequate foul water drainage must be provided to carry foul water to a sewer, cesspool or septic tank.',
              status: 'pass',
            },
            {
              clause: 'H2',
              document: 'Approved Document H',
              title: 'Wastewater Treatment',
              requirement: 'Where no public sewer is available, a suitable wastewater treatment system must be provided.',
              status: 'info',
              notes: 'Confirm connection to public sewer or provide wastewater treatment details to BCO.',
            },
            {
              clause: 'H3',
              document: 'Approved Document H',
              title: 'Rainwater Drainage',
              requirement: 'Adequate provision for rainwater drainage must be made.',
              status: bp.floorAreaM2 > 500 ? 'warning' : 'pass',
              notes: bp.floorAreaM2 > 500
                ? 'Large roof area — sustainable drainage system (SuDS) may be required under Schedule 3 of the Flood & Water Management Act 2010.'
                : undefined,
            },
          ],
        };

      case 'access':
        return {
          domain,
          label: 'Accessibility (Doc M)',
          status: bp.buildingUse === 'Residential' ? 'compliant' : 'requires_review',
          summary: `Access and use requirements for ${bp.buildingUse} building assessed against Approved Document M.`,
          items: [
            {
              clause: 'M4(1)',
              document: 'Approved Document M',
              title: 'Category 1 — Visitable Dwellings',
              requirement: 'New dwellings must meet minimum accessibility standards (step-free access, accessible entrance level WC).',
              status: bp.buildingUse === 'Residential' ? 'pass' : 'info',
            },
            {
              clause: 'M4(2)',
              document: 'Approved Document M',
              title: 'Category 2 — Accessible and Adaptable',
              requirement: 'Higher accessibility standard for dwellings — wider doorways, level access shower, step-free throughout.',
              status: 'info',
              notes: 'Check local planning policy — some LPAs require M4(2) or M4(3) as a planning condition.',
            },
            {
              clause: 'M2',
              document: 'Approved Document M',
              title: 'Access to Non-Domestic Buildings',
              requirement: 'Non-domestic buildings must provide accessible entrance, accessible sanitary facilities, and suitable internal circulation.',
              status: bp.buildingUse !== 'Residential' ? 'warning' : 'pass',
              notes: bp.buildingUse !== 'Residential'
                ? `${bp.buildingUse} buildings require DDA-compliant access audit — confirm with access consultant.`
                : undefined,
            },
          ],
        };

      case 'electrical':
        return {
          domain,
          label: 'Electrical Safety (Doc P)',
          status: 'compliant',
          summary: `Electrical safety requirements for ${bp.buildingUse} dwelling assessed against Approved Document P.`,
          items: [
            {
              clause: 'P1',
              document: 'Approved Document P',
              title: 'Design and Installation',
              requirement: 'Electrical installations must be designed and installed to protect persons from fire and injury.',
              status: 'pass',
            },
            {
              clause: 'P1 — Notification',
              document: 'Approved Document P',
              title: 'Notifiable Work',
              requirement: 'Certain electrical installation work in dwellings must be notified to the local authority.',
              status: 'info',
              notes: 'New circuits, consumer unit replacements, and work in bathrooms/gardens are notifiable under Part P.',
            },
          ],
        };

      case 'security':
        return {
          domain,
          label: 'Security (Doc Q)',
          status: 'compliant',
          summary: `Security requirements for ${bp.buildingUse} dwelling assessed against Approved Document Q.`,
          items: [
            {
              clause: 'Q1',
              document: 'Approved Document Q',
              title: 'Unauthorised Access',
              requirement: 'Doors and windows in new dwellings must resist physical attack and be securely locked.',
              status: 'pass',
              notes: 'Entrance doors must meet PAS 24:2016. Ground floor / accessible windows must also meet PAS 24.',
            },
            {
              clause: 'Q1 — Timber Doors',
              document: 'Approved Document Q',
              title: 'Timber Door Sets',
              requirement: 'Timber entrance door sets must comply with Appendix A of Approved Document Q.',
              status: bp.constructionType === 'Timber Frame' ? 'warning' : 'pass',
              notes: bp.constructionType === 'Timber Frame'
                ? 'Confirm door set certification to PAS 24 for timber frame dwellings.'
                : undefined,
            },
          ],
        };

      case 'site_prep':
        return {
          domain,
          label: 'Site Preparation (Doc C)',
          status: 'compliant',
          summary: `Site preparation and resistance to contaminants assessed against Approved Document C for ${bp.buildingUse} building.`,
          items: [
            {
              clause: 'C1',
              document: 'Approved Document C',
              title: 'Site Preparation',
              requirement: 'Ground to be covered by building must be reasonably free from vegetable matter.',
              status: 'pass',
            },
            {
              clause: 'C2',
              document: 'Approved Document C',
              title: 'Resistance to Contaminants',
              requirement: 'Building must be protected from contaminants in the ground.',
              status: 'info',
              notes: 'Phase 1 desk study recommended for all new build sites to identify potential ground contamination.',
            },
            {
              clause: 'C3',
              document: 'Approved Document C',
              title: 'Resistance to Moisture',
              requirement: 'Walls, floors and roof must resist moisture from the ground, rain and condensation.',
              status: bp.hasBasement ? 'warning' : 'pass',
              notes: bp.hasBasement ? 'Basement walls and floor require Type A, B, or C waterproofing system per BS 8102.' : undefined,
            },
          ],
        };

      case 'sanitation':
        return {
          domain,
          label: 'Sanitation (Doc G)',
          status: 'compliant',
          summary: `Sanitation, hot water safety and water efficiency for ${bp.buildingUse} building assessed against Approved Document G.`,
          items: [
            {
              clause: 'G1',
              document: 'Approved Document G',
              title: 'Cold Water Supply',
              requirement: 'Wholesome cold water must be supplied for drinking, food preparation, washing and sanitary appliances.',
              status: 'pass',
            },
            {
              clause: 'G3',
              document: 'Approved Document G',
              title: 'Hot Water Supply',
              requirement: 'Hot water systems must prevent scalding and Legionella risk. Thermostatic mixing valves required at point of use.',
              status: 'warning',
              notes: 'TMVs required at all baths (≤48°C) and in care homes/schools at all outlets (≤43°C).',
            },
            {
              clause: 'G2',
              document: 'Approved Document G',
              title: 'Water Efficiency',
              requirement: 'New dwellings must not exceed 125 litres/person/day (or 110 l/p/d in water-stressed areas).',
              status: 'info',
              notes: 'Confirm with local water authority whether water-stressed area applies.',
            },
          ],
        };

      case 'falling':
        return {
          domain,
          label: 'Falling Protection (Doc K)',
          status: bp.numberOfStoreys > 1 ? 'requires_review' : 'compliant',
          summary: `Protection from falling, collision and impact for ${bp.numberOfStoreys}-storey ${bp.buildingUse} building assessed against Approved Document K.`,
          items: [
            {
              clause: 'K1',
              document: 'Approved Document K',
              title: 'Stairs and Ramps',
              requirement: 'Stairs must have: max riser 220mm, min going 220mm (private), min going 250mm (common); max pitch 42°.',
              status: 'info',
              notes: 'Stair design must be confirmed against Approved Document K Table 1.1 for the specific use category.',
            },
            {
              clause: 'K2',
              document: 'Approved Document K',
              title: 'Protection from Falling',
              requirement: 'Guarding required where floor or roof is more than 600mm above adjacent level.',
              status: bp.numberOfStoreys > 1 ? 'warning' : 'pass',
              notes: bp.numberOfStoreys > 1
                ? `Min guarding height: 900mm in dwellings, 1100mm in commercial. Confirm balustrade loading to BS EN 1991-1-1.`
                : undefined,
            },
            {
              clause: 'K3',
              document: 'Approved Document K',
              title: 'Vehicle Barriers and Loading Bays',
              requirement: 'Vehicle barriers required at edges of floors accessible to vehicles.',
              status: bp.hasBasement ? 'warning' : 'pass',
              notes: bp.hasBasement ? 'Basement car park requires vehicle barriers at ramp edges.' : undefined,
            },
          ],
        };

      case 'broadband':
        return {
          domain,
          label: 'Broadband (Doc R)',
          status: 'compliant',
          summary: `Physical infrastructure for high-speed broadband in ${bp.buildingUse} development assessed against Approved Document R.`,
          items: [
            {
              clause: 'R1',
              document: 'Approved Document R',
              title: 'In-building Physical Infrastructure',
              requirement: 'New buildings must be equipped with a gigabit-ready in-building physical infrastructure.',
              status: 'pass',
              notes: 'Duct routes, connection points, and access point to network termination point required.',
            },
            {
              clause: 'R1 — Multi-dwelling',
              document: 'Approved Document R',
              title: 'Multi-dwelling Access Point',
              requirement: 'Buildings with more than one dwelling unit require a common access point.',
              status: bp.numberOfStoreys > 1 ? 'info' : 'pass',
              notes: bp.numberOfStoreys > 1 ? 'Ensure a common access point with minimum 10×10cm duct is provided to the site boundary.' : undefined,
            },
          ],
        };

      case 'ev_charging':
        return {
          domain,
          label: 'EV Charging (Doc S)',
          status: bp.buildingUse === 'Residential' ? 'compliant' : 'requires_review',
          summary: `EV charging infrastructure requirements for ${bp.buildingUse} building assessed against Approved Document S.`,
          items: [
            {
              clause: 'S1',
              document: 'Approved Document S',
              title: 'New Residential Buildings',
              requirement: 'New residential buildings with associated parking must have an active EV charge point per dwelling.',
              status: bp.buildingUse === 'Residential' ? 'warning' : 'pass',
              notes: bp.buildingUse === 'Residential'
                ? 'Each parking space requires a 7kW (32A) charge point with smart functionality. Confirm parking layout with structural engineer.'
                : undefined,
            },
            {
              clause: 'S2',
              document: 'Approved Document S',
              title: 'New Non-residential Buildings',
              requirement: 'New non-residential buildings with more than 10 parking spaces must provide EV charge points (1 in 5 spaces).',
              status: bp.buildingUse !== 'Residential' ? 'info' : 'pass',
              notes: bp.buildingUse !== 'Residential'
                ? 'Confirm number of parking spaces and calculate required active/passive provision ratio.'
                : undefined,
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
      ...(domains.includes('drainage') && bp.floorAreaM2 > 500 ? ['Engage drainage engineer for SuDS strategy — large roof area triggers Schedule 3 FWMA 2010.'] : []),
      ...(domains.includes('access') && bp.buildingUse !== 'Residential' ? ['Commission access audit from accredited consultant to confirm Part M compliance for non-domestic use.'] : []),
    ],
    regulationDocuments: [
      ...domains.includes('fire_safety') ? ['Approved Document B (Fire Safety) 2019'] : [],
      ...domains.includes('ventilation') ? ['Approved Document F (Ventilation) 2021'] : [],
      ...domains.includes('structural') ? ['Approved Document A (Structure) 2004'] : [],
      ...domains.includes('energy') || domains.includes('sap') ? ['Approved Document L (Conservation of Fuel and Power) 2021'] : [],
      ...domains.includes('overheating') ? ['Approved Document O (Overheating) 2021'] : [],
      ...domains.includes('acoustics') ? ['Approved Document E (Resistance to Sound) 2003'] : [],
      ...domains.includes('drainage') ? ['Approved Document H (Drainage and Waste Disposal) 2015'] : [],
      ...domains.includes('access') ? ['Approved Document M (Access to and Use of Buildings) 2015'] : [],
      ...domains.includes('electrical') ? ['Approved Document P (Electrical Safety) 2013'] : [],
      ...domains.includes('security') ? ['Approved Document Q (Security) 2015'] : [],
      ...domains.includes('site_prep') ? ['Approved Document C (Site Preparation) 2004'] : [],
      ...domains.includes('sanitation') ? ['Approved Document G (Sanitation, Hot Water Safety and Water Efficiency) 2015'] : [],
      ...domains.includes('falling') ? ['Approved Document K (Protection from Falling) 2013'] : [],
      ...domains.includes('broadband') ? ['Approved Document R (Physical Infrastructure) 2022'] : [],
      ...domains.includes('ev_charging') ? ['Approved Document S (Infrastructure for Charging Electric Vehicles) 2021'] : [],
    ],
  };
}

export const complianceService = {
  async check(
    query: ComplianceQuery,
    onChunk?: (text: string) => void,
  ): Promise<ComplianceReport> {
    let report: ComplianceReport;
    if (COMPLIANCE_API_URL) {
      try {
        report = onChunk
          ? await callComplianceAPIStream(query, onChunk)
          : await callComplianceAPI(query);
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

  async analyzeDrawing(file: File): Promise<DrawingAnalysis> {
    if (!COMPLIANCE_API_URL) {
      throw new Error('Vision analysis requires VITE_COMPLIANCE_API_URL to be configured.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const imageBase64 = btoa(binary);
    const mediaType = file.type || 'image/png';

    const response = await fetch(`${COMPLIANCE_API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mediaType }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Vision API error: ${response.statusText}`);
    }
    return response.json();
  },
};
