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
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    const saved = localStorage.getItem("alertsEnabled");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [duration, setDuration] = useState("2");
  const { toast, dismiss } = useToast();

  // Save alerts state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("alertsEnabled", JSON.stringify(alertsEnabled));
  }, [alertsEnabled]);

  // Show alerts on mount if enabled and when toggled
  useEffect(() => {
    // Only show alerts if they're enabled and we have upcoming alerts
    if (alertsEnabled && upcomingAlerts.length > 0) {
      const closestAlert = upcomingAlerts[0];
      
      // Clear any existing toasts before showing new one
      dismiss();
      
      toast({
        title: "Upcoming Low Tide Alert",
        description: `Low tide on ${closestAlert.date} at ${closestAlert.time} coincides with ${closestAlert.type}`,
        duration: 5000,
      });
    }
  }, [alertsEnabled]); // Only depend on alertsEnabled to prevent loops

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