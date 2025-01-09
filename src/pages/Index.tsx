import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

const DEFAULT_LOCATION = {
  name: "San Francisco",
  lat: 37.7749,
  lng: -122.4194
};

const Index = () => {
  const [location, setLocation] = React.useState<Location | null>(null);
  const today = startOfToday();
  const [weeklyTideData, setWeeklyTideData] = useState([]);
  const [monthlyTideData, setMonthlyTideData] = useState([]);
  const [todayTideData, setTodayTideData] = useState([]);
  const [stationId, setStationId] = useState('9414290'); // Default station for San Francisco

  React.useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    } else {
      // Set default location if none is saved
      setLocation(DEFAULT_LOCATION);
      localStorage.setItem("savedLocation", JSON.stringify(DEFAULT_LOCATION));
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const beginDate = today.toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30); // 30 days from today
        const formattedEndDate = endDate.toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD

        const response = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
          params: {
            station: stationId,
            product: 'predictions',
            datum: 'MLLW',
            format: 'json',
            units: 'english',
            time_zone: 'lst_ldt', // Updated time zone
            begin_date: beginDate, // Formatted as YYYYMMDD
            end_date: formattedEndDate, // Formatted as YYYYMMDD
            interval: 'hilo' // Added interval parameter
          }
        });

        console.log('API Response:', response.data); // Log the API response data

        const tideData = response.data; // Ensure this is placed after the response is received

        // Process data for weekly, monthly, and today tables
        const weeklyData = tideData.predictions.filter(item => {
          const date = new Date(item.t);
          return date >= new Date(); // Adjust logic for weekly data
        });

        const monthlyData = tideData.predictions.filter(item => {
          const date = new Date(item.t);
          return date >= new Date(); // Adjust logic for monthly data
        });

        const todayData = tideData.predictions.filter(item => {
          const date = new Date(item.t);
          return date.toDateString() === new Date().toDateString(); // Logic for today's data
        });

        setWeeklyTideData(weeklyData);
        setMonthlyTideData(monthlyData);
        setTodayTideData(todayData); 

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [stationId]);

  const dailyTideData = tideData?.slice(0, 4) || [];

  const upcomingAlerts = getUpcomingAlerts(monthlyTideData);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load tide data. Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  const handleLocationChange = (newLocation: Location) => {
    const locationKey = newLocation.name.toLowerCase().replace(/\s+/g, '-');
    const station = NOAA_STATIONS[locationKey];
    if (station) {
      setStationId(station.id); // Update the station ID based on user selection
    }
  };

  useEffect(() => {
    console.log('Weekly Tide Data:', weeklyTideData);
  }, [weeklyTideData]); // Log whenever weeklyTideData changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-tide-blue text-center mb-8 animate-wave">
          Tide Tracker
        </h1>
        
        <LocationPicker id="location-picker" name="location" onLocationUpdate={(newLocation) => {
          setLocation(newLocation);
          handleLocationChange(newLocation);
        }} />
        
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
              <TideChart data={todayTideData} period="daily" />
              <TideTable data={todayTideData} period="daily" />
            </TabsContent>
            
            <TabsContent value="weekly">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-tide-blue">Weekly Tide Times</h2>
                <TideChart data={weeklyTideData} period="weekly" />
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
                  (() => {
                    const lowTides = getLowTidesNearSunriseSunset(today, location);
                    console.log('Low Tides Data:', lowTides); // Log the data being passed to TideTable
                    return (
                      <TideTable 
                        data={lowTides} 
                        period="monthly" 
                      />
                    );
                  })()
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