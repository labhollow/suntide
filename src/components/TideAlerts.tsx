import React from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useAlertManager } from "@/hooks/useAlertManager";

interface TideAlertsProps {
  upcomingAlerts: Array<{
    date: string;
    time: string;
    type: string;
  }>;
}

const TideAlerts = ({ upcomingAlerts }: TideAlertsProps) => {
  const { alertsEnabled, toggleAlerts } = useAlertManager(upcomingAlerts);

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