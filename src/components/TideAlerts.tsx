import React from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  
  const [duration, setDuration] = useState(() => {
    const saved = localStorage.getItem("alertDuration");
    return saved || "2";
  });

  const queryClient = useQueryClient();
  const { toast, dismiss } = useToast();

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

  useEffect(() => {
    localStorage.setItem("alertsEnabled", JSON.stringify(alertsEnabled));
    localStorage.setItem("alertDuration", duration);
  }, [alertsEnabled, duration]);

  useEffect(() => {
    if (alertsEnabled && upcomingAlerts?.length > 0) {
      showClosestAlert();
    }
  }, []); 

  const handleAlertToggle = (checked: boolean) => {
    setAlertsEnabled(checked);
    if (checked && upcomingAlerts?.length > 0) {
      showClosestAlert();
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    localStorage.setItem("alertDuration", value);
    
    // Force refetch of all related queries
    queryClient.refetchQueries({
      queryKey: ['tideData'],
      exact: false,
      type: 'active'
    });
    
    if (alertsEnabled && upcomingAlerts?.length > 0) {
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
            onValueChange={handleDurationChange}
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