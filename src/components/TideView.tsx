import React from 'react';
import TideChart from './TideChart';
import TideTable from './TideTable';
import { Loader2 } from 'lucide-react';

interface TideViewProps {
  data: any[];
  period: "daily" | "weekly" | "monthly";
  title?: string;
  isLoading?: boolean;
}

const TideView = ({ data, period, title, isLoading = false }: TideViewProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-4 text-gray-400">
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