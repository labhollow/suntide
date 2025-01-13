import React from "react";
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
  const [location, setLocation] = React.useState("");
  const { toast } = useToast();

  const handleStationSelect = (stationKey: string) => {
    const locationData = {
      name: NOAA_STATIONS[stationKey].name,
      lat: NOAA_STATIONS[stationKey].lat,
      lng: NOAA_STATIONS[stationKey].lng,
    };
    localStorage.setItem("savedLocation", JSON.stringify(locationData));
    onLocationUpdate?.(locationData);
    setLocation(locationData.name);
    toast({
      title: "Location updated",
      description: `Now showing tide data for ${locationData.name}`,
    });
  };

  const handleSaveLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            name: location,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          localStorage.setItem("savedLocation", JSON.stringify(locationData));
          onLocationUpdate?.(locationData);
          toast({
            title: "Location saved",
            description: `Saved ${location} for tide tracking`,
          });
        },
        (error) => {
          toast({
            title: "Error saving location",
            description: "Please enable location services and try again",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location services not available",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 flex gap-4 items-center bg-white/5 backdrop-blur-sm border-white/10">
      <MapPin className="text-blue-400" />
      <Select onValueChange={handleStationSelect}>
        <SelectTrigger className="w-[180px] bg-white/10 border-white/10 text-white">
          <SelectValue placeholder="Select station" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/10">
          {Object.entries(NOAA_STATIONS).map(([key, station]) => (
            <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
              {station.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        name={name}
        placeholder="Or enter custom location name"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
      />
      <Button onClick={handleSaveLocation} variant="default" className="bg-blue-500 hover:bg-blue-600">
        Save Custom Location
      </Button>
    </Card>
  );
};

export default LocationPicker;