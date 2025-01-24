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

  const formattedData = data.map(item => ({
    time: format(parseISO(item.t), 'HH:mm'),
    displayTime: item.t,
    height: parseFloat(item.v),
    type: item.type === "H" ? "high" : "low"
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      try {
        return (
          <Card className="p-2 sm:p-3 bg-slate-800/90 border-white/10 text-white">
            <p className="text-sm sm:text-base font-medium">
              {label}
            </p>
            <p className="text-sm">
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
    <Card className="p-2 sm:p-4 w-full bg-white/5 backdrop-blur-sm border-white/10">
      <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-4 text-center text-blue-200">Tide Levels</h3>
      <div className="w-full h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ 
              top: 10, 
              right: 10, 
              left: 0, 
              bottom: 0 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="white" />
            <XAxis 
              dataKey="time"
              stroke="white"
              tick={{ fontSize: 10, fill: 'white' }}
              tickMargin={8}
            />
            <YAxis 
              stroke="white"
              tick={{ fontSize: 10, fill: 'white' }}
              tickMargin={8}
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
              activeDot={{
                stroke: '#60a5fa',
                strokeWidth: 2,
                r: 6,
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