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
    height: parseFloat(item.v),
    type: item.type === "H" ? "high" : "low"
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      try {
        return (
          <Card className="p-3 bg-slate-800/90 border-white/10 text-white">
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
    <Card className="p-6 w-full bg-white/5 backdrop-blur-sm border-white/10">
      <h3 className="text-lg font-medium mb-4 text-center text-blue-200">Tide Levels</h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="white" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxis}
              stroke="white"
              label={{ 
                value: 'Time of Day', 
                position: 'bottom', 
                offset: 0,
                style: { fontSize: '0.75rem', fill: 'white' }
              }}
              tick={{ fontSize: 10, fill: 'white' }}
            />
            <YAxis 
              stroke="white"
              label={{ 
                value: 'Tide Height (feet)', 
                angle: -90, 
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: '0.75rem', fill: 'white' }
              }}
              tick={{ fontSize: 10, fill: 'white' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="height"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{
                stroke: '#60a5fa',
                strokeWidth: 2,
                r: 4,
                fill: '#1e1b4b'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TideChart;