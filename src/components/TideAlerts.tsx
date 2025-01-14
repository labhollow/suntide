import React from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
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
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    const saved = localStorage.getItem("alertsEnabled");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [duration, setDuration] = useState("2");
  const { toast, dismiss } = useToast();
  const hasShownInitialAlert = useRef(false);

  // Function to show the closest alert
  const showClosestAlert = () => {
    if (upcomingAlerts && upcomingAlerts.length > 0) {
      const closestAlert = upcomingAlerts[0];
      dismiss();
      toast({
        title: "Upcoming Low Tide Alert",
        description: `Low tide on ${closestAlert.date} at ${closestAlert.time} coincides with ${closestAlert.type}`,
        duration: 5000,
      });
    }
  };

  // Save alerts state to localStorage
  useEffect(() => {
    localStorage.setItem("alertsEnabled", JSON.stringify(alertsEnabled));
  }, [alertsEnabled]);

  // Handle initial alert display and toggle
  useEffect(() => {
    if (alertsEnabled && upcomingAlerts && !hasShownInitialAlert.current) {
      showClosestAlert();
      hasShownInitialAlert.current = true;
    }
  }, [alertsEnabled, upcomingAlerts]);

  const handleAlertToggle = (checked: boolean) => {
    setAlertsEnabled(checked);
    if (checked) {
      showClosestAlert();
    }
  };

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
            onCheckedChange={handleAlertToggle}
          />
        </div>
      </div>
    </Card>
  );
};

export default TideAlerts;