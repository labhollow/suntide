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
  const [alertsEnabled, setAlertsEnabled] = React.useState(false);
  const { toast } = useToast();

  const toggleAlerts = () => {
    const newState = !alertsEnabled;
    setAlertsEnabled(newState);
    
    if (newState) {
      const hasShownAlert = localStorage.getItem('tideAlertShown_v2') === 'true';
      
      if (!hasShownAlert && upcomingAlerts.length > 0) {
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
          localStorage.setItem('tideAlertShown_v2', 'true');
          
          toast({
            title: "Upcoming Low Tide Near Sunrise/Sunset",
            description: `Low tide on ${closestAlert.date} at ${closestAlert.time} coincides with ${closestAlert.type}`,
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