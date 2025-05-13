
import { parse, format } from "date-fns";

export const isWithinHours = (time1: string, time2: string, hours: number): boolean => {
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
  
  // Handle cases where times cross midnight
  const diff1 = Math.abs(time1Minutes - time2Minutes);
  const diff2 = 1440 - diff1; // 1440 = minutes in a day
  const minDiff = Math.min(diff1, diff2);
  
  return minDiff <= (hours * 60); // Convert hours to minutes
};

export const formatTime = (date: Date): string => {
  return format(date, "hh:mm a");
};