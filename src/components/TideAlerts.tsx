import React from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

const TideAlerts = () => {
  const [alertsEnabled, setAlertsEnabled] = React.useState(false);

  const toggleAlerts = () => {
    setAlertsEnabled(!alertsEnabled);
    if (!alertsEnabled) {
      // Here we would typically request notification permissions
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