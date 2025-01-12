import { addDays, parse, format, parseISO } from "date-fns";
import { getSunriseSunset } from "./sunUtils";
import { isWithinThreeHours } from "./dateUtils";

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

let enrichTideDataWithSunriseSunsetCallCount = 0;

export const enrichTideDataWithSunriseSunset = (tideData: TideData[], location: Location): TideData[] => {
  enrichTideDataWithSunriseSunsetCallCount++;
  console.log('Function enrichTideDataWithSunriseSunset called', enrichTideDataWithSunriseSunsetCallCount, 'times with tideData length:', tideData.length);
  console.log('Location Latitude:', location.lat);
  console.log('Location Longitude:', location.lng);
  console.log('Location object:', location);

  if (tideData.length === 0) {
    console.log('No tide data available. Exiting function.');
    return []; // Exit if no tide data is available
  }

  return tideData.map(tide => {
    const tideDate = parseISO(tide.t);
    console.log('Tide Date:', tideDate);

    const { sunrise, sunset } = getSunriseSunset(location.lat, location.lng, tideDate);
    
    const sunriseTime = format(parseISO(sunrise), 'hh:mm a');
    const sunsetTime = format(parseISO(sunset), 'hh:mm a');
    const tideTime = format(tideDate, 'hh:mm a');
    
    console.log('Comparing Tide Time:', tideTime);
    console.log('Comparing Sunrise Time:', sunriseTime);
    console.log('Comparing Sunset Time:', sunsetTime);

    console.log('Tide Type:', tide.type);
    const nearSunrise = isWithinThreeHours(tideTime, sunriseTime);
    const nearSunset = isWithinThreeHours(tideTime, sunsetTime);
    console.log('Is Near Sunrise:', nearSunrise);
    console.log('Is Near Sunset:', nearSunset);

    const isNearSunriseOrSunset = false; // Temporarily set to false to prevent alert firing

    return {
      ...tide,
      sunrise: sunriseTime,
      sunset: sunsetTime,
      isNearSunriseOrSunset
    };
  });
};

export const getUpcomingAlerts = (tideData: TideData[]): Array<{date: string; time: string; type: string}> => {
  if (tideData.length === 0) {
    console.log('No tide data available. Exiting function.');
    return []; // Exit if no tide data is available
  }

  return tideData
    .filter(tide => tide.type === "L" && tide.isNearSunriseOrSunset)
    .map(tide => {
      const tideDate = parseISO(tide.t);
      const tideTime = format(tideDate, 'hh:mm a');
      const isNearSunrise = isWithinThreeHours(tideTime, tide.sunrise || '');
      
      return {
        date: format(tideDate, 'MMM dd, yyyy'),
        time: tideTime,
        type: isNearSunrise ? "sunrise" : "sunset"
      };
    });
};

export const getLowTidesNearSunriseSunset = (today: Date, location: Location): TideData[] => {
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
  
  if (allTides.length === 0) {
    console.log('No tide data available. Exiting function.');
    return []; // Exit if no tide data is available
  }

  const enrichedTides = enrichTideDataWithSunriseSunset(allTides, location);
  if (enrichedTides.length === 0) {
    console.log('No tide data available. Exiting function.');
    return []; // Exit if no tide data is available
  }

  return enrichedTides.filter(tide => tide.isNearSunriseOrSunset);
};