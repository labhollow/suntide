import React from "react";
import TideChart from "@/components/TideChart";
import TideTable from "@/components/TideTable";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  // Mock data - in a real app, this would come from an API
  const mockDailyTideData = [
    { time: "2024-03-20T00:00:00", height: 1.2, type: "high" as const },
    { time: "2024-03-20T06:00:00", height: 0.3, type: "low" as const },
    { time: "2024-03-20T12:00:00", height: 1.4, type: "high" as const },
    { time: "2024-03-20T18:00:00", height: 0.2, type: "low" as const },
  ];

  const mockWeeklyTideData = Array.from({ length: 14 }, (_, i) => ({
    time: new Date(Date.now() + i * 12 * 3600 * 1000).toISOString(),
    height: 1 + Math.sin(i) * 0.5,
    type: i % 2 === 0 ? ("high" as const) : ("low" as const),
  }));

  const mockMonthlyTideData = Array.from({ length: 60 }, (_, i) => ({
    time: new Date(Date.now() + i * 12 * 3600 * 1000).toISOString(),
    height: 1 + Math.sin(i) * 0.5,
    type: i % 2 === 0 ? ("high" as const) : ("low" as const),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-tide-blue text-center mb-8">
          Tide Tracker
        </h1>
        
        <LocationPicker />
        
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <TideChart data={mockDailyTideData} period="daily" />
          </TabsContent>
          <TabsContent value="weekly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Weekly Tide Times</h2>
              <TideTable data={mockWeeklyTideData} period="weekly" />
            </div>
          </TabsContent>
          <TabsContent value="monthly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Monthly Tide Times</h2>
              <TideTable data={mockMonthlyTideData} period="monthly" />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <TideAlerts />
        </div>
      </div>
    </div>
  );
};

export default Index;