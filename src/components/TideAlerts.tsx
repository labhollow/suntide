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
    // Initialize from localStorage, default to false if not set
    const saved = localStorage.getItem("alertsEnabled");
    return saved ? JSON.parse(saved) : false;
  });
  const [duration, setDuration] = useState("2"); // Default 2 hours
  const { toast, dismiss } = useToast();
  const initialLoadRef = useRef(true);

  // Save alerts state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("alertsEnabled", JSON.stringify(alertsEnabled));
  }, [alertsEnabled]);

  // Show alert on initial load and when alerts are toggled
  useEffect(() => {
    // Only show alerts if there are upcoming alerts
    if (upcomingAlerts.length === 0) return;

    // Show alert if it's enabled and either:
    // 1. It's the initial load and alerts are enabled
    // 2. The alerts were just toggled on
    if (alertsEnabled && (initialLoadRef.current || !initialLoadRef.current)) {
      // Clear any existing toasts
      dismiss();
      
      // Get the closest upcoming alert
      const closestAlert = upcomingAlerts[0];
      
      // Show the closest alert
      toast({
        title: "Upcoming Low Tide Alert",
        description: `Low tide on ${closestAlert.date} at ${closestAlert.time} coincides with ${closestAlert.type}`,
        duration: 5000,
      });
    }

    // After initial load, set the ref to false
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
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