import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfToday, format, parseISO, startOfDay, endOfDay, addDays } from "date-fns";
import { getLowTidesNearSunriseSunset, getUpcomingAlerts, enrichTideDataWithSunriseSunset, getTideAndSunriseSunsetData } from "@/utils/tideUtils";
import type { Location } from "@/utils/tideUtils";
import { NOAA_STATIONS } from "@/utils/noaaApi";
import TideAlerts from "@/components/TideAlerts";
import TideHeader from "@/components/TideHeader";
import TideView from "@/components/TideView";
import TideCalendar from '@/components/TideCalendar';
import { Moon, Sun, Waves } from 'lucide-react';

const DEFAULT_LOCATION = {
  name: "San Francisco",
  lat: 37.7749,
  lng: -122.4194
};

const Index = () => {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const today = startOfToday();
  const [monthlyTideData, setMonthlyTideData] = useState([]);
  const [stationId, setStationId] = useState('9414290');
  const [alertDuration, setAlertDuration] = useState(2);

  useEffect(() => {
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
          const enrichedData = enrichTideDataWithSunriseSunset(response.data.predictions, location);
          setMonthlyTideData(enrichedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [stationId, location, today]);

  const todayTideData = useMemo(() => {
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    return monthlyTideData.filter((item: any) => {
      const itemDate = parseISO(item.t);
      return itemDate >= todayStart && itemDate <= todayEnd;
    });
  }, [monthlyTideData, today]);

  const weeklyTideData = useMemo(() => {
    return monthlyTideData.filter((item: any) => {
      const itemDate = parseISO(item.t);
      return itemDate >= today && itemDate <= addDays(today, 7);
    });
  }, [monthlyTideData, today]);

  const handleLocationChange = (newLocation: Location) => {
    const locationKey = newLocation.name.toLowerCase().replace(/\s+/g, '-');
    const station = NOAA_STATIONS[locationKey];
    if (station) {
      setStationId(station.id);
    }
    setLocation(newLocation);
    localStorage.setItem("savedLocation", JSON.stringify(newLocation));
  };

  const tideEvents = useMemo(() => {
    return getTideAndSunriseSunsetData(monthlyTideData, location);
  }, [monthlyTideData, location]);

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-900">
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen w-full overflow-x-hidden">
        <div className="w-full min-h-screen">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
            
            <TideHeader 
              location={location} 
              onLocationUpdate={handleLocationChange}
              upcomingAlerts={getUpcomingAlerts(monthlyTideData)}
            />
            
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                <TabsTrigger 
                  value="daily" 
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Today
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly" 
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  This Week
                </TabsTrigger>
                <TabsTrigger 
                  value="monthly" 
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200"
                >
                  <Waves className="w-4 h-4 mr-2" />
                  This Month
                </TabsTrigger>
                <TabsTrigger 
                  value="sunrise-sunset" 
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200"
                >
                  Calendar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <TideView data={todayTideData} period="daily" />
              </TabsContent>
              
              <TabsContent value="weekly">
                <TideView data={weeklyTideData} period="weekly" />
              </TabsContent>
              
              <TabsContent value="monthly">
                <TideView data={monthlyTideData} period="monthly" />
              </TabsContent>
              
              <TabsContent value="sunrise-sunset">
                <TideCalendar tideData={monthlyTideData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
