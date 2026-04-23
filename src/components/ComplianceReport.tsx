import { useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid';
import type { ComplianceReport as Report, DomainResult, RegulationItem } from '../types/compliance';

interface Props {
  report: Report;
  onBack: () => void;
  onNewCheck: () => void;
}

const STATUS_CONFIG = {
  pass: { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Pass' },
  fail: { icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Fail' },
  warning: { icon: ExclamationTriangleIcon, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Warning' },
  info: { icon: InformationCircleIcon, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Info' },
};

const OVERALL_CONFIG = {
  compliant: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300', label: 'Compliant', icon: CheckCircleIcon },
  non_compliant: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', label: 'Non-Compliant', icon: XCircleIcon },
  requires_review: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', label: 'Requires Review', icon: ExclamationTriangleIcon },
};

function RegulationItemRow({ item }: { item: RegulationItem }) {
  const config = STATUS_CONFIG[item.status];
  const Icon = config.icon;
  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${config.border} ${config.bg}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-gray-500">{item.document} §{item.clause}</span>
            <p className="text-sm font-medium text-gray-900">{item.title}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${config.color} ${config.bg}`}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{item.requirement}</p>
        {item.notes && (
          <p className="text-xs text-gray-700 mt-1 italic">{item.notes}</p>
        )}
      </div>
    </div>
  );
}

function DomainSection({ domain }: { domain: DomainResult }) {
  const [isExpanded, setIsExpanded] = useState(domain.status !== 'not_applicable');

  const statusColors = {
    compliant: 'text-green-700 bg-green-50 border-green-200',
    non_compliant: 'text-red-700 bg-red-50 border-red-200',
    requires_review: 'text-amber-700 bg-amber-50 border-amber-200',
    not_applicable: 'text-gray-500 bg-gray-50 border-gray-200',
  };

  const statusLabels = {
    compliant: 'Compliant',
    non_compliant: 'Non-Compliant',
    requires_review: 'Review Required',
    not_applicable: 'N/A',
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 text-sm">{domain.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[domain.status]}`}>
            {statusLabels[domain.status]}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50">
          <p className="text-sm text-gray-700">{domain.summary}</p>
          {domain.items.length > 0 && (
            <div className="space-y-2">
              {domain.items.map((item, idx) => (
                <RegulationItemRow key={`${item.clause}-${idx}`} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ComplianceReport({ report, onBack, onNewCheck }: Props) {
  const overall = OVERALL_CONFIG[report.overallStatus];
  const OverallIcon = overall.icon;

  const handleDownload = () => {
    const lines = [
      'BuildwellAI Compliance Report',
      `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      `Overall Status: ${overall.label}`,
      '',
      'REGULATION DOMAINS',
      '==================',
      ...report.domains.map((d) => [
        `\n${d.label}: ${d.status.toUpperCase().replace('_', ' ')}`,
        d.summary,
        ...d.items.map((item) => `  [${item.status.toUpperCase()}] ${item.document} §${item.clause} — ${item.title}`),
      ]).flat(),
      '',
      'RECOMMENDATIONS',
      '===============',
      ...report.recommendations.map((r) => `• ${r}`),
      '',
      'REGULATION DOCUMENTS REFERENCED',
      '================================',
      ...report.regulationDocuments.map((d) => `• ${d}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Edit Parameters
          </button>
          <h1 className="text-base font-bold text-gray-900">Compliance Report</h1>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="Download report"
          >
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 pb-16 space-y-4">
        <div className={`card border-2 ${overall.border} ${overall.bg}`}>
          <div className="flex items-center gap-3">
            <OverallIcon className={`w-8 h-8 ${overall.color}`} />
            <div>
              <p className="text-xs text-gray-500">Overall Status</p>
              <p className={`text-xl font-bold ${overall.color}`}>{overall.label}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm px-1">Regulation Domains</h2>
          {report.domains.map((domain) => (
            <DomainSection key={domain.domain} domain={domain} />
          ))}
        </div>

        {report.recommendations.length > 0 && (
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900">Recommendations</h2>
            <ul className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-primary font-bold flex-shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.regulationDocuments.length > 0 && (
          <div className="card space-y-2">
            <h2 className="font-semibold text-gray-900 text-sm">Documents Referenced</h2>
            <ul className="space-y-1">
              {report.regulationDocuments.map((doc, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex gap-2">
                  <span className="text-gray-400">—</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={onNewCheck} className="btn btn-secondary w-full">
          New Compliance Check
        </button>
      </div>
    </div>
  );
}
