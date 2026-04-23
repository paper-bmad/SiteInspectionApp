import { useWeatherRisks } from '../hooks/useWeatherRisks';

interface WeatherRisksProps {
  weatherData: any;
  constructionType: string;
}

export function WeatherRisks({ weatherData, constructionType }: WeatherRisksProps) {
  const { data: risks } = useWeatherRisks({ weatherData, constructionType });

  if (!risks?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
          <h3 className="text-xl font-semibold">Weather-Related Risks</h3>
        </div>
        <div className="p-4">
          <p className="text-gray-600">No significant weather risks identified for current conditions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
        <h3 className="text-xl font-semibold">Weather-Related Risks</h3>
      </div>

      <div className="p-4 space-y-4">
        {risks.map((risk, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-50 flex items-center justify-center">
                <span className="text-yellow-600">⚠</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{risk.activity}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                    {risk.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{risk.risk}</p>
                <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700">Required Mitigation:</h5>
                  <p className="text-sm text-gray-600 mt-1">{risk.mitigation}</p>
                </div>
                {risk.standard && (
                  <p className="text-xs text-gray-500 mt-2">
                    Reference: {risk.standard}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}