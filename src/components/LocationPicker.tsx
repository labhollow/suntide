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
    console.log('NOAA_STATIONS:', NOAA_STATIONS);
    
    if (!NOAA_STATIONS || typeof NOAA_STATIONS !== 'object') {
      console.log('NOAA_STATIONS is undefined or not an object');
      return [];
    }

    try {
      // Convert object to array of entries and ensure they are valid
      const entries = Object.entries(NOAA_STATIONS).filter(entry => {
        if (!Array.isArray(entry) || entry.length !== 2) return false;
        const [_, station] = entry;
        return station && typeof station === 'object' && 'name' in station;
      });

      console.log('Filtered entries:', entries);

      if (entries.length === 0) {
        console.log('No valid entries found in NOAA_STATIONS');
        return [];
      }

      // Filter by search term and sort alphabetically
      const filtered = entries
        .filter(([_, station]) => {
          const stationName = station.name?.toLowerCase() || '';
          const searchTermLower = searchTerm.toLowerCase();
          return stationName.includes(searchTermLower);
        })
        .sort((a, b) => {
          const nameA = a[1]?.name || '';
          const nameB = b[1]?.name || '';
          return nameA.localeCompare(nameB);
        })
        .slice(0, 100); // Limit results for performance

      console.log('Final filtered stations:', filtered);
      return filtered;
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
      
      console.log('Selected location data:', locationData);
      
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

  // Ensure we have valid data for the Command component
  const commandItems = Array.isArray(filteredStations) ? filteredStations : [];

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
              {commandItems.map(([key, station]) => (
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