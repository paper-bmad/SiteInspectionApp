import { format, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';

interface TimelineBarProps {
  startDate: string;
  substructureDate: string;
  superstructureDate: string;
  completionDate: string;
}

export function TimelineBar({ 
  startDate, 
  substructureDate, 
  superstructureDate, 
  completionDate 
}: TimelineBarProps) {
  const today = new Date();
  const totalDays = differenceInDays(new Date(completionDate), new Date(startDate));
  
  const getProgressPercentage = (date: string) => {
    return (differenceInDays(new Date(date), new Date(startDate)) / totalDays) * 100;
  };

  const currentProgress = (differenceInDays(today, new Date(startDate)) / totalDays) * 100;

  const getPhaseColor = (start: string, end: string) => {
    if (isAfter(today, new Date(end))) return 'bg-green-500';
    if (isBefore(today, new Date(start))) return 'bg-gray-200';
    return 'bg-blue-500';
  };

  return (
    <div className="relative">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        {/* Substructure Phase */}
        <div 
          className={`absolute h-full ${getPhaseColor(startDate, substructureDate)} transition-all duration-300`}
          style={{ 
            left: '0%',
            width: `${getProgressPercentage(substructureDate)}%`
          }}
        />
        
        {/* Superstructure Phase */}
        <div 
          className={`absolute h-full ${getPhaseColor(substructureDate, superstructureDate)} transition-all duration-300`}
          style={{ 
            left: `${getProgressPercentage(substructureDate)}%`,
            width: `${getProgressPercentage(superstructureDate) - getProgressPercentage(substructureDate)}%`
          }}
        />
        
        {/* Completion Phase */}
        <div 
          className={`absolute h-full ${getPhaseColor(superstructureDate, completionDate)} transition-all duration-300`}
          style={{ 
            left: `${getProgressPercentage(superstructureDate)}%`,
            width: `${100 - getProgressPercentage(superstructureDate)}%`
          }}
        />
      </div>

      {/* Current Date Marker */}
      {currentProgress >= 0 && currentProgress <= 100 && (
        <div 
          className="absolute transition-all duration-300" 
          style={{ left: `${currentProgress}%`, top: '-12px' }}
        >
          <div 
            className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-red-500 relative -translate-x-1/2"
            title={format(today, 'dd MMM yyyy')}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-500 text-white text-xs px-2 py-1 rounded">
              Today
            </div>
          </div>
        </div>
      )}
    </div>
  );
}