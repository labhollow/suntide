import React from "react";
import TideChart from "@/components/TideChart";
import TideTable from "@/components/TideTable";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addHours, startOfToday } from "date-fns";

const Index = () => {
  const [location, setLocation] = React.useState<{name: string, lat: number, lng: number} | null>(null);

  React.useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Generate mock tide data based on location and current date
  const generateTideData = (startDate: Date, count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const time = addHours(startDate, i * 6).toISOString();
      // Use location coordinates to affect tide height if available
      const baseHeight = location ? (Math.sin(location.lat / 10) + Math.cos(location.lng / 10)) : 1;
      const height = baseHeight + Math.sin(i) * 0.5;
      return {
        time,
        height,
        type: i % 2 === 0 ? ("high" as const) : ("low" as const),
      };
    });
  };

  const today = startOfToday();
  const mockDailyTideData = generateTideData(today, 4);
  const mockWeeklyTideData = generateTideData(today, 14);
  const mockMonthlyTideData = generateTideData(today, 60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-tide-blue text-center mb-8">
          Tide Tracker
        </h1>
        
        <LocationPicker onLocationUpdate={setLocation} />
        
        {location ? (
          <div className="text-sm text-muted-foreground text-center">
            Showing tide data for {location.name} ({location.lat.toFixed(2)}, {location.lng.toFixed(2)})
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center">
            Please set a location to see local tide data
          </div>
        )}
        
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