import React from "react";
import TideChart from "@/components/TideChart";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  // Mock data - in a real app, this would come from an API
  const mockTideData = [
    { time: "00:00", height: 1.2, type: "high" as const },
    { time: "06:00", height: 0.3, type: "low" as const },
    { time: "12:00", height: 1.4, type: "high" as const },
    { time: "18:00", height: 0.2, type: "low" as const },
  ];

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
            <TideChart data={mockTideData} period="daily" />
          </TabsContent>
          <TabsContent value="weekly">
            <TideChart data={mockTideData} period="weekly" />
          </TabsContent>
          <TabsContent value="monthly">
            <TideChart data={mockTideData} period="monthly" />
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