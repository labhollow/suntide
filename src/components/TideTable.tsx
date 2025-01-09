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
import { cn } from "@/lib/utils";
import { metersToFeet } from "@/utils/tideUtils";

interface TideData {
  t: string;
  height: number;
  type: "high" | "low";
  sunrise?: string;
  sunset?: string;
  isNearSunriseOrSunset?: boolean;
}

interface TideTableProps {
  data: TideData[];
  period: "daily" | "weekly" | "monthly";
}

const TideTable = ({ data, period }: TideTableProps) => {
  console.log('Data received by TideTable:', data); // Log the data being received by TideTable
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
          {data.map((tide, index) => {
            console.log('Tide Time:', tide.t); // Log the tide time
            return (
              <TableRow 
                key={index}
                className={cn(
                  tide.isNearSunriseOrSunset && tide.type === "low" && "bg-red-100 hover:bg-red-200"
                )}
              >
                <TableCell>
                  {format(new Date(tide.t), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{format(new Date(tide.t), "hh:mm a")}</TableCell>
                <TableCell className="capitalize">{tide.type}</TableCell>
                <TableCell>{metersToFeet(tide.height).toFixed(2)}</TableCell>
                <TableCell className="text-tide-sunrise">{tide.sunrise}</TableCell>
                <TableCell className="text-orange-500">{tide.sunset}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TideTable;