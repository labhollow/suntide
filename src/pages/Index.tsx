import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TideChart from "@/components/TideChart";
import TideTable from "@/components/TideTable";
import LocationPicker from "@/components/LocationPicker";
import TideAlerts from "@/components/TideAlerts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfToday, format, parseISO, startOfDay, endOfDay, addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { getLowTidesNearSunriseSunset, getUpcomingAlerts } from "@/utils/tideUtils";
import type { Location } from "@/utils/tideUtils";
import { fetchTideData, NOAA_STATIONS } from "@/utils/noaaApi";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import SunCalc from "suncalc";

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
  const [stationId, setStationId] = useState('9414290'); // San Francisco station
  const timeZone = 'America/Los_Angeles';

  React.useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    } else {
      localStorage.setItem("savedLocation", JSON.stringify(DEFAULT_LOCATION));
    }
  }, []);

  const addSunriseSunsetToData = (data: any[], lat: number, lng: number) => {
    return data.map(item => {
      const date = parseISO(item.t);
      const times = SunCalc.getTimes(date, lat, lng);
      return {
        ...item,
        sunrise: format(times.sunrise, 'hh:mm a'),
        sunset: format(times.sunset, 'hh:mm a')
      };
    });
  };

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

        console.log('API Response:', response.data);

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

          const monthlyData = response.data.predictions;

          console.log('Today data before processing:', todayData);

          const processedTodayData = addSunriseSunsetToData(todayData, station.lat, station.lng);
          const processedWeeklyData = addSunriseSunsetToData(weeklyData, station.lat, station.lng);
          const processedMonthlyData = addSunriseSunsetToData(monthlyData, station.lat, station.lng);

          console.log('Today data after processing:', processedTodayData);

          setTodayTideData(processedTodayData);
          setWeeklyTideData(processedWeeklyData);
          setMonthlyTideData(processedMonthlyData);
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
  };

  const renderContent = () => {
    if (todayTideData.length === 0) {
      return (
        <div className="text-center p-4">
          No tide data available for today
        </div>
      );
    }

    return (
      <>
        <TideChart data={todayTideData} period="daily" />
        <TideTable data={todayTideData} period="daily" />
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

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="daily">Today</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="sunrise-sunset">Near Sunrise/Sunset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="weekly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Weekly Tide Times</h2>
              {weeklyTideData.length > 0 ? (
                <>
                  <TideChart data={weeklyTideData} period="weekly" />
                  <TideTable data={weeklyTideData} period="weekly" />
                </>
              ) : (
                <div className="text-center p-4">
                  No tide data available for this week
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="monthly">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Monthly Tide Times</h2>
              {monthlyTideData.length > 0 ? (
                <TideTable data={monthlyTideData} period="monthly" />
              ) : (
                <div className="text-center p-4">
                  No tide data available for this month
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sunrise-sunset">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-tide-blue">Low Tides Near Sunrise/Sunset</h2>
              {location && monthlyTideData.length > 0 ? (
                <TideTable 
                  data={getLowTidesNearSunriseSunset(today, location)} 
                  period="monthly" 
                />
              ) : (
                <div className="text-center p-4">
                  No tide data available near sunrise/sunset
                </div>
              )}
            </div>
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
