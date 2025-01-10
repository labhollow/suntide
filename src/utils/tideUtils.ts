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

export const isWithinThreeHours = (time1: string, time2: string): boolean => {
  const [hours1, minutes1, period1] = time1.match(/(\d+):(\d+)\s*(AM|PM)/)?.slice(1) || [];
  const [hours2, minutes2, period2] = time2.match(/(\d+):(\d+)\s*(AM|PM)/)?.slice(1) || [];

  if (!hours1 || !hours2) return false;

  let hour1 = parseInt(hours1);
  let hour2 = parseInt(hours2);

  // Convert to 24-hour format
  if (period1 === 'PM' && hour1 !== 12) hour1 += 12;
  if (period1 === 'AM' && hour1 === 12) hour1 = 0;
  if (period2 === 'PM' && hour2 !== 12) hour2 += 12;
  if (period2 === 'AM' && hour2 === 12) hour2 = 0;

  const diff = Math.abs(hour1 - hour2 + (parseInt(minutes1) - parseInt(minutes2)) / 60);
  return diff <= 3;
};

export const generateTideData = (
  location: Location | null
): TideData[] => {
  const tidesPerDay = [];
  const LUNAR_CYCLE_HOURS = 12.4;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    console.log('Latitude:', location.lat, 'Longitude:', location.lng);
    const { sunrise, sunset } = getSunriseSunset(location.lat, location.lng, date);
    console.log('Sunrise:', sunrise, 'Sunset:', sunset);
    
    let sunTimes = null;
    if (location) {
      const times = SunCalc.getTimes(date, location.lat, location.lng);
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
      const cycleStart = addMinutes(date, baseOffset + (cycle * LUNAR_CYCLE_HOURS * 60));
      
      // More realistic tide heights based on location and moon phase
      const baseHeight = location ? 
        (1.2 + Math.cos(Math.abs(location.lat) * (Math.PI / 180)) * 0.3) : 
        1.2;
      
      // High tide
      const highTideTime = cycleStart;
      const isHighTideNearSunrise = sunTimes && Math.abs(differenceInHours(highTideTime, sunTimes.sunriseDate)) <= 3;
      const isHighTideNearSunset = sunTimes && Math.abs(differenceInHours(highTideTime, sunTimes.sunsetDate)) <= 3;
      
      tidesPerDay.push({
        t: highTideTime.toISOString(),
        v: (baseHeight + (Math.random() * 0.1)).toFixed(2),
        time: highTideTime.toISOString(),
        height: baseHeight + (Math.random() * 0.1),
        type: "high" as const,
        sunrise: sunrise,
        sunset: sunset,
        isNearSunriseOrSunset: isHighTideNearSunrise || isHighTideNearSunset
      });
      
      // Low tide
      const lowTideTime = addHours(cycleStart, 6.2);
      const isLowTideNearSunrise = sunTimes && Math.abs(differenceInHours(lowTideTime, sunTimes.sunriseDate)) <= 3;
      const isLowTideNearSunset = sunTimes && Math.abs(differenceInHours(lowTideTime, sunTimes.sunsetDate)) <= 3;
      
      tidesPerDay.push({
        t: lowTideTime.toISOString(),
        v: Math.max(0.1, baseHeight - 0.9 + (Math.random() * 0.1)).toFixed(2),
        time: lowTideTime.toISOString(),
        height: Math.max(0.1, baseHeight - 0.9 + (Math.random() * 0.1)),
        type: "low" as const,
        sunrise: sunrise,
        sunset: sunset,
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
  today: Date,
  location: Location | null
): TideData[] => {
  if (!location) return [];
  
  const allTides = generateTideData(location);
  return allTides.filter(tide => 
    tide.type === 'low' && tide.isNearSunriseOrSunset
  );
};

// Function to get sunrise and sunset times
export const getSunriseSunset = (latitude: number, longitude: number, date: Date = new Date()) => {
    const times = SunCalc.getTimes(date, latitude, longitude);
    return {
        sunrise: times.sunrise.toISOString(),
        sunset: times.sunset.toISOString(),
    };
};

export const calculateSunriseSunsetTimes = (latitude: number, longitude: number) => {
    const today = new Date();
    
    // Today's sunrise and sunset
    const todayTimes = SunCalc.getTimes(today, latitude, longitude);
    const todayRiseSet = {
        sunrise: todayTimes.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: todayTimes.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // This week's sunrise and sunset
    const thisWeekRiseSet = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const times = SunCalc.getTimes(date, latitude, longitude);
        thisWeekRiseSet.push({
            date: date.toISOString(),
            sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
    }

    // This month's sunrise and sunset
    const thisMonthRiseSet = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const times = SunCalc.getTimes(date, latitude, longitude);
        thisMonthRiseSet.push({
            date: date.toISOString(),
            sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
    }

    return {
        todayRiseSet,
        thisWeekRiseSet,
        thisMonthRiseSet,
    };
};
