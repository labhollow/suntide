
import React from 'react';
import { Card } from "@/components/ui/card";
import { Moon } from "lucide-react";

interface MoonCardProps {
  moonrise: string | null;
  moonset: string | null;
  phase: string;
  illumination: number;
}

const MoonCard = ({ moonrise, moonset, phase, illumination }: MoonCardProps) => {
  return (
    <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-200">Moon Events</h3>
        <Moon className="w-6 h-6 text-blue-300" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-blue-300">Moonrise</div>
          <div className="text-xl font-semibold text-white">
            {moonrise || 'N/A'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-blue-300">Moonset</div>
          <div className="text-xl font-semibold text-white">
            {moonset || 'N/A'}
          </div>
        </div>
        <div className="col-span-2 mt-2 space-y-1">
          <div className="text-blue-200">{phase}</div>
          <div className="text-sm text-blue-200/70">{illumination}% illuminated</div>
        </div>
      </div>
    </Card>
  );
};

export default MoonCard;