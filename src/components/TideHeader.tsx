import React from 'react';
import LocationPicker from './LocationPicker';
import type { Location } from '@/utils/tideUtils';
import { Waves } from 'lucide-react';

interface TideHeaderProps {
  location: Location | null;
  onLocationUpdate: (location: Location) => void;
}

const TideHeader = ({ location, onLocationUpdate }: TideHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-center gap-4 mb-8">
        <Waves className="w-10 h-10 text-blue-400 animate-wave" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Tide Tracker
        </h1>
      </div>
      
      <LocationPicker 
        id="location-picker" 
        name="location" 
        onLocationUpdate={onLocationUpdate}
      />
      
      {location && (
        <div className="text-sm text-blue-200/80 text-center mt-2">
          Showing tide data for {location.name} ({location.lat.toFixed(2)}, {location.lng.toFixed(2)})
        </div>
      )}
    </>
  );
};

export default TideHeader;