import React from 'react';
import LocationPicker from './LocationPicker';
import type { Location } from '@/utils/tideUtils';

interface TideHeaderProps {
  location: Location | null;
  onLocationUpdate: (location: Location) => void;
}

const TideHeader = ({ location, onLocationUpdate }: TideHeaderProps) => {
  return (
    <>
      <h1 className="text-4xl font-bold text-tide-blue text-center mb-8 animate-wave">
        Tide Tracker
      </h1>
      
      <LocationPicker 
        id="location-picker" 
        name="location" 
        onLocationUpdate={onLocationUpdate}
      />
      
      {location && (
        <div className="text-sm text-muted-foreground text-center">
          Showing tide data for {location.name} ({location.lat.toFixed(2)}, {location.lng.toFixed(2)})
        </div>
      )}
    </>
  );
};

export default TideHeader;