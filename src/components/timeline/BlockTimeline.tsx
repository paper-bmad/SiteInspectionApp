import { format } from 'date-fns';
import { TimelineBar } from './TimelineBar';
import type { BlockTimeline } from '../../types/project';

interface BlockTimelineProps {
  block: BlockTimeline;
  onUpdate: (blockId: string, updates: Partial<BlockTimeline>) => void;
}

function getBlockTitle(block: BlockTimeline) {
  switch (block.type) {
    case 'ApartmentBlock':
      return `Block ${block.name} - ${block.details?.numLevels}-storey Apartment Block`;
    case 'DetachedHouses':
      return `${block.quantity} Detached Houses`;
    case 'SemiDetachedHouses':
      return `${block.quantity} Semi-Detached Houses`;
    case 'TerracedHouses':
      return `${block.quantity} Terraced Houses`;
    case 'CommercialUnits':
      return `${block.quantity} Commercial Units`;
    default:
      return `Block ${block.name}`;
  }
}

export function BlockTimeline({ block, onUpdate }: BlockTimelineProps) {
  const handleDateChange = (field: keyof BlockTimeline, value: string) => {
    onUpdate(block.id, { [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{getBlockTitle(block)}</h3>
        <span className="px-3 py-1 rounded-full text-sm bg-gray-100">
          {format(new Date(block.startDate), 'MMM yyyy')} - {format(new Date(block.completionDate), 'MMM yyyy')}
        </span>
      </div>

      {block.details && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
          {block.details.numLevels && (
            <p>Levels: {block.details.numLevels}</p>
          )}
          {block.details.numUnits && (
            <p>Residential Units: {block.details.numUnits}</p>
          )}
          {block.details.commercialUnits && (
            <p>Commercial Units: {block.details.commercialUnits}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={block.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="input w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Substructure</label>
          <input
            type="date"
            value={block.substructureDate}
            onChange={(e) => handleDateChange('substructureDate', e.target.value)}
            className="input w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Superstructure</label>
          <input
            type="date"
            value={block.superstructureDate}
            onChange={(e) => handleDateChange('superstructureDate', e.target.value)}
            className="input w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completion</label>
          <input
            type="date"
            value={block.completionDate}
            onChange={(e) => handleDateChange('completionDate', e.target.value)}
            className="input w-full text-sm"
          />
        </div>
      </div>

      <div className="pt-2">
        <TimelineBar
          startDate={block.startDate}
          substructureDate={block.substructureDate}
          superstructureDate={block.superstructureDate}
          completionDate={block.completionDate}
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Start</span>
          <span>Substructure</span>
          <span>Superstructure</span>
          <span>Completion</span>
        </div>
      </div>
    </div>
  );
}