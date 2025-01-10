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
import { metersToFeet, isWithinThreeHours } from "@/utils/tideUtils";
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
  
  const formattedData = data.map(tide => ({
    date: parseISO(tide.t),
    height: parseFloat(tide.v),
    type: tide.type === "H" ? "high" : "low",
    sunrise: tide.sunrise,
    sunset: tide.sunset,
    isNearSunriseOrSunset: tide.type === "L" && (
      (tide.sunrise && isWithinThreeHours(format(parseISO(tide.t), "hh:mm a"), tide.sunrise)) ||
      (tide.sunset && isWithinThreeHours(format(parseISO(tide.t), "hh:mm a"), tide.sunset))
    )
  }));

  React.useEffect(() => {
    formattedData.forEach(tide => {
      if (tide.isNearSunriseOrSunset) {
        const timeOfDay = isWithinThreeHours(format(tide.date, "hh:mm a"), tide.sunrise || "") 
          ? "sunrise" 
          : "sunset";
        
        toast({
          title: "Low Tide Alert",
          description: `Low tide on ${format(tide.date, "MMM dd, yyyy")} at ${format(tide.date, "hh:mm a")} is within 3 hours of ${timeOfDay}`,
        });
      }
    });
  }, [data, toast]);

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