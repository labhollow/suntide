import React from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { metersToFeet } from "@/utils/tideUtils";

interface TideData {
  t: string;
  v: string;
  type: string;
}

interface TideChartProps {
  data: TideData[];
  period: "daily" | "weekly" | "monthly";
}

const TideChart = ({ data, period }: TideChartProps) => {
  console.log('Data passed to TideChart:', data);

  const formatXAxis = (timeStr: string) => {
    try {
      const date = parseISO(timeStr);
      return format(date, "h:mm a");
    } catch (error) {
      console.error('Error formatting date:', timeStr, error);
      return '';
    }
  };

  const formattedData = data.map(item => ({
    time: item.t,
    height: metersToFeet(parseFloat(item.v)), // Convert string to number and then to feet
    type: item.type === "H" ? "high" : "low"
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      try {
        return (
          <Card className="p-3 bg-white/90">
            <p className="font-medium">
              {format(parseISO(label), "h:mm a")}
            </p>
            <p>
              Height: {payload[0].value.toFixed(2)} ft
            </p>
          </Card>
        );
      } catch (error) {
        console.error('Error in tooltip:', error);
        return null;
      }
    }
    return null;
  };

  return (
    <Card className="p-6 w-full bg-white/50 backdrop-blur-sm">
      <h3 className="text-lg font-medium mb-4 text-center">Tide Levels</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
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
                value: 'Tide Height (feet)', 
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