import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, DocumentCheckIcon, ClockIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/20/solid';
import type {
  BuildingParameters,
  BuildingUse,
  ComplianceDomain,
  ComplianceQuery,
  ComplianceReport,
  ConstructionType,
} from '../types/compliance';
import { DOMAIN_LABELS } from '../types/compliance';
import { complianceService } from '../services/compliance';
import { ComplianceReport as ComplianceReportView } from './ComplianceReport';

const BUILDING_USES: BuildingUse[] = [
  'Residential', 'Commercial', 'Mixed Use', 'Industrial', 'Education', 'Healthcare',
];
const CONSTRUCTION_TYPES: ConstructionType[] = [
  'Timber Frame', 'Masonry', 'Steel Frame', 'Concrete Frame', 'Cross Laminated Timber',
];
const ALL_DOMAINS: ComplianceDomain[] = [
  'fire_safety', 'ventilation', 'structural', 'energy', 'overheating', 'acoustics', 'sap',
  'drainage', 'access', 'electrical', 'security',
  'site_prep', 'sanitation', 'falling', 'broadband', 'ev_charging',
  'insulation', 'combustion', 'glazing',
];

const CORE_DOMAINS: ComplianceDomain[] = [
  'fire_safety', 'structural', 'energy', 'ventilation',
];

const DEFAULT_PARAMS: BuildingParameters = {
  buildingUse: 'Residential',
  constructionType: 'Masonry',
  numberOfStoreys: 3,
  floorAreaM2: 300,
  occupancyEstimate: 20,
  hasBasement: false,
  hasAtrium: false,
};

export function ComplianceChecker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;

  const [params, setParams] = useState<BuildingParameters>(DEFAULT_PARAMS);
  const [domains, setDomains] = useState<ComplianceDomain[]>(['fire_safety', 'ventilation']);
  const [additionalContext, setAdditionalContext] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [streamPreview, setStreamPreview] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analysisRisks, setAnalysisRisks] = useState<{regulation: string; observation: string; riskLevel: string; action: string}[]>([]);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ComplianceReport[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    complianceService.getHistory(projectId).then(setHistory).catch(() => {});
  }, [projectId]);

  const toggleDomain = (domain: ComplianceDomain) => {
    setDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleAnalyzeDrawing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisRisks([]);
    try {
      const analysis = await complianceService.analyzeDrawing(file);
      setParams(analysis.buildingParameters);
      setAnalysisRisks(analysis.complianceRisks || []);
      // Auto-select relevant domains based on risks found
      if (analysis.complianceRisks?.length > 0) {
        const riskDomains = new Set<ComplianceDomain>(['fire_safety', 'structural', 'ventilation']);
        setDomains(Array.from(riskDomains));
      }
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Drawing analysis failed.');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (domains.length === 0) {
      setError('Select at least one regulation domain to check.');
      return;
    }
    setIsChecking(true);
    setStreamPreview('');
    setError(null);
    setReport(null);
    try {
      const query: ComplianceQuery = {
        id: `query-${Date.now()}`,
        projectId,
        buildingParameters: params,
        domains,
        additionalContext: additionalContext || undefined,
        createdAt: new Date().toISOString(),
      };
      const result = await complianceService.check(query, (chunk) => {
        setStreamPreview((prev) => {
          const next = prev + chunk;
          return next.length > 300 ? '…' + next.slice(-280) : next;
        });
      });
      setStreamPreview('');
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance check failed. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  if (report) {
    return (
      <ComplianceReportView
        report={report}
        onBack={() => setReport(null)}
        onNewCheck={() => { setReport(null); setParams(DEFAULT_PARAMS); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <DocumentCheckIcon className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-gray-900">Compliance Checker</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 pb-16 space-y-6">
        <div className="card">
          <p className="text-sm text-gray-600">
            Enter your building parameters to check compliance against UK Building Regulations.
            Covers Approved Documents A, B, C, E, F, G, H, K, L, M, O, P, Q, R, and S.
          </p>
        </div>

        {/* Drawing analysis */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-gray-900">Analyse Drawing</h2>
            </div>
            <span className="text-xs text-gray-400">AI-powered</span>
          </div>
          <p className="text-sm text-gray-500">
            Upload a floor plan or elevation to auto-extract building parameters.
            Requires compliance API to be configured.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/tiff"
            className="hidden"
            onChange={handleAnalyzeDrawing}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analysing drawing…
              </>
            ) : (
              <>
                <PhotoIcon className="w-4 h-4" />
                Upload Drawing
              </>
            )}
          </button>
          {analyzeError && (
            <p className="text-sm text-red-600">{analyzeError}</p>
          )}
          {analysisRisks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {analysisRisks.length} item{analysisRisks.length !== 1 ? 's' : ''} found in drawing
              </p>
              {analysisRisks.slice(0, 3).map((risk, i) => (
                <div key={i} className={`rounded-lg p-2 text-xs ${
                  risk.riskLevel === 'high' ? 'bg-red-50 text-red-700' :
                  risk.riskLevel === 'medium' ? 'bg-amber-50 text-amber-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  <span className="font-medium">{risk.regulation}</span> — {risk.observation}
                </div>
              ))}
              {analysisRisks.length > 3 && (
                <p className="text-xs text-gray-400">+{analysisRisks.length - 3} more (visible in full report)</p>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleCheck} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Building Parameters</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Use</label>
                <select
                  value={params.buildingUse}
                  onChange={(e) => setParams({ ...params, buildingUse: e.target.value as BuildingUse })}
                  className="input w-full"
                >
                  {BUILDING_USES.map((use) => (
                    <option key={use} value={use}>{use}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Construction Type</label>
                <select
                  value={params.constructionType}
                  onChange={(e) => setParams({ ...params, constructionType: e.target.value as ConstructionType })}
                  className="input w-full"
                >
                  {CONSTRUCTION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Storeys</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={params.numberOfStoreys}
                  onChange={(e) => setParams({ ...params, numberOfStoreys: parseInt(e.target.value) || 1 })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Floor Area (m²)</label>
                <input
                  type="number"
                  min={10}
                  value={params.floorAreaM2}
                  onChange={(e) => setParams({ ...params, floorAreaM2: parseInt(e.target.value) || 10 })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Occupancy</label>
                <input
                  type="number"
                  min={1}
                  value={params.occupancyEstimate}
                  onChange={(e) => setParams({ ...params, occupancyEstimate: parseInt(e.target.value) || 1 })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.hasBasement}
                  onChange={(e) => setParams({ ...params, hasBasement: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-gray-700">Has Basement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.hasAtrium}
                  onChange={(e) => setParams({ ...params, hasAtrium: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-gray-700">Has Atrium</span>
              </label>
            </div>
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Regulation Domains</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDomains(CORE_DOMAINS)}
                  className="text-xs text-primary hover:underline"
                >
                  Core
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setDomains([...ALL_DOMAINS])}
                  className="text-xs text-primary hover:underline"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setDomains([])}
                  className="text-xs text-gray-400 hover:underline"
                >
                  None
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Select the regulations to check against:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_DOMAINS.map((domain) => (
                <label
                  key={domain}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    domains.includes(domain)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={domains.includes(domain)}
                    onChange={() => toggleDomain(domain)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">{DOMAIN_LABELS[domain]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card space-y-2">
            <label className="block text-sm font-medium text-gray-700">Additional Context (optional)</label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g. Corner plot, shared boundary with existing building, ASHP installation..."
              rows={3}
              className="input w-full resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {isChecking && streamPreview && (
            <div className="rounded-xl bg-gray-900 p-3 font-mono text-xs text-green-400 overflow-hidden">
              <p className="text-gray-500 text-[10px] mb-1 font-sans">Live generation</p>
              <p className="whitespace-pre-wrap break-all leading-relaxed">{streamPreview}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isChecking || domains.length === 0}
            className="btn btn-primary w-full"
          >
            {isChecking ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Checking compliance…
              </span>
            ) : (
              'Run Compliance Check'
            )}
          </button>
        </form>

        {history.length > 0 && (
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Recent Checks</h2>
            </div>
            <div className="space-y-2">
              {history.map((pastReport) => (
                <button
                  key={pastReport.id}
                  onClick={() => setReport(pastReport)}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      pastReport.overallStatus === 'compliant'
                        ? 'bg-green-100 text-green-700'
                        : pastReport.overallStatus === 'non_compliant'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pastReport.overallStatus.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(pastReport.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {pastReport.domains.length} domain{pastReport.domains.length !== 1 ? 's' : ''} checked
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
