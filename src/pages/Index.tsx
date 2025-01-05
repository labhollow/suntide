import React from "react";
import TideChart from "@/components/TideChart";
import TideTable from "@/components/TideTable";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addHours, startOfToday, addDays, addMinutes } from "date-fns";

const Index = () => {
  const [location, setLocation] = React.useState<{name: string, lat: number, lng: number} | null>(null);

  React.useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Generate realistic tide times based on lunar cycle (approximately 12.4 hours between high tides)
  const generateTideData = (startDate: Date, days: number) => {
    const tidesPerDay = [];
    const LUNAR_CYCLE_HOURS = 12.4; // Average time between high tides
    
    for (let day = 0; day < days; day++) {
      const dayStart = addDays(startDate, day);
      
      // Calculate first high tide of the day (varies by location)
      const baseOffset = location ? 
        (location.lng / 360) * 24 * 60 : // Adjust base time by longitude
        0;
      
      // Generate two high tides and two low tides for the day
      for (let cycle = 0; cycle < 2; cycle++) {
        const cycleStart = addMinutes(dayStart, baseOffset + (cycle * LUNAR_CYCLE_HOURS * 60));
        
        // High tide
        const highTideTime = cycleStart.toISOString();
        const baseHeight = location ? 
          (2 + Math.cos(Math.abs(location.lat) * (Math.PI / 180)) * 0.5) : 
          2;
        
        tidesPerDay.push({
          time: highTideTime,
          height: baseHeight + (Math.random() * 0.2),
          type: "high" as const
        });
        
        // Low tide (approximately 6.2 hours after high tide)
        const lowTideTime = addHours(cycleStart, 6.2).toISOString();
        tidesPerDay.push({
          time: lowTideTime,
          height: Math.max(0.2, baseHeight - 1.5 + (Math.random() * 0.2)),
          type: "low" as const
        });
      }
    }
    
    // Sort all tides by time
    return tidesPerDay.sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );
  };

  const today = startOfToday();
  const mockDailyTideData = generateTideData(today, 1);
  const mockWeeklyTideData = generateTideData(today, 7);
  const mockMonthlyTideData = generateTideData(today, 30);

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