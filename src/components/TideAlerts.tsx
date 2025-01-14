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

const TideAlerts = ({ upcomingAlerts }: TideAlertsProps) => {
  const [alertsEnabled, setAlertsEnabled] = React.useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('tideAlertsEnabled') === 'true';
  });
  const { toast } = useToast();

  const toggleAlerts = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    localStorage.setItem('tideAlertsEnabled', String(newState));
    
    // Only show alerts when explicitly enabling
    if (newState) {
      const lastAlertTime = localStorage.getItem('lastAlertTime');
      const now = new Date().getTime();
      
      // Only show alert if we haven't shown one in the last hour
      if (!lastAlertTime || (now - Number(lastAlertTime)) > 3600000) {
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
          localStorage.setItem('lastAlertTime', String(now));
          
          toast({
            title: "Upcoming Low Tide Near Sunrise/Sunset",
            description: `Next low tide on ${nextAlert.date} at ${nextAlert.time} coincides with ${nextAlert.type}`,
          });
        }
      }

      Notification.requestPermission();
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