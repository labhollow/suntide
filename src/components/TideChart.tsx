import React from "react";
import { Line } from "recharts";
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
        <Line
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <Line
            type="monotone"
            dataKey="height"
            stroke="#1e3a8a"
            strokeWidth={2}
          />
        </Line>
      </div>
    </Card>
  );
};

export default TideChart;