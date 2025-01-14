import React from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { parseISO, isAfter, isBefore } from "date-fns";

interface TideAlertsProps {
  upcomingAlerts: Array<{
    date: string;
    time: string;
    type: string;
  }>;
}

const ALERT_SHOWN_KEY = 'tideAlertShown';
const ALERTS_ENABLED_KEY = 'tideAlertsEnabled';
const LAST_ALERT_TIME_KEY = 'lastAlertTime';

const TideAlerts = ({ upcomingAlerts }: TideAlertsProps) => {
  const [alertsEnabled, setAlertsEnabled] = React.useState(() => {
    return localStorage.getItem(ALERTS_ENABLED_KEY) === 'true';
  });
  const { toast } = useToast();
  const mounted = React.useRef(false);

  React.useEffect(() => {
    // Only run this effect once when the component mounts
    if (!mounted.current) {
      mounted.current = true;

      if (alertsEnabled) {
        const lastAlertTime = localStorage.getItem(LAST_ALERT_TIME_KEY);
        const alertShown = sessionStorage.getItem(ALERT_SHOWN_KEY);
        const now = new Date().getTime();

        // Only show alert if we haven't shown one in the last hour and not in this session
        if (!alertShown && (!lastAlertTime || (now - Number(lastAlertTime)) > 3600000)) {
          const today = new Date();
          const futureAlerts = upcomingAlerts
            .map(alert => ({
              ...alert,
              fullDate: parseISO(`${alert.date} ${alert.time}`)
            }))
            .filter(alert => isAfter(alert.fullDate, today))
            .sort((a, b) => 
              isBefore(a.fullDate, b.fullDate) ? -1 : 1
            );

          // Only show the next upcoming alert
          const nextAlert = futureAlerts[0];
          if (nextAlert) {
            localStorage.setItem(LAST_ALERT_TIME_KEY, String(now));
            sessionStorage.setItem(ALERT_SHOWN_KEY, 'true');
            
            toast({
              title: "Upcoming Low Tide Near Sunrise/Sunset",
              description: `Next low tide on ${nextAlert.date} at ${nextAlert.time} coincides with ${nextAlert.type}`,
            });
          }
        }
      }
    }
  }, [alertsEnabled, toast, upcomingAlerts]);

  const toggleAlerts = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    localStorage.setItem(ALERTS_ENABLED_KEY, String(newState));
    
    if (newState) {
      // Clear session storage when enabling alerts
      sessionStorage.removeItem(ALERT_SHOWN_KEY);
      // Request notification permissions
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    }
  };

  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell className="text-tide-blue" />
        <span>Low Tide + Sunrise/Sunset Alerts</span>
      </div>
      <Switch checked={alertsEnabled} onCheckedChange={toggleAlerts} />
    </Card>
  );
};

export default TideAlerts;