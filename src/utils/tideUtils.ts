import { addDays } from "date-fns";
import { getSunriseSunset } from "./sunUtils";

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

export const generateTideData = (location: Location | null): TideData[] => {
  if (!location) return [];
  
  const tidesPerDay = [];
  const LUNAR_CYCLE_HOURS = 12.4;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const { sunrise, sunset } = getSunriseSunset(location.lat, location.lng, date);
    
    const baseOffset = (location.lng / 360) * 24 * 60;
    
    for (let cycle = 0; cycle < 2; cycle++) {
      const cycleStart = new Date(date.getTime() + baseOffset + (cycle * LUNAR_CYCLE_HOURS * 60 * 60 * 1000));
      
      const baseHeight = 1.2 + Math.cos(Math.abs(location.lat) * (Math.PI / 180)) * 0.3;
      
      // High tide
      tidesPerDay.push({
        t: cycleStart.toISOString(),
        v: (baseHeight + (Math.random() * 0.1)).toFixed(2),
        type: "high",
        sunrise,
        sunset
      });
      
      // Low tide (6.2 hours after high tide)
      const lowTideTime = new Date(cycleStart.getTime() + 6.2 * 60 * 60 * 1000);
      tidesPerDay.push({
        t: lowTideTime.toISOString(),
        v: Math.max(0.1, baseHeight - 0.9 + (Math.random() * 0.1)).toFixed(2),
        type: "low",
        sunrise,
        sunset
      });
    }
  }
  
  return tidesPerDay.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
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

export const getLowTidesNearSunriseSunset = (today: Date, location: Location | null): TideData[] => {
  if (!location) return [];
  const allTides = generateTideData(location);
  return allTides.filter(tide => tide.type === 'low' && tide.isNearSunriseOrSunset);
};