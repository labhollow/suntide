import SunCalc from "suncalc";
import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';

const getLocalTime = (utcDate: Date): Date => {
    // Convert UTC date to local time using the user's timezone
    return toZonedTime(utcDate, Intl.DateTimeFormat().resolvedOptions().timeZone);
};

export const getSunriseSunset = (latitude: number, longitude: number, date: Date = new Date()) => {
    console.log('Function getSunriseSunset called with latitude:', latitude, 'and longitude:', longitude);
    const times = SunCalc.getTimes(date, latitude, longitude);
    console.log('UTC Sunrise:', times.sunrise);
    console.log('UTC Sunset:', times.sunset);

    const localSunrise = getLocalTime(times.sunrise);
    const localSunset = getLocalTime(times.sunset);

    console.log('Local Sunrise:', localSunrise);
    console.log('Local Sunset:', localSunset);
    return {
        sunrise: localSunrise.toISOString(),
        sunset: localSunset.toISOString(),
    };
};

export const getMoonriseMoonset = (latitude: number, longitude: number, date: Date = new Date()) => {
    const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
    
    // SunCalc sometimes returns no moonrise/moonset if it doesn't occur on the given day
    const localMoonrise = moonTimes.rise ? getLocalTime(moonTimes.rise) : null;
    const localMoonset = moonTimes.set ? getLocalTime(moonTimes.set) : null;
    
    // Get moon illumination (phase)
    const moonIllumination = SunCalc.getMoonIllumination(date);
    
    return {
        moonrise: localMoonrise ? localMoonrise.toISOString() : null,
        moonset: localMoonset ? localMoonset.toISOString() : null,
        phase: getMoonPhaseName(moonIllumination.phase),
        illumination: Math.round(moonIllumination.fraction * 100) // percentage
    };
};

// Helper function to convert moon phase value to a readable name
export const getMoonPhaseName = (phase: number): string => {
    // Moon phase value from SunCalc ranges from 0 to 1
    // 0 and 1: New Moon
    // 0.25: First Quarter
    // 0.5: Full Moon
    // 0.75: Last Quarter
    
    if (phase < 0.03 || phase >= 0.97) return "New Moon";
    if (phase < 0.22) return "Waxing Crescent";
    if (phase < 0.28) return "First Quarter";
    if (phase < 0.47) return "Waxing Gibbous";
    if (phase < 0.53) return "Full Moon";
    if (phase < 0.72) return "Waning Gibbous";
    if (phase < 0.78) return "Last Quarter";
    if (phase < 0.97) return "Waning Crescent";
    
    return "Unknown";
};

export const calculateSunriseSunsetTimes = (latitude: number, longitude: number) => {
    const today = new Date();
    
    const todayTimes = SunCalc.getTimes(today, latitude, longitude);
    const todayRiseSet = {
        sunrise: getLocalTime(todayTimes.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: getLocalTime(todayTimes.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const thisWeekRiseSet = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const times = SunCalc.getTimes(date, latitude, longitude);
        return {
            date: date.toISOString(),
            sunrise: getLocalTime(times.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: getLocalTime(times.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    });

    const thisMonthRiseSet = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const times = SunCalc.getTimes(date, latitude, longitude);
        return {
            date: date.toISOString(),
            sunrise: getLocalTime(times.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: getLocalTime(times.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    });

    return {
        todayRiseSet,
        thisWeekRiseSet,
        thisMonthRiseSet,
    };
};
