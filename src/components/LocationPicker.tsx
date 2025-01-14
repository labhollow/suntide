import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [alertDuration, setAlertDuration] = useState(2);
  const { toast } = useToast();

  const toProperCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleStationSelect = (stationKey: string) => {
    const station = NOAA_STATIONS?.[stationKey];
    if (!station) {
      toast({
        title: "Error",
        description: "Could not select this location. Please try another one.",
        variant: "destructive",
      });
      return;
    }

    const locationData = {
      name: station.name,
      lat: station.lat,
      lng: station.lng,
    };
    
    localStorage.setItem("savedLocation", JSON.stringify(locationData));
    onLocationUpdate?.(locationData);
    setSelectedLocation(stationKey);
  };

  const handleSaveLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            name: selectedLocation || "Custom Location",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          localStorage.setItem("savedLocation", JSON.stringify(locationData));
          onLocationUpdate?.(locationData);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Error",
            description: "Could not get your location. Please try again.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedLocation");
      if (saved) {
        const parsed = JSON.parse(saved);
        const stationKey = Object.entries(NOAA_STATIONS || {}).find(
          ([_, station]) => station.name.toLowerCase() === parsed.name.toLowerCase()
        )?.[0];
        if (stationKey) {
          setSelectedLocation(stationKey);
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }, []);

  const stationsList = Object.entries(NOAA_STATIONS || {})
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .slice(0, 100);

  return (
    <Card className="p-4 flex gap-4 items-center bg-white/5 backdrop-blur-sm border-white/10">
      <MapPin className="text-blue-400" />
      <Select onValueChange={handleStationSelect} value={selectedLocation}>
        <SelectTrigger className="w-[300px] bg-white/10 border-white/10 text-white">
          <SelectValue placeholder="Select location..." />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/10">
          {stationsList.map(([key, station]) => (
            <SelectItem 
              key={key} 
              value={key}
              className="text-white hover:bg-white/10"
            >
              {toProperCase(station.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-4">
        <Select
          value={alertDuration.toString()}
          onValueChange={(value) => setAlertDuration(Number(value))}
        >
          <SelectTrigger className="w-[120px] bg-white/10 border-white/10 text-white">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="2" className="text-white hover:bg-white/10">2 hours</SelectItem>
            <SelectItem value="4" className="text-white hover:bg-white/10">4 hours</SelectItem>
            <SelectItem value="6" className="text-white hover:bg-white/10">6 hours</SelectItem>
            <SelectItem value="12" className="text-white hover:bg-white/10">12 hours</SelectItem>
            <SelectItem value="24" className="text-white hover:bg-white/10">24 hours</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSaveLocation} variant="default" className="bg-blue-500 hover:bg-blue-600">
          Save Custom Location
        </Button>
      </div>
    </Card>
  );
};

export default LocationPicker;