import { addDays, addHours, addMinutes, startOfToday, differenceInHours, parse, format } from "date-fns";
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const timeZone = 'America/Los_Angeles';

export const isWithinThreeHours = (time1: string, time2: string): boolean => {
  try {
    const parseTime = (timeStr: string) => {
      const today = new Date();
      const is24Hour = timeStr.includes(':') && !timeStr.includes('AM') && !timeStr.includes('PM');
      
      let parsedDate;
      if (is24Hour) {
        parsedDate = parse(timeStr, 'HH:mm', today);
      } else {
        parsedDate = parse(timeStr, 'hh:mm a', today);
      }
      
      return fromZonedTime(parsedDate, timeZone);
    };

    const date1 = parseTime(time1);
    const date2 = parseTime(time2);
    
    const diffInHours = Math.abs(differenceInHours(date1, date2));
    return diffInHours <= 3;
  } catch (error) {
    console.error('Error comparing times:', error, { time1, time2 });
    return false;
  }
};

export const formatTime = (date: Date): string => {
  return format(date, "HH:mm");
};