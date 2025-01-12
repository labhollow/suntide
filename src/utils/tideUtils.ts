import { addDays, parse, format, parseISO } from "date-fns";
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

export const metersToFeet = (meters: number): number => {
  return meters * 3.28084;
};

export const isWithinThreeHours = (time1: string, time2: string): boolean => {
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    if (period === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60;
    }
    if (period === 'AM' && hours === 12) {
      totalMinutes -= 12 * 60;
    }
    
    return totalMinutes;
  };

  const time1Minutes = parseTime(time1);
  const time2Minutes = parseTime(time2);
  const diffMinutes = Math.abs(time1Minutes - time2Minutes);
  return diffMinutes <= 180;
};

export const enrichTideDataWithSunriseSunset = (tideData: TideData[], location: Location): TideData[] => {
  return tideData.map(tide => {
    const tideDate = parseISO(tide.t);
    const { sunrise, sunset } = getSunriseSunset(location.lat, location.lng, tideDate);
    
    const sunriseTime = format(parseISO(sunrise), 'hh:mm a');
    const sunsetTime = format(parseISO(sunset), 'hh:mm a');
    const tideTime = format(tideDate, 'hh:mm a');
    
    const isNearSunriseOrSunset = tide.type === "L" && (
      isWithinThreeHours(tideTime, sunriseTime) ||
      isWithinThreeHours(tideTime, sunsetTime)
    );

    return {
      ...tide,
      sunrise: sunriseTime,
      sunset: sunsetTime,
      isNearSunriseOrSunset
    };
  });
};

export const getUpcomingAlerts = (tideData: TideData[]): Array<{date: string; time: string; type: string}> => {
  return tideData
    .filter(tide => tide.type === "L" && tide.isNearSunriseOrSunset)
    .map(tide => {
      const tideDate = parseISO(tide.t);
      const tideTime = format(tideDate, 'hh:mm a');
      const isNearSunrise = tide.sunrise && isWithinThreeHours(tideTime, tide.sunrise);
      
      return {
        date: format(tideDate, 'MMM dd, yyyy'),
        time: tideTime,
        type: isNearSunrise ? "sunrise" : "sunset"
      };
    });
};

export const getLowTidesNearSunriseSunset = (today: Date, location: Location): TideData[] => {
  if (!location) return [];
  
  const endDate = addDays(today, 30);
  const allTides: TideData[] = [];
  
  let currentDate = today;
  while (currentDate <= endDate) {
    const { sunrise, sunset } = getSunriseSunset(location.lat, location.lng, currentDate);
    
    // Generate two low tides per day
    const lowTide1 = {
      t: addDays(currentDate, 0).toISOString(),
      v: (Math.random() * 2).toFixed(2),
      type: "L",
      sunrise: format(parseISO(sunrise), 'hh:mm a'),
      sunset: format(parseISO(sunset), 'hh:mm a')
    };
    
    const lowTide2 = {
      t: addDays(currentDate, 0.5).toISOString(),
      v: (Math.random() * 2).toFixed(2),
      type: "L",
      sunrise: format(parseISO(sunrise), 'hh:mm a'),
      sunset: format(parseISO(sunset), 'hh:mm a')
    };
    
    allTides.push(lowTide1, lowTide2);
    currentDate = addDays(currentDate, 1);
  }
  
  return enrichTideDataWithSunriseSunset(allTides, location)
    .filter(tide => tide.isNearSunriseOrSunset);
};