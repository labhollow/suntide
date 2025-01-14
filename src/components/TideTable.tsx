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
import { ArrowUp, ArrowDown } from "lucide-react";
import { metersToFeet } from "@/utils/tideUtils";
import { isWithinHours } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";

interface TideData {
  t: string;
  v: string;
  type: string;
  sunrise?: string;
  sunset?: string;
}

interface TideTableProps {
  data: TideData[];
  period: "daily" | "weekly" | "monthly";
}

const TideTable = ({ data, period }: TideTableProps) => {
  console.log('Data received by TideTable:', data);
  
  // Check if alerts are enabled
  const { data: alertsEnabled = false } = useQuery({
    queryKey: ['alertsEnabled'],
    queryFn: () => {
      const enabled = localStorage.getItem('alertsEnabled') === 'true';
      console.log('Alerts enabled:', enabled);
      return enabled;
    },
  });

  // Get alert duration
  const { data: alertDuration = "2" } = useQuery({
    queryKey: ['alertDuration'],
    queryFn: () => {
      const duration = localStorage.getItem('alertDuration') || "2";
      console.log('Alert duration:', duration);
      return duration;
    },
  });
  
  // Format and process tide data
  const { data: formattedData = [] } = useQuery({
    queryKey: ['formattedTideData', data, alertDuration], // Add alertDuration as dependency
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
            
            return {
              date,
              height: parseFloat(tide.v),
              type: tide.type === "H" ? "high" : "low",
              sunrise: tide.sunrise,
              sunset: tide.sunset,
              isNearSunriseOrSunset: tide.type === "L" && (nearSunrise || nearSunset),
              isNearSunrise: nearSunrise,
              isNearSunset: nearSunset
            };
          } catch (error) {
            console.error('Error processing tide data:', error);
            return null;
          }
        })
        .filter(Boolean);
    },
    enabled: !!data && !!alertDuration,
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
            <TableHead className="text-gray-300 font-semibold">Date</TableHead>
            <TableHead className="text-gray-300 font-semibold">Time</TableHead>
            <TableHead className="text-gray-300 font-semibold">Type</TableHead>
            <TableHead className="text-gray-300 font-semibold">Height (ft)</TableHead>
            <TableHead className="text-gray-300 font-semibold">Sunrise</TableHead>
            <TableHead className="text-gray-300 font-semibold">Sunset</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedData.map((tide, index) => (
            <TableRow 
              key={index}
              className={`
                ${tide.isNearSunriseOrSunset ? "bg-slate-800" : ""}
                transition-colors duration-200
              `}
            >
              <TableCell className={tide.isNearSunriseOrSunset ? "text-white font-semibold flex items-center gap-2" : "text-gray-300"}>
                {format(tide.date, "MMM dd, yyyy")}
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
              </TableCell>
              <TableCell className={tide.isNearSunriseOrSunset ? "text-white font-semibold" : "text-gray-300"}>
                {format(tide.date, "hh:mm a")}
              </TableCell>
              <TableCell className={tide.isNearSunriseOrSunset ? "text-white font-semibold capitalize" : "text-gray-300 capitalize"}>
                {tide.type}
              </TableCell>
              <TableCell className={tide.isNearSunriseOrSunset ? "text-white font-semibold" : "text-gray-300"}>
                {tide.height.toFixed(2)}
              </TableCell>
              <TableCell className={tide.isNearSunriseOrSunset ? "text-white font-semibold" : "text-gray-300"}>
                {tide.sunrise || 'N/A'}
              </TableCell>
              <TableCell className={tide.isNearSunriseOrSunset ? "text-white font-semibold" : "text-gray-300"}>
                {tide.sunset || 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TideTable;