import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfToday, format, parseISO, startOfDay, endOfDay, addDays } from "date-fns";
import { getLowTidesNearSunriseSunset, getUpcomingAlerts } from "@/utils/tideUtils";
import type { Location } from "@/utils/tideUtils";
import { NOAA_STATIONS } from "@/utils/noaaApi";
import TideAlerts from "@/components/TideAlerts";
import TideHeader from "@/components/TideHeader";
import TideView from "@/components/TideView";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const beginDate = format(today, 'yyyyMMdd');
        const endDate = format(addDays(today, 30), 'yyyyMMdd');

        const response = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
          params: {
            station: stationId,
            product: 'predictions',
            datum: 'MLLW',
            format: 'json',
            units: 'english',
            time_zone: 'lst_ldt',
            begin_date: beginDate,
            end_date: endDate,
            interval: 'hilo'
          }
        });

        if (response.data && response.data.predictions) {
          const locationKey = location.name.toLowerCase().replace(/\s+/g, '-');
          const station = NOAA_STATIONS[locationKey];
          
          const todayStart = startOfDay(today);
          const todayEnd = endOfDay(today);
          
          const todayData = response.data.predictions.filter((item: any) => {
            const itemDate = parseISO(item.t);
            return itemDate >= todayStart && itemDate <= todayEnd;
          });

          const weeklyData = response.data.predictions.filter((item: any) => {
            const itemDate = parseISO(item.t);
            return itemDate >= today && itemDate <= addDays(today, 7);
          });

          setTodayTideData(todayData);
          setWeeklyTideData(weeklyData);
          setMonthlyTideData(response.data.predictions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [stationId, location]);

  const handleLocationChange = (newLocation: Location) => {
    const locationKey = newLocation.name.toLowerCase().replace(/\s+/g, '-');
    const station = NOAA_STATIONS[locationKey];
    if (station) {
      setStationId(station.id);
    }
    setLocation(newLocation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <TideHeader location={location} onLocationUpdate={handleLocationChange} />
        
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="daily">Today</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="sunrise-sunset">Near Sunrise/Sunset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <TideView data={todayTideData} period="daily" />
          </TabsContent>
          
          <TabsContent value="weekly">
            <TideView 
              data={weeklyTideData} 
              period="weekly" 
              title="Weekly Tide Times"
            />
          </TabsContent>
          
          <TabsContent value="monthly">
            <TideView 
              data={monthlyTideData} 
              period="monthly" 
              title="Monthly Tide Times"
            />
          </TabsContent>
          
          <TabsContent value="sunrise-sunset">
            <TideView 
              data={getLowTidesNearSunriseSunset(today, location)} 
              period="monthly" 
              title="Low Tides Near Sunrise/Sunset"
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <TideAlerts upcomingAlerts={getUpcomingAlerts(monthlyTideData)} />
        </div>
      </div>
    </div>
  );
};

export default Index;