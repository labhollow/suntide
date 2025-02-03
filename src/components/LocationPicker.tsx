import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, History, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
import {
  NOAAStation,
  fetchNearbyStations,
  getCachedStations,
  searchStations,
  importStations
} from "@/services/noaaStationService";

interface LocationPickerProps {
  id?: string;
  name?: string;
  onLocationUpdate?: (location: { name: string; lat: number; lng: number }) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ id, name, onLocationUpdate }) => {
  const [open, setOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<NOAAStation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [stations, setStations] = useState<NOAAStation[]>([]);
  const [nearbyStations, setNearbyStations] = useState<NOAAStation[]>([]);
  const [searchResults, setSearchResults] = useState<NOAAStation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const toProperCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Load stations on component mount
  useEffect(() => {
    const loadStations = async () => {
      try {
        const fetchedStations = await getCachedStations();
        if (fetchedStations.length === 0) {
          await importStations();
          const importedStations = await getCachedStations();
          setStations(importedStations);
        } else {
          setStations(fetchedStations);
        }

        // Load saved location if it exists
        const savedLocation = localStorage.getItem("savedLocation");
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          const station = fetchedStations.find(s => s.name === location.name);
          if (station) {
            setSelectedStation(station);
          }
        }
      } catch (error) {
        console.error('Error loading stations:', error);
        toast({
          title: "Error",
          description: "Failed to load stations. Please try again.",
          variant: "destructive",
        });
      }
    };
    loadStations();
  }, [toast]);

  useEffect(() => {
    const savedRecent = localStorage.getItem("recentLocations");
    if (savedRecent) {
      try {
        setRecentLocations(JSON.parse(savedRecent));
      } catch (error) {
        console.error('Error loading recent locations:', error);
      }
    }
  }, []);

  useEffect(() => {
    const updateNearbyStations = async () => {
      if (userLocation) {
        setIsLoading(true);
        try {
          const nearby = await fetchNearbyStations(userLocation.lat, userLocation.lng);
          setNearbyStations(nearby);
          
          // Automatically select the nearest station
          if (nearby.length > 0) {
            handleStationSelect(nearby[0]);
          }
        } catch (error) {
          console.error('Error fetching nearby stations:', error);
          toast({
            title: "Error",
            description: "Failed to fetch nearby stations. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    updateNearbyStations();
  }, [userLocation, toast]);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchStations(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching stations:', error);
          toast({
            title: "Error",
            description: "Failed to search stations. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    handleSearch();
  }, [searchTerm, toast]);

  const handleStationSelect = (station: NOAAStation) => {
    const locationData = {
      name: station.name,
      lat: station.lat,
      lng: station.lng,
    };
    
    // Update recent locations
    const updatedRecent = [station.id, ...recentLocations.filter(loc => loc !== station.id)].slice(0, 3);
    setRecentLocations(updatedRecent);
    localStorage.setItem("recentLocations", JSON.stringify(updatedRecent));
    
    // Save selected location and update state
    localStorage.setItem("savedLocation", JSON.stringify(locationData));
    setSelectedStation(station);
    onLocationUpdate?.(locationData);
    setOpen(false);

    toast({
      title: "Location Updated",
      description: `Selected station: ${station.name}`,
    });
  };

  const handleSaveLocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Access Denied",
            description: "Please select a location manually from the list.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please select a location manually.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Group stations by state
  const groupedStations = useMemo(() => {
    const groups: Record<string, NOAAStation[]> = {};
    const stationsToGroup = searchTerm.length >= 2 ? searchResults : stations;
    
    stationsToGroup.forEach(station => {
      const state = station.state || 'International';
      if (!groups[state]) {
        groups[state] = [];
      }
      groups[state].push(station);
    });
    
    return groups;
  }, [stations, searchResults, searchTerm]);

  return (
    <Card className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-card-background backdrop-blur-sm border-neutral-200">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <MapPin className="text-blue-600 hidden sm:block" />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-slate-900 border-neutral-200 text-white font-normal truncate hover:bg-neutral-50"
            >
              {selectedStation
                ? toProperCase(selectedStation.name)
                : "Select location..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[calc(100vw-2rem)] sm:w-[300px] p-0 bg-white/95 backdrop-blur-sm border-neutral-200 shadow-lg"
            align="start"
            sideOffset={4}
          >
            <Command className="bg-transparent">
              <CommandInput 
                placeholder="Search locations..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="text-neutral-700"
              />
              <CommandList className="max-h-[50vh] overflow-y-auto">
                <CommandEmpty className="py-6 text-center text-neutral-600">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "No location found."
                  )}
                </CommandEmpty>
                
                {nearbyStations.length > 0 && !searchTerm && (
                  <CommandGroup heading="Nearby Stations" className="text-neutral-500">
                    {nearbyStations.map((station) => (
                      <CommandItem
                        key={station.id}
                        value={`nearby-${station.id}`}
                        onSelect={() => handleStationSelect(station)}
                        className="bg-white text-neutral-600 hover:bg-neutral-50 font-normal"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{toProperCase(station.name)}</span>
                          <span className="text-sm text-blue-600">
                            ({Math.round(station.distance || 0)}mi)
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                    <CommandSeparator className="bg-neutral-100" />
                  </CommandGroup>
                )}
                
                {recentLocations.length > 0 && !searchTerm && (
                  <CommandGroup heading="Recent" className="text-neutral-500">
                    {recentLocations.map((id) => {
                      const station = stations.find(s => s.id === id);
                      if (!station) return null;
                      return (
                        <CommandItem
                          key={id}
                          value={`recent-${id}`}
                          onSelect={() => handleStationSelect(station)}
                          className="bg-white text-neutral-600 hover:bg-neutral-50 font-normal"
                        >
                          <History className="mr-2 h-4 w-4" />
                          {toProperCase(station.name)}
                        </CommandItem>
                      );
                    })}
                    <CommandSeparator className="bg-neutral-100" />
                  </CommandGroup>
                )}
                
                {Object.entries(groupedStations).map(([state, stateStations]) => (
                  <CommandGroup key={state} heading={state} className="text-neutral-500">
                    {stateStations.map((station) => (
                      <CommandItem
                        key={station.id}
                        value={`${state}-${station.name}`}
                        onSelect={() => handleStationSelect(station)}
                        className="bg-white text-neutral-600 hover:bg-neutral-50 font-normal"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{toProperCase(station.name)}</span>
                          {station.distance && (
                            <span className="text-sm text-blue-600">
                              ({Math.round(station.distance)}mi)
                            </span>
                          )}
                        </div>
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
        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white whitespace-nowrap flex-shrink-0 font-normal"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Finding...
          </>
        ) : (
          "Find Closest Station"
        )}
      </Button>
    </Card>
  );
};

export default LocationPicker;
