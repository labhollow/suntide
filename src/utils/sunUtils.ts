import SunCalc from "suncalc";
import { format } from "date-fns";

export const getSunriseSunset = (latitude: number, longitude: number, date: Date = new Date()) => {
    const times = SunCalc.getTimes(date, latitude, longitude);
    return {
        sunrise: times.sunrise.toISOString(),
        sunset: times.sunset.toISOString(),
    };
};

export const calculateSunriseSunsetTimes = (latitude: number, longitude: number) => {
    const today = new Date();
    
    const todayTimes = SunCalc.getTimes(today, latitude, longitude);
    const todayRiseSet = {
        sunrise: todayTimes.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: todayTimes.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const thisWeekRiseSet = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const times = SunCalc.getTimes(date, latitude, longitude);
        return {
            date: date.toISOString(),
            sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    });

    const thisMonthRiseSet = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const times = SunCalc.getTimes(date, latitude, longitude);
        return {
            date: date.toISOString(),
            sunrise: times.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    });

    return {
        todayRiseSet,
        thisWeekRiseSet,
        thisMonthRiseSet,
    };
};