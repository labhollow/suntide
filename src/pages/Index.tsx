import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { startOfToday, format, parseISO, startOfDay, endOfDay, addDays, isWithinInterval, isFuture } from "date-fns";
import { getLowTidesNearSunriseSunset, getUpcomingAlerts, enrichTideDataWithSunriseSunset, getTideAndSunriseSunsetData } from "@/utils/tideUtils";
import { isWithinHours } from "@/utils/dateUtils";
import type { Location } from "@/utils/tideUtils";
import { NOAA_STATIONS } from "@/utils/noaaApi";
import TideAlerts from "@/components/TideAlerts";
import TideHeader from "@/components/TideHeader";
import TideView from "@/components/TideView";
import TideCalendar from '@/components/TideCalendar';
import { Moon, Sun, Waves, Sunrise, Sunset, AlertTriangle } from 'lucide-react';

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
    const weekEnd = addDays(today, 7);
    
    return monthlyTideData.filter((item: any) => {
      const itemDate = parseISO(item.t);
      return isWithinInterval(itemDate, { start: today, end: weekEnd });
    });
  }, [monthlyTideData, today]);

  const nextTide = useMemo(() => {
    if (!monthlyTideData.length) return null;
    
    const now = new Date();
    const upcomingTides = monthlyTideData.filter(tide => {
      const tideTime = parseISO(tide.t);
      return isFuture(tideTime);
    });
    
    return upcomingTides.length > 0 ? upcomingTides[0] : null;
  }, [monthlyTideData]);

  const isNextTideAlert = useMemo(() => {
    if (!nextTide) return false;
    
    if (nextTide.type !== 'L') return false;
    
    const tideTime = format(parseISO(nextTide.t), 'hh:mm a');
    
    return isWithinHours(tideTime, nextTide.sunrise, alertDuration) || 
           isWithinHours(tideTime, nextTide.sunset, alertDuration);
  }, [nextTide, alertDuration]);

  const handleLocationChange = (newLocation: Location) => {
    const locationKey = newLocation.name.toLowerCase().replace(/\s+/g, '-');
    const station = NOAA_STATIONS[locationKey];
    if (station) {
      setStationId(station.id);
    }
    setLocation(newLocation);
    localStorage.setItem("savedLocation", JSON.stringify(newLocation));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-850 to-slate-900">
        <div className="relative w-full min-h-screen">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />

          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 relative">
            <TideHeader 
              location={location} 
              onLocationUpdate={handleLocationChange}
              upcomingAlerts={getUpcomingAlerts(monthlyTideData)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className={`p-6 backdrop-blur-sm border-white/10 transition-colors ${
                isNextTideAlert 
                  ? 'bg-orange-500/20 border-orange-500/50' 
                  : 'bg-white/5'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-200">Next Tide</h3>
                  <div className="flex items-center gap-2">
                    {isNextTideAlert && (
                      <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse" />
                    )}
                    <Waves className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                {nextTide && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-white">
                      {parseFloat(nextTide.v).toFixed(1)}ft
                    </div>
                    <div className="text-blue-200">
                      {format(parseISO(nextTide.t), 'h:mm a')}
                    </div>
                    <div className={`${
                      isNextTideAlert ? 'text-orange-400' : 'text-blue-200/80'
                    }`}>
                      {nextTide.type === 'H' ? 'High Tide' : 'Low Tide'}
                      {isNextTideAlert && ' - Near Sun Event'}
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-200">Sun Events</h3>
                  <Sun className="w-6 h-6 text-tide-sunrise" />
                </div>
                {nextTide && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-tide-sunrise">
                        <Sunrise className="w-5 h-5 mr-2" />
                        <span>Sunrise</span>
                      </div>
                      <div className="text-xl font-semibold text-white">
                        {nextTide.sunrise}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-tide-sunset">
                        <Sunset className="w-5 h-5 mr-2" />
                        <span>Sunset</span>
                      </div>
                      <div className="text-xl font-semibold text-white">
                        {nextTide.sunset}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

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
