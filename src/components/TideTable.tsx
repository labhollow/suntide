import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Sunrise, Sunset } from "lucide-react";

interface TideData {
  time: string;
  height: number;
  type: "high" | "low";
  sunrise?: string;
  sunset?: string;
}

interface TideTableProps {
  data: TideData[];
  period: "weekly" | "monthly";
}

const TideTable = ({ data, period }: TideTableProps) => {
  // Convert meters to feet
  const metersToFeet = (meters: number) => {
    return meters * 3.28084;
  };

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
          {data.map((tide, index) => (
            <TableRow key={index}>
              <TableCell>
                {format(new Date(tide.time), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>{format(new Date(tide.time), "hh:mm a")}</TableCell>
              <TableCell className="capitalize">{tide.type}</TableCell>
              <TableCell>{metersToFeet(tide.height).toFixed(2)}</TableCell>
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