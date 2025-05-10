
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface TideTableProps {
  data: TideData[];
  period: "daily" | "weekly" | "monthly";
}

const TideTable = ({ data, period }: TideTableProps) => {
  console.log('Data received by TideTable:', data);
  
  // Get alert duration
  const { data: alertDuration = "2" } = useQuery({
    queryKey: ['alertDuration'],
    queryFn: () => localStorage.getItem('alertDuration') || "2",
    staleTime: 0,
    gcTime: 0
  });

  // Format and process tide data
  const { data: formattedData = [] } = useQuery({
    queryKey: ['formattedTideData', data, alertDuration],
    queryFn: () => {
      const duration = parseInt(alertDuration);
      console.log('Formatting data with duration:', duration);
      return data
        .filter(tide => tide && tide.t)
        .map(tide => {
          try {
            const date = parseISO(tide.t);
            if (isNaN(date.getTime())) {
              console.error('Invalid date:', tide.t);
              return null;
            }

            const formattedTime = format(date, "hh:mm a");
            const nearSunrise = tide.sunrise && isWithinHours(formattedTime, tide.sunrise, duration);
            const nearSunset = tide.sunset && isWithinHours(formattedTime, tide.sunset, duration);
            const nearMoonrise = tide.moonrise && isWithinHours(formattedTime, tide.moonrise, duration);
            const nearMoonset = tide.moonset && isWithinHours(formattedTime, tide.moonset, duration);
            
            return {
              date,
              height: parseFloat(tide.v),
              type: tide.type === "H" ? "high" : "low",
              sunrise: tide.sunrise,
              sunset: tide.sunset,
              moonrise: tide.moonrise,
              moonset: tide.moonset,
              moonPhase: tide.moonPhase,
              isNearSunriseOrSunset: tide.type === "L" && (nearSunrise || nearSunset),
              isNearMoonriseOrMoonset: tide.type === "L" && (nearMoonrise || nearMoonset),
              isNearSunrise: nearSunrise,
              isNearSunset: nearSunset,
              isNearMoonrise: nearMoonrise,
              isNearMoonset: nearMoonset
            };
          } catch (error) {
            console.error('Error processing tide data:', error);
            return null;
          }
        })
        .filter(Boolean);
    },
    enabled: !!data && !!alertDuration,
    staleTime: 0,
    gcTime: 0
  });

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        No tide data available
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-blue-200 font-semibold">Date</TableHead>
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
                hover:bg-slate-700/50
              `}
            >
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold flex items-center gap-2" : "text-gray-300"} transition-colors duration-300`}>
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
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300`}>
                {format(tide.date, "hh:mm a")}
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold capitalize" : "text-gray-300 capitalize"} transition-colors duration-300`}>
                {tide.type}
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300`}>
                {tide.height.toFixed(2)}
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300`}>
                {tide.sunrise || 'N/A'}
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300`}>
                {tide.sunset || 'N/A'}
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300`}>
                {tide.moonrise || 'N/A'}
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300`}>
                {tide.moonset || 'N/A'}
              </TableCell>
              <TableCell className={`${tide.isNearSunriseOrSunset || tide.isNearMoonriseOrMoonset ? "text-white font-semibold" : "text-gray-300"} transition-colors duration-300`}>
                {tide.moonPhase || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TideTable;
