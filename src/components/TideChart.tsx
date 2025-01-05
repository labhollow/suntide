import React from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface TideData {
  time: string;
  height: number;
  type: "high" | "low";
}

interface TideChartProps {
  data: TideData[];
  period: "daily" | "weekly" | "monthly";
}

const TideChart = ({ data, period }: TideChartProps) => {
  const formatXAxis = (time: string) => {
    return format(new Date(time), "h:mm a");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 bg-white/90">
          <p className="font-medium">
            {format(new Date(data.time), "h:mm a")}
          </p>
          <p>
            The tide is {data.type === "high" ? "highest" : "lowest"} at{" "}
            {data.height.toFixed(1)} meters
          </p>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 w-full bg-white/50 backdrop-blur-sm">
      <h3 className="text-lg font-medium mb-4 text-center">Today's Tide Levels</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxis}
              label={{ value: 'Time of Day', position: 'bottom', offset: 0 }}
            />
            <YAxis 
              label={{ 
                value: 'Tide Height (meters)', 
                angle: -90, 
                position: 'insideLeft',
                offset: 10
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="height"
              stroke="#1e3a8a"
              strokeWidth={2}
              dot={{
                stroke: '#1e3a8a',
                strokeWidth: 2,
                r: 4,
                fill: 'white'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TideChart;