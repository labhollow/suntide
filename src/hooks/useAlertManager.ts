import { useState, useEffect } from 'react';
import { parseISO, isAfter, isBefore } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const ALERT_SHOWN_KEY = 'tideAlertShown';
const ALERTS_ENABLED_KEY = 'tideAlertsEnabled';
const LAST_ALERT_TIME_KEY = 'lastAlertTime';

export const useAlertManager = (upcomingAlerts: Array<{
  date: string;
  time: string;
  type: string;
}>) => {
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem(ALERTS_ENABLED_KEY) === 'true';
  });
  
  const { toast } = useToast();

  // This effect runs only once when the hook is first initialized
  useEffect(() => {
    const checkAndShowAlert = () => {
      const lastAlertTime = localStorage.getItem(LAST_ALERT_TIME_KEY);
      const alertShown = localStorage.getItem(ALERT_SHOWN_KEY);
      const now = new Date().getTime();

      if (!alertShown || (now - Number(lastAlertTime)) > 3600000) {
        const today = new Date();
        const futureAlerts = upcomingAlerts
          .map(alert => ({
            ...alert,
            fullDate: parseISO(`${alert.date} ${alert.time}`)
          }))
          .filter(alert => isAfter(alert.fullDate, today))
          .sort((a, b) => isBefore(a.fullDate, b.fullDate) ? -1 : 1);

        const nextAlert = futureAlerts[0];
        if (nextAlert) {
          localStorage.setItem(LAST_ALERT_TIME_KEY, String(now));
          localStorage.setItem(ALERT_SHOWN_KEY, 'true');
          
          toast({
            title: "Upcoming Low Tide Near Sunrise/Sunset",
            description: `Next low tide on ${nextAlert.date} at ${nextAlert.time} coincides with ${nextAlert.type}`,
          });
        }
      }
    };

    // Only check for alerts if they're enabled
    if (alertsEnabled) {
      checkAndShowAlert();
    }
  }, []); // Empty dependency array ensures this only runs once

  const toggleAlerts = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    localStorage.setItem(ALERTS_ENABLED_KEY, String(newState));
    
    if (newState) {
      // Clear alert shown status when enabling alerts
      localStorage.removeItem(ALERT_SHOWN_KEY);
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    }
  };

  return { alertsEnabled, toggleAlerts };
};