import { addDays, parse, format, parseISO } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { getSunriseSunset, getMoonriseMoonset } from "./sunUtils";
import { isWithinHours } from "./dateUtils";

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
  moonrise?: string | null;
  moonset?: string | null;
  moonPhase?: string;
  moonIllumination?: number;
  isNearSunriseOrSunset?: boolean;
  isNearMoonriseOrMoonset?: boolean;
}

export const metersToFeet = (meters: number): number => {
  return meters * 3.28084;
};

export const enrichTideDataWithSunriseSunset = (
  tideData: TideData[], 
  location: Location,
  hours: number = 2
): TideData[] => {
  if (!tideData || tideData.length === 0) {
    console.log('No tide data available');
    return [];
  }

  return tideData.map(tide => {
    const tideDate = parseISO(tide.t);
    const { sunrise, sunset } = getSunriseSunset(location.lat, location.lng, tideDate);
    const { moonrise, moonset, phase, illumination } = getMoonriseMoonset(location.lat, location.lng, tideDate);
    
    const sunriseTime = format(parseISO(sunrise), 'hh:mm a');
    const sunsetTime = format(parseISO(sunset), 'hh:mm a');
    const tideTime = format(tideDate, 'hh:mm a');

    // Format moonrise/moonset if available
    const moonriseTime = moonrise ? format(parseISO(moonrise), 'hh:mm a') : null;
    const moonsetTime = moonset ? format(parseISO(moonset), 'hh:mm a') : null;

    const nearSunrise = isWithinHours(tideTime, sunriseTime, hours);
    const nearSunset = isWithinHours(tideTime, sunsetTime, hours);
    const isNearSunriseOrSunset = nearSunrise || nearSunset;

    // Check if tide is near moonrise or moonset
    const nearMoonrise = moonriseTime ? isWithinHours(tideTime, moonriseTime, hours) : false;
    const nearMoonset = moonsetTime ? isWithinHours(tideTime, moonsetTime, hours) : false;
    const isNearMoonriseOrMoonset = nearMoonrise || nearMoonset;

    return {
      ...tide,
      sunrise: sunriseTime,
      sunset: sunsetTime,
      moonrise: moonriseTime,
      moonset: moonsetTime,
      moonPhase: phase,
      moonIllumination: illumination,
      isNearSunriseOrSunset,
      isNearMoonriseOrMoonset
    };
  });
};

export const getUpcomingAlerts = (
  tideData: TideData[],
  hours: number = 2
): Array<{date: string; time: string; type: string}> => {
  if (!tideData || tideData.length === 0) {
    return [];
  }

  return tideData
    .filter(tide => tide.type === "L" && (tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset))
    .map(tide => {
      const tideDate = parseISO(tide.t);
      const tideTime = format(tideDate, 'hh:mm a');
      const isNearSunrise = isWithinHours(tideTime, tide.sunrise || '', hours);
      const isNearMoonrise = tide.moonrise ? isWithinHours(tideTime, tide.moonrise, hours) : false;
      
      let type = "sunset"; // default
      if (isNearSunrise) type = "sunrise";
      else if (isNearMoonrise) type = "moonrise";
      else if (tide.isNearMoonriseOrMoonset) type = "moonset";
      
      return {
        date: format(tideDate, 'MMM dd, yyyy'),
        time: tideTime,
        type
      };
    });
};

export const getLowTidesNearSunriseSunset = (tideData: TideData[]): TideData[] => {
  return tideData.filter(tide => tide.type === "L" && tide.isNearSunriseOrSunset);
};

export const getTideAndSunriseSunsetData = (tideData: TideData[], location: Location) => {
  return enrichTideDataWithSunriseSunset(tideData, location);
};
