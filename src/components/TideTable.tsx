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
import { cn } from "@/lib/utils";
import { metersToFeet } from "@/utils/tideUtils";

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
  
  const formattedData = data.map(tide => ({
    date: parseISO(tide.t),
    height: metersToFeet(parseFloat(tide.v)),
    type: tide.type === "H" ? "high" : "low",
    sunrise: tide.sunrise,
    sunset: tide.sunset
  }));

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Height (ft)</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-tide-sunrise" />
                Sunrise
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Sunset className="h-4 w-4 text-orange-500" />
                Sunset
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedData.map((tide, index) => (
            <TableRow key={index}>
              <TableCell>
                {format(tide.date, "MMM dd, yyyy")}
              </TableCell>
              <TableCell>{format(tide.date, "hh:mm a")}</TableCell>
              <TableCell className="capitalize">{tide.type}</TableCell>
              <TableCell>{tide.height.toFixed(2)}</TableCell>
              <TableCell className="text-tide-sunrise">{tide.sunrise}</TableCell>
              <TableCell className="text-orange-500">{tide.sunset}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TideTable;