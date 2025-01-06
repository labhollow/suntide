import React from "react";
import TideChart from "@/components/TideChart";
import TideTable from "@/components/TideTable";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addHours, startOfToday, addDays, addMinutes, format } from "date-fns";
import SunCalc from "suncalc";
import { Card } from "@/components/ui/card";
import { Sun, Sunrise, Sunset, Moon } from "lucide-react";

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

  const getSunTimes = (date: Date) => {
    if (!location) return null;
    const times = SunCalc.getTimes(date, location.lat, location.lng);
    return {
      sunrise: format(times.sunrise, 'h:mm aa'),
      sunset: format(times.sunset, 'h:mm aa')
    };
  };

  // Calculate low tides near sunrise/sunset
  const getLowTidesNearSunriseSunset = () => {
    if (!location) return [];
    
    const allTides = generateTideData(today, 30);
    const nearSunriseSunsetTides = allTides.filter(tide => {
      if (tide.type !== 'low') return false;
      
      const tideDate = new Date(tide.time);
      const times = SunCalc.getTimes(tideDate, location.lat, location.lng);
      const sunrise = times.sunrise;
      const sunset = times.sunset;
      
      const hoursFromSunrise = Math.abs(tideDate.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
      const hoursFromSunset = Math.abs(tideDate.getTime() - sunset.getTime()) / (1000 * 60 * 60);
      
      return hoursFromSunrise <= 2 || hoursFromSunset <= 2;
    });
    
    return nearSunriseSunsetTides;
  };

  const sunTimes = getSunTimes(today);

  const SunTimesDisplay = ({ date }: { date: Date }) => {
    const times = getSunTimes(date);
    if (!times) return null;

    return (
      <div className="flex gap-6 justify-center my-4">
        <Card className="p-3 bg-tide-sunrise/10 flex items-center gap-2 text-tide-sunrise">
          <Sunrise className="h-5 w-5" />
          <span>Sunrise: {times.sunrise}</span>
        </Card>
        <Card className="p-3 bg-tide-sunset/10 flex items-center gap-2 text-tide-sunset">
          <Sunset className="h-5 w-5" />
          <span>Sunset: {times.sunset}</span>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-tide-blue text-center mb-8 animate-wave">
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
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="daily">Today</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="sunrise-sunset">Near Sunrise/Sunset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            {location && <SunTimesDisplay date={today} />}
            <TideChart data={mockDailyTideData} period="daily" />
          </TabsContent>
          
          <TabsContent value="weekly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Weekly Tide Times</h2>
              {location && <SunTimesDisplay date={today} />}
              <TideTable data={mockWeeklyTideData} period="weekly" />
            </div>
          </TabsContent>
          
          <TabsContent value="monthly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Monthly Tide Times</h2>
              {location && <SunTimesDisplay date={today} />}
              <TideTable data={mockMonthlyTideData} period="monthly" />
            </div>
          </TabsContent>
          
          <TabsContent value="sunrise-sunset">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Low Tides Near Sunrise/Sunset</h2>
              {location ? (
                <>
                  <SunTimesDisplay date={today} />
                  <TideTable 
                    data={getLowTidesNearSunriseSunset()} 
                    period="monthly" 
                  />
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Please select a location to see low tides near sunrise/sunset
                </div>
              )}
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