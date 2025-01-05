import React from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

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
  return (
    <Card className="p-6 w-full bg-white/50 backdrop-blur-sm">
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="height"
              stroke="#1e3a8a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TideChart;