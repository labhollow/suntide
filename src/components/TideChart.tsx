import React from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

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
    time: format(parseISO(item.t), 'h:mm a'),
    displayTime: item.t,
    height: parseFloat(item.v),
    type: item.type === "H" ? "High Tide" : "Low Tide"
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
            <p className="text-sm text-blue-200">
              {payload[0].payload.type}
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
    <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
      <h3 className="text-base sm:text-lg font-medium p-4 text-center text-blue-200">Tide Levels</h3>
      <div className="w-full h-[300px] sm:h-[400px] px-1 sm:px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ 
              top: 20, 
              right: 10,
              left: 0,
              bottom: 20 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="white" vertical={false} />
            <XAxis 
              dataKey="time"
              stroke="white"
              tick={{ fontSize: 12, fill: 'white' }}
              tickMargin={10}
              height={50}
              interval="preserveStartEnd"
              angle={0}
            />
            <YAxis 
              stroke="white"
              tick={{ fontSize: 12, fill: 'white' }}
              tickMargin={10}
              width={35}
              orientation="left"
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
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
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TideChart;