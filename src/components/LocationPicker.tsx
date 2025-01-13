import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NOAA_STATIONS } from "@/utils/noaaApi";

interface LocationPickerProps {
  id?: string;
  name?: string;
  onLocationUpdate?: (location: { name: string; lat: number; lng: number }) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ id, name, onLocationUpdate }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
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
    try {
      if (!NOAA_STATIONS || typeof NOAA_STATIONS !== 'object') {
        console.log('NOAA_STATIONS is undefined or not an object');
        return [];
      }

      const entries = Object.entries(NOAA_STATIONS).filter(Boolean);
      if (!entries || entries.length === 0) {
        console.log('No valid entries found in NOAA_STATIONS');
        return [];
      }

      return entries
        .filter(([_, station]) => 
          station && 
          typeof station === 'object' && 
          station.name && 
          station.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (!a[1]?.name || !b[1]?.name) return 0;
          return a[1].name.localeCompare(b[1].name);
        })
        .slice(0, 100); // Limit results to improve performance
    } catch (error) {
      console.error('Error filtering stations:', error);
      return [];
    }
  }, [searchTerm]);

  const handleStationSelect = (stationKey: string) => {
    try {
      const station = NOAA_STATIONS?.[stationKey];
      if (!station || !station.name || typeof station.lat !== 'number' || typeof station.lng !== 'number') {
        console.error('Invalid station data:', station);
        toast({
          title: "Error",
          description: "Invalid station data. Please try another location.",
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
      setSelectedLocation(locationData.name);
      setOpen(false);
    } catch (error) {
      console.error('Error selecting station:', error);
      toast({
        title: "Error",
        description: "Could not select this location. Please try another one.",
        variant: "destructive",
      });
    }
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

  return (
    <Card className="p-4 flex gap-4 items-center bg-white/5 backdrop-blur-sm border-white/10">
      <MapPin className="text-blue-400" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between bg-white/10 border-white/10 text-white"
          >
            {selectedLocation || "Select location..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-slate-800 border-white/10">
          <Command>
            <CommandInput 
              placeholder="Search locations..." 
              className="h-9 text-white bg-transparent"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty className="text-white/50 py-2">No location found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {filteredStations.map(([key, station]) => (
                <CommandItem
                  key={key}
                  value={station.name}
                  onSelect={() => handleStationSelect(key)}
                  className="text-white hover:bg-white/10"
                >
                  {toProperCase(station.name)}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Button onClick={handleSaveLocation} variant="default" className="bg-blue-500 hover:bg-blue-600">
        Save Custom Location
      </Button>
    </Card>
  );
};

export default LocationPicker;