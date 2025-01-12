import React from 'react';
import TideChart from './TideChart';
import TideTable from './TideTable';

interface TideViewProps {
  data: any[];
  period: "daily" | "weekly" | "monthly";
  title?: string;
}

const TideView = ({ data, period, title }: TideViewProps) => {
  if (data.length === 0) {
    return (
      <div className="text-center p-4">
        No tide data available for this {period}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold text-tide-blue">{title}</h2>}
      <TideChart data={data} period={period} />
      <TideTable data={data} period={period} />
    </div>
  );
};

export default TideView;