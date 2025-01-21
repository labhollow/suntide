import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const { toast } = useToast();

  const toProperCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get nearby stations based on user location
  const nearbyStations = useMemo(() => {
    if (!userLocation) return [];
    
    return Object.entries(NOAA_STATIONS)
      .map(([key, station]) => ({
        key,
        ...station,
        distance: calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [userLocation]);

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
    
    // Update recent locations
    const updatedRecent = [stationKey, ...recentLocations.filter(loc => loc !== stationKey)].slice(0, 3);
    setRecentLocations(updatedRecent);
    localStorage.setItem("recentLocations", JSON.stringify(updatedRecent));
    
    localStorage.setItem("savedLocation", JSON.stringify(locationData));
    onLocationUpdate?.(locationData);
    setSelectedLocation(stationKey);
    setOpen(false);
  };

  const handleSaveLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          const nearestStationKey = Object.entries(NOAA_STATIONS)
            .map(([key, station]) => ({
              key,
              distance: calculateDistance(
                position.coords.latitude,
                position.coords.longitude,
                station.lat,
                station.lng
              )
            }))
            .sort((a, b) => a.distance - b.distance)[0]?.key;

          if (nearestStationKey) {
            handleStationSelect(nearestStationKey);
            toast({
              title: "Location Updated",
              description: `Found nearest station: ${NOAA_STATIONS[nearestStationKey].name}`,
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Access Denied",
            description: "Please select a location manually from the list.",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedLocation");
      const savedRecent = localStorage.getItem("recentLocations");
      
      if (saved) {
        const parsed = JSON.parse(saved);
        const stationKey = Object.entries(NOAA_STATIONS).find(
          ([_, station]) => station.name.toLowerCase() === parsed.name.toLowerCase()
        )?.[0];
        if (stationKey) {
          setSelectedLocation(stationKey);
        }
      }
      
      if (savedRecent) {
        setRecentLocations(JSON.parse(savedRecent));
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }, []);

  // Group stations by state
  const groupedStations = useMemo(() => {
    const groups: Record<string, typeof NOAA_STATIONS> = {};
    
    Object.entries(NOAA_STATIONS).forEach(([key, station]) => {
      if (!groups[station.state]) {
        groups[station.state] = {};
      }
      groups[station.state][key] = station;
    });
    
    return groups;
  }, []);

  return (
    <Card className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white/5 backdrop-blur-sm border-white/10">
      <div className="flex items-center gap-4 flex-1">
        <MapPin className="text-blue-400 hidden sm:block" />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[300px] justify-between bg-white/10 border-white/10 text-white"
            >
              {selectedLocation
                ? toProperCase(NOAA_STATIONS[selectedLocation]?.name)
                : "Select location..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[calc(100vw-2rem)] sm:w-[300px] p-0 bg-slate-800/95 backdrop-blur-sm border-white/10"
            align="start"
            sideOffset={4}
          >
            <Command className="bg-transparent">
              <CommandInput 
                placeholder="Search locations..." 
                className="text-white"
              />
              <CommandList className="max-h-[40vh] overflow-y-auto">
                <CommandEmpty className="py-6 text-center text-white">No location found.</CommandEmpty>
                
                {userLocation && (
                  <CommandGroup heading="Nearby Stations" className="text-blue-200">
                    {nearbyStations.map((station) => (
                      <CommandItem
                        key={station.key}
                        value={`nearby-${station.key}`}
                        onSelect={() => handleStationSelect(station.key)}
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        {toProperCase(station.name)}
                        <span className="ml-2 text-sm text-blue-200">
                          ({Math.round(station.distance)}mi)
                        </span>
                      </CommandItem>
                    ))}
                    <CommandSeparator className="bg-white/10" />
                  </CommandGroup>
                )}
                
                {recentLocations.length > 0 && (
                  <CommandGroup heading="Recent" className="text-blue-200">
                    {recentLocations.map((key) => (
                      <CommandItem
                        key={key}
                        value={`recent-${key}`}
                        onSelect={() => handleStationSelect(key)}
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        <History className="mr-2 h-4 w-4" />
                        {toProperCase(NOAA_STATIONS[key]?.name)}
                      </CommandItem>
                    ))}
                    <CommandSeparator className="bg-white/10" />
                  </CommandGroup>
                )}
                
                {Object.entries(groupedStations).map(([state, stations]) => (
                  <CommandGroup key={state} heading={state} className="text-blue-200">
                    {Object.entries(stations).map(([key, station]) => (
                      <CommandItem
                        key={key}
                        value={`${state}-${station.name}`}
                        onSelect={() => handleStationSelect(key)}
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        {toProperCase(station.name)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button 
        onClick={handleSaveLocation} 
        variant="default" 
        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
      >
        Find Closest Station
      </Button>
    </Card>
  );
};

export default LocationPicker;