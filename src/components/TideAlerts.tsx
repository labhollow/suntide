import React from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TideAlertsProps {
  upcomingAlerts: Array<{
    date: string;
    time: string;
    type: string;
  }>;
}

const TideAlerts = ({ upcomingAlerts }: TideAlertsProps) => {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [duration, setDuration] = useState("2"); // Default 2 hours
  const { toast } = useToast();

  useEffect(() => {
    if (alertsEnabled && upcomingAlerts.length > 0) {
      // Clear any existing toasts
      toast.dismiss();
      
      // Show new alerts
      upcomingAlerts.forEach(alert => {
        toast({
          title: "Upcoming Low Tide Alert",
          description: `Low tide on ${alert.date} at ${alert.time} coincides with ${alert.type}`,
          duration: 5000,
        });
      });
    }
  }, [alertsEnabled]); // Only trigger when alerts are enabled/disabled

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="text-tide-blue" />
          <span>Low Tide + Sunrise/Sunset Alerts</span>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={duration}
            onValueChange={setDuration}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alert window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour before/after</SelectItem>
              <SelectItem value="2">2 hours before/after</SelectItem>
              <SelectItem value="3">3 hours before/after</SelectItem>
            </SelectContent>
          </Select>
          <Switch 
            checked={alertsEnabled} 
            onCheckedChange={setAlertsEnabled}
          />
        </div>
      </div>
    </Card>
  );
};

export default TideAlerts;