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
          <Card className="p-2 sm:p-3 bg-white/90 backdrop-blur-sm border-none shadow-lg">
            <p className="text-sm sm:text-base font-medium text-purple-850">
              {label}
            </p>
            <p className="text-sm text-purple-850">
              Height: {payload[0].value.toFixed(2)} ft
            </p>
            <p className="text-sm text-purple-600">
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
    <Card className="p-4 sm:p-6 w-full bg-white/20 backdrop-blur-md border-white/20 shadow-xl">
      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center text-white">
        Tide Levels
      </h3>
      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ 
              top: 20, 
              right: 30, 
              left: 60, 
              bottom: 20 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="white" vertical={false} />
            <XAxis 
              dataKey="time"
              stroke="white"
              tick={{ fontSize: 12, fill: 'white' }}
              tickMargin={10}
              height={50}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="white"
              tick={{ fontSize: 12, fill: 'white' }}
              tickMargin={10}
              width={55}
              orientation="left"
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="height"
              stroke="#fff"
              strokeWidth={3}
              dot={{
                stroke: '#fff',
                strokeWidth: 2,
                r: 4,
                fill: '#9b87f5'
              }}
              activeDot={{
                stroke: '#fff',
                strokeWidth: 2,
                r: 6,
                fill: '#9b87f5'
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TideChart;