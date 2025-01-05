import React from "react";
import TideChart from "@/components/TideChart";
import TideTable from "@/components/TideTable";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addHours, startOfToday, addDays } from "date-fns";

const Index = () => {
  const [location, setLocation] = React.useState<{name: string, lat: number, lng: number} | null>(null);

  React.useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Generate more realistic tide data based on location and lunar cycle simulation
  const generateTideData = (startDate: Date, count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const time = addHours(startDate, i * 6).toISOString();
      
      // Create more realistic tide heights based on location and lunar cycle
      const baseHeight = location ? (
        // Use latitude to affect average tide height (higher tides near equator)
        2 + Math.cos(Math.abs(location.lat) * (Math.PI / 180)) * 0.5 +
        // Add some variation based on longitude
        Math.sin(location.lng * (Math.PI / 180)) * 0.2
      ) : 2;

      // Simulate lunar cycle influence (approximately 12.4 hour cycle)
      const lunarInfluence = Math.sin((i * 6) / 12.4 * Math.PI);
      
      // Add small random variation
      const randomVariation = (Math.random() - 0.5) * 0.2;
      
      const height = Math.max(0, baseHeight + (lunarInfluence * 1.2) + randomVariation);

      return {
        time,
        height,
        type: lunarInfluence > 0 ? ("high" as const) : ("low" as const),
      };
    });
  };

  const today = startOfToday();
  const mockDailyTideData = generateTideData(today, 4);
  const mockWeeklyTideData = generateTideData(today, 28); // 4 times per day for 7 days
  const mockMonthlyTideData = generateTideData(today, 120); // 4 times per day for 30 days

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
            <TabsTrigger value="daily">Today</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
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