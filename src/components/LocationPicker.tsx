import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LocationPickerProps {
  onLocationUpdate?: (location: { name: string; lat: number; lng: number }) => void;
}

const LocationPicker = ({ onLocationUpdate }: LocationPickerProps) => {
  const [location, setLocation] = React.useState("");
  const { toast } = useToast();

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
    <Card className="p-4 flex gap-4 items-center">
      <MapPin className="text-tide-blue" />
      <Input
        placeholder="Enter location name"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Button onClick={handleSaveLocation} variant="default">
        Save Location
      </Button>
    </Card>
  );
};

export default LocationPicker;