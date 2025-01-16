import React from 'react';
import LocationPicker from './LocationPicker';
import TideAlerts from './TideAlerts';
import type { Location } from '@/utils/tideUtils';
import { Waves, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TideHeaderProps {
  location: Location | null;
  onLocationUpdate: (location: Location) => void;
  upcomingAlerts: Array<{
    date: string;
    time: string;
    type: string;
  }>;
}

const TideHeader = ({ location, onLocationUpdate, upcomingAlerts }: TideHeaderProps) => {
  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="flex items-center justify-center gap-4 mb-8">
        <Waves className="w-10 h-10 text-blue-400 animate-wave" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Suntide
        </h1>
      </div>
      
      <div className="space-y-4 max-w-full">
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-blue-200 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <span>Alert Settings</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <TideAlerts upcomingAlerts={upcomingAlerts} />
          </CollapsibleContent>
        </Collapsible>
        <LocationPicker 
          id="location-picker" 
          name="location" 
          onLocationUpdate={onLocationUpdate}
        />
      </div>
      
      {location && (
        <div className="text-sm text-blue-200/80 text-center mt-2 px-4">
          Showing tide data for {location.name} ({location.lat.toFixed(2)}, {location.lng.toFixed(2)})
        </div>
      )}
    </div>
  );
};

export default TideHeader;