import { BlockTimeline } from './BlockTimeline';
import type { BlockTimeline as BlockTimelineType } from '../../types/project';

interface ProjectTimelinesProps {
  blocks: BlockTimelineType[];
  onUpdateBlock: (blockId: string, updates: Partial<BlockTimelineType>) => void;
}

export function ProjectTimelines({ blocks, onUpdateBlock }: ProjectTimelinesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Construction Timelines</h2>
        <div className="flex items-center space-x-2">
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1" />
            <span className="text-sm">Completed</span>
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
            <span className="text-sm">In Progress</span>
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-200 mr-1" />
            <span className="text-sm">Upcoming</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <BlockTimeline
            key={block.id}
            block={block}
            onUpdate={onUpdateBlock}
          />
        ))}
      </div>
    </div>
  );
}