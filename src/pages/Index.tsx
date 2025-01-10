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
  const [location, setLocation] = React.useState<Location>(DEFAULT_LOCATION);
  const today = startOfToday();
  const [weeklyTideData, setWeeklyTideData] = useState([]);
  const [monthlyTideData, setMonthlyTideData] = useState([]);
  const [todayTideData, setTodayTideData] = useState([]);
  const [stationId, setStationId] = useState('9414290');

  React.useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    } else {
      localStorage.setItem("savedLocation", JSON.stringify(DEFAULT_LOCATION));
    }
  }, []);

  const { data: tideData, isLoading, error } = useQuery({
    queryKey: ['tides', location?.name],
    queryFn: async () => {
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
        const beginDate = today.toISOString().split('T')[0].replace(/-/g, '');
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);
        const formattedEndDate = endDate.toISOString().split('T')[0].replace(/-/g, '');

        const response = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
          params: {
            station: stationId,
            product: 'predictions',
            datum: 'MLLW',
            format: 'json',
            units: 'english',
            time_zone: 'lst_ldt',
            begin_date: beginDate,
            end_date: formattedEndDate,
            interval: 'hilo'
          }
        });

        if (response.data && response.data.predictions) {
          const weeklyData = response.data.predictions.filter((item: any) => {
            const date = new Date(item.t);
            return date >= new Date();
          });

          const monthlyData = response.data.predictions.filter((item: any) => {
            const date = new Date(item.t);
            return date >= new Date();
          });

          const todayData = response.data.predictions.filter((item: any) => {
            const date = new Date(item.t);
            return date.toDateString() === new Date().toDateString();
          });

          setWeeklyTideData(weeklyData);
          setMonthlyTideData(monthlyData);
          setTodayTideData(todayData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [stationId]);

  const handleLocationChange = (newLocation: Location) => {
    const locationKey = newLocation.name.toLowerCase().replace(/\s+/g, '-');
    const station = NOAA_STATIONS[locationKey];
    if (station) {
      setStationId(station.id);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-tide-blue" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load tide data. Please try again later.'}
          </AlertDescription>
        </Alert>
      );
    }

    const upcomingAlerts = getUpcomingAlerts(monthlyTideData);

    return (
      <>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="daily">Today</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="sunrise-sunset">Near Sunrise/Sunset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <TideChart data={todayTideData} period="daily" />
            <TideTable 
              data={todayTideData} 
              location={{ lat: location.lat, lng: location.lng }} 
              period="daily" 
            />
          </TabsContent>
          
          <TabsContent value="weekly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Weekly Tide Times</h2>
              <TideChart data={weeklyTideData} period="weekly" />
              <TideTable 
                data={weeklyTideData} 
                location={{ lat: location.lat, lng: location.lng }} 
                period="weekly" 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="monthly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Monthly Tide Times</h2>
              <TideTable 
                data={monthlyTideData} 
                location={{ lat: location.lat, lng: location.lng }} 
                period="monthly" 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="sunrise-sunset">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Low Tides Near Sunrise/Sunset</h2>
              {location && (
                <TideTable 
                  data={getLowTidesNearSunriseSunset(today, location)} 
                  location={{ lat: location.lat, lng: location.lng }} 
                  period="monthly" 
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <TideAlerts upcomingAlerts={upcomingAlerts} />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-tide-blue text-center mb-8 animate-wave">
          Tide Tracker
        </h1>
        
        <LocationPicker 
          id="location-picker" 
          name="location" 
          onLocationUpdate={(newLocation) => {
            setLocation(newLocation);
            handleLocationChange(newLocation);
          }} 
        />
        
        {location && (
          <div className="text-sm text-muted-foreground text-center">
            Showing tide data for {location.name} ({location.lat.toFixed(2)}, {location.lng.toFixed(2)})
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default Index;