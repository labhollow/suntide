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
    if (alertsEnabled && upcomingAlerts.length > 0) {
      // Check if we've already shown an alert this session
      const alertShown = sessionStorage.getItem('tideAlertShown');
      if (!alertShown) {
        // Find the closest upcoming alert to today
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
          toast({
            title: "Upcoming Low Tide Near Sunrise/Sunset",
            description: `Low tide on ${closestAlert.date} at ${closestAlert.time} coincides with ${closestAlert.type}`,
          });
          
          // Mark that we've shown an alert this session
          sessionStorage.setItem('tideAlertShown', 'true');
        }
      }
    }
  }, [alertsEnabled, upcomingAlerts, toast]);

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