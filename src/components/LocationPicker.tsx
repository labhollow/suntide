import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOAA_STATIONS } from "@/utils/noaaApi";

interface LocationPickerProps {
  id?: string;
  name?: string;
  onLocationUpdate?: (location: { name: string; lat: number; lng: number }) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ id, name, onLocationUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Function to convert text to proper case
  const toProperCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter and sort stations based on search term
  const filteredStations = useMemo(() => {
    return Object.entries(NOAA_STATIONS)
      .filter(([_, station]) => 
        station.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [searchTerm]);

  const handleStationSelect = (stationKey: string) => {
    const locationData = {
      name: NOAA_STATIONS[stationKey].name,
      lat: NOAA_STATIONS[stationKey].lat,
      lng: NOAA_STATIONS[stationKey].lng,
    };
    localStorage.setItem("savedLocation", JSON.stringify(locationData));
    onLocationUpdate?.(locationData);
    setSearchTerm(locationData.name);
    // Toast disabled as requested
    // toast({
    //   title: "Location updated",
    //   description: `Now showing tide data for ${locationData.name}`,
    // });
  };

  const handleSaveLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            name: searchTerm,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          localStorage.setItem("savedLocation", JSON.stringify(locationData));
          onLocationUpdate?.(locationData);
          // Toast disabled as requested
          // toast({
          //   title: "Location saved",
          //   description: `Saved ${searchTerm} for tide tracking`,
          // });
        },
        (error) => {
          // Toast disabled as requested
          // toast({
          //   title: "Error saving location",
          //   description: "Please enable location services and try again",
          //   variant: "destructive",
          // });
        }
      );
    } else {
      // Toast disabled as requested
      // toast({
      //   title: "Location services not available",
      //   description: "Your browser doesn't support location services",
      //   variant: "destructive",
      // });
    }
  };

  return (
    <Card className="p-4 flex gap-4 items-center bg-white/5 backdrop-blur-sm border-white/10">
      <MapPin className="text-blue-400" />
      <Select onValueChange={handleStationSelect}>
        <SelectTrigger className="w-[180px] bg-white/10 border-white/10 text-white">
          <SelectValue placeholder="Select station" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/10 max-h-[300px]">
          {filteredStations.map(([key, station]) => (
            <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
              {toProperCase(station.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        name={name}
        placeholder="Search locations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
      />
      <Button onClick={handleSaveLocation} variant="default" className="bg-blue-500 hover:bg-blue-600">
        Save Custom Location
      </Button>
    </Card>
  );
};

export default LocationPicker;