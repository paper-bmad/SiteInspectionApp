import { useQuery } from '@tanstack/react-query';

interface WeatherRisksParams {
  weatherData: {
    current: {
      temp: number;
      windSpeed: number;
      description: string;
    } | null;
  } | null;
  constructionType: string;
}

interface Risk {
  category: string;
  activity: string;
  risk: string;
  mitigation: string;
  standard?: string;
}

const WEATHER_RISK_TABLE: Array<{
  condition: (weather: NonNullable<WeatherRisksParams['weatherData']>['current']) => boolean;
  risks: Risk[];
}> = [
  {
    condition: (weather) => (weather?.temp ?? Infinity) <= 5,
    risks: [
      {
        category: 'Cold/Freezing',
        activity: 'Concrete Pouring',
        risk: 'Slowed hydration, reduced strength development, freezing of water in the mix, cracking.',
        mitigation: 'Heated enclosures, insulated formwork, hot water mixing, temperature monitoring.',
        standard: 'BS 8500-1, BS EN 13670'
      }
    ]
  },
  {
    condition: (weather) => (weather?.temp ?? -Infinity) >= 25,
    risks: [
      {
        category: 'Hot/Sunny',
        activity: 'Concrete Pouring',
        risk: 'Rapid drying, increased shrinkage, cracking, reduced strength.',
        mitigation: 'Use cooler water, damp hessian covering, shading, slower setting cement.',
        standard: 'BS 8500-2'
      }
    ]
  },
  {
    condition: (weather) => (weather?.windSpeed ?? 0) >= 10,
    risks: [
      {
        category: 'Wind',
        activity: 'Crane Operations',
        risk: 'Loss of control, collisions.',
        mitigation: 'Suspend operations, secure crane, lower the jib/boom.',
        standard: 'BS 7121'
      }
    ]
  },
  {
    condition: (weather) => weather?.description.toLowerCase().includes('rain') ?? false,
    risks: [
      {
        category: 'Wet/Rain',
        activity: 'External Works',
        risk: 'Reduced visibility, slippery surfaces.',
        mitigation: 'Postpone non-essential external work, ensure proper drainage.',
        standard: 'HSE Guidelines'
      }
    ]
  }
];

export function useWeatherRisks({ weatherData, constructionType }: WeatherRisksParams) {
  return useQuery({
    queryKey: ['weatherRisks', weatherData?.current?.temp, weatherData?.current?.windSpeed, constructionType],
    queryFn: () => {
      if (!weatherData?.current) return [];

      return WEATHER_RISK_TABLE
        .filter(category => category.condition(weatherData.current))
        .flatMap(category => category.risks);
    },
    enabled: !!weatherData?.current,
  });
}