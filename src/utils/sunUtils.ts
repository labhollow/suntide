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