import React from "react";
import TideChart from "@/components/TideChart";
import TideTable from "@/components/TideTable";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfToday } from "date-fns";
import { getLowTidesNearSunriseSunset, getUpcomingAlerts } from "@/utils/tideUtils";
import type { Location } from "@/utils/tideUtils";
import { fetchTideData, NOAA_STATIONS } from "@/utils/noaaApi";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [location, setLocation] = React.useState<Location | null>(null);
  const today = startOfToday();

  React.useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Fetch tide data from NOAA API
  const { data: tideData, isLoading, error } = useQuery({
    queryKey: ['tides', location?.name],
    queryFn: async () => {
      if (!location?.name) return null;
      const locationKey = location.name.toLowerCase().replace(/\s+/g, '-');
      const station = NOAA_STATIONS[locationKey];
      if (!station) {
        throw new Error('Location not supported');
      }
      return fetchTideData(station.id, today, 30);
    },
    enabled: !!location?.name
  });

  const dailyTideData = tideData?.slice(0, 4) || [];
  const weeklyTideData = tideData?.slice(0, 14) || [];
  const monthlyTideData = tideData || [];
  const upcomingAlerts = getUpcomingAlerts(monthlyTideData);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load tide data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

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

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-tide-blue" />
          </div>
        ) : (
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="daily">Today</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="sunrise-sunset">Near Sunrise/Sunset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily">
              <TideChart data={dailyTideData} period="daily" />
              <TideTable data={dailyTideData} period="daily" />
            </TabsContent>
            
            <TabsContent value="weekly">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-tide-blue">Weekly Tide Times</h2>
                <TideTable data={weeklyTideData} period="weekly" />
              </div>
            </TabsContent>
            
            <TabsContent value="monthly">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-tide-blue">Monthly Tide Times</h2>
                <TideTable data={monthlyTideData} period="monthly" />
              </div>
            </TabsContent>
            
            <TabsContent value="sunrise-sunset">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-tide-blue">Low Tides Near Sunrise/Sunset</h2>
                {location ? (
                  <TideTable 
                    data={getLowTidesNearSunriseSunset(today, location)} 
                    period="monthly" 
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    Please select a location to see low tides near sunrise/sunset
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6">
          <TideAlerts upcomingAlerts={upcomingAlerts} />
        </div>
      </div>
    </div>
  );
};

export default Index;