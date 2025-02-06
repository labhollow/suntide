import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { startOfToday, format, parseISO, startOfDay, endOfDay, addDays, isWithinInterval, isFuture } from "date-fns";
import { getLowTidesNearSunriseSunset, getUpcomingAlerts, enrichTideDataWithSunriseSunset } from "@/utils/tideUtils";
import { isWithinHours } from "@/utils/dateUtils";
import type { Location } from "@/utils/tideUtils";
import { NOAA_STATIONS } from "@/utils/noaaApi";
import TideAlerts from "@/components/TideAlerts";
import TideHeader from "@/components/TideHeader";
import TideView from "@/components/TideView";
import TideCalendar from '@/components/TideCalendar';
import GoogleAd from '@/components/GoogleAd';
import { Moon, Sun, Waves, Sunrise, Sunset, AlertTriangle, Loader2, Calendar } from 'lucide-react';

const DEFAULT_LOCATION = {
  "id": "9410583",
  "name": "Balboa Pier, Newport Beach",
  "lat": 33.6,
  "lng": -117.9,
  "state": "California"
} as const;

const TODAY = startOfToday();

const Index = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [monthlyTideData, setMonthlyTideData] = useState([]);
  const [stationId, setStationId] = useState<string | null>(null);
  const [alertDuration] = useState(2);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLocation = localStorage.getItem("savedLocation");
    const initialLocation = savedLocation ? JSON.parse(savedLocation) : DEFAULT_LOCATION;
    
    if (!savedLocation) {
      localStorage.setItem("savedLocation", JSON.stringify(DEFAULT_LOCATION));
    }

    setLocation(initialLocation);
    
    const locationStationId = Object.entries(NOAA_STATIONS).find(
      ([_, station]) => station.name === initialLocation.name
    )?.[1].id;

    if (locationStationId) {
      setStationId(locationStationId);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!stationId || !location) return;
      
      setIsLoading(true);
      try {
        const beginDate = format(TODAY, 'yyyyMMdd');
        const endDate = format(addDays(TODAY, 30), 'yyyyMMdd');

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [stationId, location]);

  const todayTideData = useMemo(() => {
    const todayStart = startOfDay(TODAY);
    const todayEnd = endOfDay(TODAY);
    
    return monthlyTideData.filter((item: any) => {
      const itemDate = parseISO(item.t);
      return itemDate >= todayStart && itemDate <= todayEnd;
    });
  }, [monthlyTideData, TODAY]);

  const weeklyTideData = useMemo(() => {
    const weekEnd = addDays(TODAY, 7);
    
    return monthlyTideData.filter((item: any) => {
      const itemDate = parseISO(item.t);
      return isWithinInterval(itemDate, { start: TODAY, end: weekEnd });
    });
  }, [monthlyTideData, TODAY]);

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
    const duration = parseInt(localStorage.getItem('alertDuration') || '2');
    
    return isWithinHours(tideTime, nextTide.sunrise, duration) || 
           isWithinHours(tideTime, nextTide.sunset, duration);
  }, [nextTide]);

  const getAlertText = () => {
    if (!nextTide) return '';
    const tideTime = format(parseISO(nextTide.t), 'hh:mm a');
    const nearSunrise = isWithinHours(tideTime, nextTide.sunrise, alertDuration);
    return ` Near ${nearSunrise ? 'Sunrise' : 'Sunset'}`;
  };

  const handleLocationChange = (newLocation: Location) => {
    const locationKey = newLocation.name.toLowerCase().replace(/\s+/g, '-');
    const station = NOAA_STATIONS[locationKey];
    if (station) {
      setStationId(station.id);
    }
    setLocation(newLocation);
    localStorage.setItem("savedLocation", JSON.stringify(newLocation));
  };

  if (!location || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-850 to-slate-900">
          <div className="relative w-full min-h-screen">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 relative">
              <TideHeader 
                location={location} 
                onLocationUpdate={handleLocationChange}
                upcomingAlerts={[]}
              />
              <div className="flex flex-col items-center justify-center space-y-4 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-blue-200">Loading tide data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Top Ad Placement */}
            <GoogleAd slot="3498132583" format="auto" responsive={true} />

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
                      {isNextTideAlert && ` - ${getAlertText()}`}
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
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200 flex items-center justify-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly" 
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200 flex items-center justify-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  This Week
                </TabsTrigger>
                <TabsTrigger 
                  value="monthly" 
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200 hidden sm:flex items-center justify-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  This Month
                </TabsTrigger>
                <TabsTrigger 
                  value="sunrise-sunset" 
                  className="data-[state=active]:bg-blue-200/10 data-[state=active]:text-blue-200 hidden sm:flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                {isLoading ? <p>Loading tide data...</p> : (
                  <>
                    <TideView data={todayTideData} period="daily" />
                    <GoogleAd slot="2345678901" format="auto" responsive={true} />
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="weekly">
                {isLoading ? <p>Loading tide data...</p> : (
                  <>
                    <TideView data={weeklyTideData} period="weekly" />
                    <GoogleAd slot="3456789012" format="auto" responsive={true} />
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="monthly">
                {isLoading ? <p>Loading tide data...</p> : (
                  <>
                    <TideView data={monthlyTideData} period="monthly" />
                    <GoogleAd slot="4567890123" format="auto" responsive={true} />
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="sunrise-sunset">
                {isLoading ? <p>Loading tide data...</p> : (
                  <>
                    <TideCalendar tideData={monthlyTideData} />
                    <GoogleAd slot="5678901234" format="auto" responsive={true} />
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Bottom Ad Placement */}
            <GoogleAd slot="6789012345" format="auto" responsive={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
