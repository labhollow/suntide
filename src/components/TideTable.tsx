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
import { Sunrise, Sunset } from "lucide-react";
import { metersToFeet } from "@/utils/tideUtils";
import { isWithinThreeHours } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  const formattedData = React.useMemo(() => {
    return data
      .filter(tide => tide && tide.t)
      .map(tide => {
        try {
          const date = parseISO(tide.t);
          if (isNaN(date.getTime())) {
            console.error('Invalid date:', tide.t);
            return null;
          }

          return {
            date,
            height: parseFloat(tide.v),
            type: tide.type === "H" ? "high" : "low",
            sunrise: tide.sunrise,
            sunset: tide.sunset,
            isNearSunriseOrSunset: tide.type === "L" && (
              (tide.sunrise && isWithinThreeHours(format(date, "hh:mm a"), tide.sunrise)) ||
              (tide.sunset && isWithinThreeHours(format(date, "hh:mm a"), tide.sunset))
            )
          };
        } catch (error) {
          console.error('Error processing tide data:', error);
          return null;
        }
      })
      .filter(Boolean);
  }, [data]);

  const shownToasts = React.useRef(new Set());

  React.useEffect(() => {
    formattedData.forEach(tide => {
      if (tide.isNearSunriseOrSunset) {
        const toastKey = `${format(tide.date, "yyyy-MM-dd HH:mm")}`;
        
        if (!shownToasts.current.has(toastKey)) {
          const timeOfDay = isWithinThreeHours(format(tide.date, "hh:mm a"), tide.sunrise || "") 
            ? "sunrise" 
            : "sunset";
          
          toast({
            title: "Low Tide Alert",
            description: `Low tide on ${format(tide.date, "MMM dd, yyyy")} at ${format(tide.date, "hh:mm a")} is within 3 hours of ${timeOfDay}`,
          });
          
          shownToasts.current.add(toastKey);
        }
      }
    });
  }, [formattedData, toast]);

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
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Height (ft)</TableHead>
            <TableHead>Sunrise</TableHead>
            <TableHead>Sunset</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedData.map((tide, index) => (
            <TableRow 
              key={index}
              className={tide.isNearSunriseOrSunset ? "bg-red-100" : ""}
            >
              <TableCell>
                {format(tide.date, "MMM dd, yyyy")}
              </TableCell>
              <TableCell>{format(tide.date, "hh:mm a")}</TableCell>
              <TableCell className="capitalize">{tide.type}</TableCell>
              <TableCell>{tide.height.toFixed(2)}</TableCell>
              <TableCell>{tide.sunrise || 'N/A'}</TableCell>
              <TableCell>{tide.sunset || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TideTable;