import { addDays, addHours, addMinutes, startOfToday } from "date-fns";
import SunCalc from "suncalc";

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface TideData {
  time: string;
  height: number;
  type: "high" | "low";
  sunrise?: string;
  sunset?: string;
}

export const generateTideData = (
  startDate: Date,
  days: number,
  location: Location | null
): TideData[] => {
  const tidesPerDay = [];
  const LUNAR_CYCLE_HOURS = 12.4; // Average time between high tides

  for (let day = 0; day < days; day++) {
    const dayStart = addDays(startDate, day);
    
    // Get sun times for the day if location is available
    let sunTimes = null;
    if (location) {
      const times = SunCalc.getTimes(dayStart, location.lat, location.lng);
      sunTimes = {
        sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    
    // Calculate base offset by longitude
    const baseOffset = location ? 
      (location.lng / 360) * 24 * 60 : // Adjust base time by longitude
      0;
    
    // Generate two high tides and two low tides for the day
    for (let cycle = 0; cycle < 2; cycle++) {
      const cycleStart = addMinutes(dayStart, baseOffset + (cycle * LUNAR_CYCLE_HOURS * 60));
      
      // High tide
      const highTideTime = cycleStart.toISOString();
      const baseHeight = location ? 
        (2 + Math.cos(Math.abs(location.lat) * (Math.PI / 180)) * 0.5) : 
        2;
      
      tidesPerDay.push({
        time: highTideTime,
        height: baseHeight + (Math.random() * 0.2),
        type: "high" as const,
        sunrise: sunTimes?.sunrise,
        sunset: sunTimes?.sunset
      });
      
      // Low tide (approximately 6.2 hours after high tide)
      const lowTideTime = addHours(cycleStart, 6.2).toISOString();
      tidesPerDay.push({
        time: lowTideTime,
        height: Math.max(0.2, baseHeight - 1.5 + (Math.random() * 0.2)),
        type: "low" as const,
        sunrise: sunTimes?.sunrise,
        sunset: sunTimes?.sunset
      });
    }
  }
  
  // Sort all tides by time
  return tidesPerDay.sort((a, b) => 
    new Date(a.time).getTime() - new Date(b.time).getTime()
  );
};

export const getLowTidesNearSunriseSunset = (
  startDate: Date,
  location: Location | null
): TideData[] => {
  if (!location) return [];
  
  const allTides = generateTideData(startDate, 30, location);
  const nearSunriseSunsetTides = allTides.filter(tide => {
    if (tide.type !== 'low') return false;
    
    const tideDate = new Date(tide.time);
    const times = SunCalc.getTimes(tideDate, location.lat, location.lng);
    const sunrise = times.sunrise;
    const sunset = times.sunset;
    
    const hoursFromSunrise = Math.abs(tideDate.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
    const hoursFromSunset = Math.abs(tideDate.getTime() - sunset.getTime()) / (1000 * 60 * 60);
    
    return hoursFromSunrise <= 2 || hoursFromSunset <= 2;
  });
  
  return nearSunriseSunsetTides;
};