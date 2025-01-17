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

  const findNearestStation = (userLat: number, userLng: number): string | null => {
    let nearestStation = null;
    let shortestDistance = Infinity;

    Object.entries(NOAA_STATIONS).forEach(([key, station]) => {
      const distance = calculateDistance(userLat, userLng, station.lat, station.lng);
      if (distance < shortestDistance && distance <= 100) {
        shortestDistance = distance;
        nearestStation = key;
      }
    });

    return nearestStation;
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
          const nearestStationKey = findNearestStation(
            position.coords.latitude,
            position.coords.longitude
          );

          if (nearestStationKey) {
            handleStationSelect(nearestStationKey);
            toast({
              title: "Location Updated",
              description: `Found nearest station: ${NOAA_STATIONS[nearestStationKey].name}`,
            });
          } else {
            const sfKey = Object.entries(NOAA_STATIONS).find(
              ([_, station]) => station.name.toLowerCase() === "san francisco (golden gate)"
            )?.[0];
            if (sfKey) {
              handleStationSelect(sfKey);
              toast({
                title: "Notice",
                description: "No stations found within 100 miles. Defaulting to San Francisco.",
              });
            }
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          const sfKey = Object.entries(NOAA_STATIONS).find(
            ([_, station]) => station.name.toLowerCase() === "san francisco (golden gate)"
          )?.[0];
          if (sfKey) {
            handleStationSelect(sfKey);
            toast({
              title: "Location Access Denied",
              description: "Defaulting to San Francisco. You can manually select a location.",
            });
          }
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
        // Find the station key by matching the name
        const stationKey = Object.entries(NOAA_STATIONS).find(
          ([_, station]) => station.name.toLowerCase() === parsed.name.toLowerCase()
        )?.[0];
        if (stationKey) {
          setSelectedLocation(stationKey);
          handleStationSelect(stationKey);
        }
      } else {
        // If no saved location, set San Francisco as default
        const sfKey = Object.entries(NOAA_STATIONS).find(
          ([_, station]) => station.name.toLowerCase() === "san francisco (golden gate)"
        )?.[0];
        if (sfKey) {
          setSelectedLocation(sfKey);
          handleStationSelect(sfKey);
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
      <Select value={selectedLocation} onValueChange={handleStationSelect}>
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
      <Button onClick={handleSaveLocation} variant="default" className="bg-blue-500 hover:bg-blue-600">
        Find Closest Station
      </Button>
    </Card>
  );
};

export default LocationPicker;