import React, { useEffect } from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
      upcomingAlerts.forEach(alert => {
        toast({
          title: "Upcoming Low Tide Near Sunrise/Sunset",
          description: `Low tide on ${alert.date} at ${alert.time} coincides with ${alert.type}`,
        });
      });
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