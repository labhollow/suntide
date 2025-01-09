import { addDays, addHours, addMinutes, startOfToday, differenceInHours } from "date-fns";
import SunCalc from "suncalc";

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface TideData {
  t: string;
  v: string;
  type: string;
  time?: string;
  height?: number;
  sunrise?: string;
  sunset?: string;
  isNearSunriseOrSunset?: boolean;
}

export const metersToFeet = (meters: number): number => {
  return meters * 3.28084;
};

export const generateTideData = (
  startDate: Date,
  days: number,
  location: Location | null
): TideData[] => {
  const tidesPerDay = [];
  const LUNAR_CYCLE_HOURS = 12.4;

  for (let day = 0; day < days; day++) {
    const dayStart = addDays(startDate, day);
    
    let sunTimes = null;
    if (location) {
      const times = SunCalc.getTimes(dayStart, location.lat, location.lng);
      sunTimes = {
        sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunriseDate: times.sunrise,
        sunsetDate: times.sunset
      };
    }
    
    const baseOffset = location ? 
      (location.lng / 360) * 24 * 60 : 
      0;
    
    for (let cycle = 0; cycle < 2; cycle++) {
      const cycleStart = addMinutes(dayStart, baseOffset + (cycle * LUNAR_CYCLE_HOURS * 60));
      
      // More realistic tide heights based on location and moon phase
      const baseHeight = location ? 
        (1.2 + Math.cos(Math.abs(location.lat) * (Math.PI / 180)) * 0.3) : 
        1.2;
      
      // High tide
      const highTideTime = cycleStart;
      const isHighTideNearSunrise = sunTimes && Math.abs(differenceInHours(highTideTime, sunTimes.sunriseDate)) <= 2;
      const isHighTideNearSunset = sunTimes && Math.abs(differenceInHours(highTideTime, sunTimes.sunsetDate)) <= 2;
      
      tidesPerDay.push({
        t: highTideTime.toISOString(),
        v: (baseHeight + (Math.random() * 0.1)).toFixed(2),
        time: highTideTime.toISOString(),
        height: baseHeight + (Math.random() * 0.1),
        type: "high" as const,
        sunrise: sunTimes?.sunrise,
        sunset: sunTimes?.sunset,
        isNearSunriseOrSunset: isHighTideNearSunrise || isHighTideNearSunset
      });
      
      // Low tide
      const lowTideTime = addHours(cycleStart, 6.2);
      const isLowTideNearSunrise = sunTimes && Math.abs(differenceInHours(lowTideTime, sunTimes.sunriseDate)) <= 2;
      const isLowTideNearSunset = sunTimes && Math.abs(differenceInHours(lowTideTime, sunTimes.sunsetDate)) <= 2;
      
      tidesPerDay.push({
        t: lowTideTime.toISOString(),
        v: Math.max(0.1, baseHeight - 0.9 + (Math.random() * 0.1)).toFixed(2),
        time: lowTideTime.toISOString(),
        height: Math.max(0.1, baseHeight - 0.9 + (Math.random() * 0.1)),
        type: "low" as const,
        sunrise: sunTimes?.sunrise,
        sunset: sunTimes?.sunset,
        isNearSunriseOrSunset: isLowTideNearSunrise || isLowTideNearSunset
      });
    }
  }
  
  return tidesPerDay.sort((a, b) => 
    new Date(a.t).getTime() - new Date(b.t).getTime()
  );
};

export const getUpcomingAlerts = (tideData: TideData[]): Array<{date: string; time: string; type: string}> => {
  return tideData
    .filter(tide => tide.type === "low" && tide.isNearSunriseOrSunset)
    .map(tide => ({
      date: new Date(tide.t).toLocaleDateString(),
      time: new Date(tide.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: new Date(tide.t).getHours() < 12 ? "sunrise" : "sunset"
    }));
};

export const getLowTidesNearSunriseSunset = (
  startDate: Date,
  location: Location | null
): TideData[] => {
  if (!location) return [];
  
  const allTides = generateTideData(startDate, 30, location);
  return allTides.filter(tide => 
    tide.type === 'low' && tide.isNearSunriseOrSunset
  );
};
