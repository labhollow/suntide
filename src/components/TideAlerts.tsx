import React, { useEffect } from "react";
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
  const [alertsEnabled, setAlertsEnabled] = React.useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only run this effect when alerts are first enabled
    if (alertsEnabled) {
      const alertShown = sessionStorage.getItem('tideAlertShown');
      
      if (!alertShown && upcomingAlerts.length > 0) {
        const today = new Date();
        const closestAlert = upcomingAlerts
          .map(alert => ({
            ...alert,
            fullDate: parseISO(`${alert.date} ${alert.time}`)
          }))
          .filter(alert => isAfter(alert.fullDate, today))
          .sort((a, b) => 
            isBefore(a.fullDate, b.fullDate) ? -1 : 1
          )[0];

        if (closestAlert) {
          // Set the flag before showing the toast to prevent race conditions
          sessionStorage.setItem('tideAlertShown', 'true');
          
          toast({
            title: "Upcoming Low Tide Near Sunrise/Sunset",
            description: `Low tide on ${closestAlert.date} at ${closestAlert.time} coincides with ${closestAlert.type}`,
          });
        }
      }
    }
  }, [alertsEnabled]); // Only depend on alertsEnabled

  const toggleAlerts = () => {
    setAlertsEnabled(!alertsEnabled);
    if (!alertsEnabled) {
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