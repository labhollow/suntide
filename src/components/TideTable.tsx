
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { ArrowUp, ArrowDown, Moon } from "lucide-react";
import { metersToFeet } from "@/utils/tideUtils";
import { isWithinHours } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";

interface TideData {
  t: string;
  v: string;
  type: string;
  sunrise?: string;
  sunset?: string;
  moonrise?: string | null;
  moonset?: string | null;
  moonPhase?: string;
  isNearSunriseOrSunset?: boolean;
  isNearMoonriseOrMoonset?: boolean;
}

interface FormattedTideData {
  date: Date;
  type: string;
  height: number;
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  moonPhase: string;
  isNearSunriseOrSunset: boolean;
  isNearSunrise?: boolean;
  isNearMoonriseOrMoonset: boolean;
  isNearMoonrise?: boolean;
}

interface TideTableProps {
  data: TideData[];
  period: "daily" | "weekly" | "monthly";
}

const TideTable = ({ data, period }: TideTableProps) => {
  const navigate = useNavigate();
  
  console.log('Data received by TideTable:', data);
  
  // Get alert duration
  const { data: alertDuration = "2" } = useQuery({
    queryKey: ['alertDuration'],
    queryFn: () => localStorage.getItem('alertDuration') || "2",
    staleTime: 0,
    gcTime: 0
  });

  // Format and process tide data
  const { data: formattedData = [] } = useQuery<FormattedTideData[]>({
    queryKey: ['formattedTideData', data, alertDuration],
    queryFn: () => {
      if (!data || data.length === 0) return [];
      const hours = parseInt(alertDuration, 10);
      
      return data.map((tide) => {
        const date = parseISO(tide.t);
        const height = metersToFeet(parseFloat(tide.v));
        const sunriseTime = tide.sunrise || 'N/A';
        const sunsetTime = tide.sunset || 'N/A';
        const moonriseTime = tide.moonrise || null;
        const moonsetTime = tide.moonset || null;
        
        // Check if tide is near sunrise or sunset
        const isNearSunrise = tide.sunrise ? isWithinHours(format(date, 'hh:mm a'), sunriseTime, hours) : false;
        const isNearSunset = tide.sunset ? isWithinHours(format(date, 'hh:mm a'), sunsetTime, hours) : false;
        const isNearSunriseOrSunset = isNearSunrise || isNearSunset || !!tide.isNearSunriseOrSunset;
        
        // Check if tide is near moonrise or moonset
        const isNearMoonrise = moonriseTime ? isWithinHours(format(date, 'hh:mm a'), moonriseTime, hours) : false;
        const isNearMoonset = moonsetTime ? isWithinHours(format(date, 'hh:mm a'), moonsetTime, hours) : false;
        const isNearMoonriseOrMoonset = isNearMoonrise || isNearMoonset || !!tide.isNearMoonriseOrMoonset;
        
        return {
          date,
          type: tide.type,
          height,
          sunrise: sunriseTime,
          sunset: sunsetTime,
          moonrise: moonriseTime,
          moonset: moonsetTime,
          moonPhase: tide.moonPhase || 'N/A',
          isNearSunriseOrSunset,
          isNearSunrise,
          isNearMoonriseOrMoonset,
          isNearMoonrise
        };
      });
    },
    enabled: !!data && !!alertDuration,
    staleTime: 0,
    gcTime: 0
  });

  const handleRowClick = (tide: FormattedTideData, index: number) => {
    // Generate a unique ID for the tide based on date and index
    const tideId = `${format(tide.date, 'yyyyMMdd')}-${tide.type}-${index}`;
    navigate(`/tide/${tideId}`, { state: { tideData: tide } });
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        No tide data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">
        <ScrollArea className="h-[calc(100vh-20rem)] overflow-auto">
          <div className="w-full overflow-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/75">
                  <TableRow>
                    <TableHead className="text-blue-200 font-semibold min-w-[100px]">Date</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Time</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Type</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Height (ft)</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Sunrise</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Sunset</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Moonrise</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Moonset</TableHead>
                    <TableHead className="text-blue-200 font-semibold">Moon Phase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedData.map((tide, index) => (
                    <TableRow 
                      key={`${tide.date.toISOString()}-${tide.type}-${index}`}
                      className={`
                        ${tide.isNearSunriseOrSunset ? "bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/50" : ""}
                        ${tide.isNearMoonriseOrMoonset && !tide.isNearSunriseOrSunset ? "bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/50" : ""}
                        transition-all duration-300 ease-in-out
                        hover:bg-slate-700/50 cursor-pointer
                      `}
                      onClick={() => handleRowClick(tide, index)}
                    >
                      <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300 min-w-[100px]`}>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-blue-200 font-medium">{format(tide.date, "EEEE")}</span>
                            {format(tide.date, "MMM dd, yyyy")}
                          </div>
                          {tide.isNearSunriseOrSunset && (
                            <div className="flex flex-col items-center">
                              {tide.isNearSunrise ? (
                                <>
                                  <span className="text-xs text-white font-light">rise</span>
                                  <ArrowUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  <ArrowDown className="w-4 h-4" />
                                  <span className="text-xs text-white font-light">set</span>
                                </>
                              )}
                            </div>
                          )}
                          {tide.isNearMoonriseOrMoonset && !tide.isNearSunriseOrSunset && (
                            <div className="flex flex-col items-center">
                              <Moon className="w-4 h-4" />
                              {tide.isNearMoonrise ? (
                                <span className="text-xs text-white font-light">rise</span>
                              ) : (
                                <span className="text-xs text-white font-light">set</span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      // ... keep existing code (the rest of the table cells)
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TideTable;
