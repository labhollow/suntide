import React from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface TideAlertsProps {
  upcomingAlerts: Array<{
    date: string;
    time: string;
    type: string;
  }>;
}

const TideAlerts = ({ upcomingAlerts }: TideAlertsProps) => {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [duration, setDuration] = useState([2]); // Default 2 hours
  const { toast } = useToast();

  useEffect(() => {
    if (alertsEnabled && upcomingAlerts.length > 0) {
      upcomingAlerts.forEach(alert => {
        toast({
          title: "Upcoming Low Tide Alert",
          description: `Low tide on ${alert.date} at ${alert.time} coincides with ${alert.type}`,
          duration: 5000,
        });
      });
    }
  }, [alertsEnabled, upcomingAlerts, toast]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="text-tide-blue" />
          <span>Low Tide + Sunrise/Sunset Alerts</span>
        </div>
        <Switch 
          checked={alertsEnabled} 
          onCheckedChange={setAlertsEnabled}
        />
      </div>
      {alertsEnabled && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">
            Alert window: {duration[0]} hours before/after sunrise/sunset
          </label>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={1}
            max={3}
            step={1}
            className="w-full"
          />
        </div>
      )}
    </Card>
  );
};

export default TideAlerts;