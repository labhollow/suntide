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

interface TideData {
  time: string;
  height: number;
  type: "high" | "low";
}

interface TideTableProps {
  data: TideData[];
  period: "weekly" | "monthly";
}

const TideTable = ({ data, period }: TideTableProps) => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Height (m)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tide, index) => (
            <TableRow key={index}>
              <TableCell>
                {format(new Date(tide.time), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>{format(new Date(tide.time), "HH:mm")}</TableCell>
              <TableCell className="capitalize">{tide.type}</TableCell>
              <TableCell>{tide.height.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TideTable;