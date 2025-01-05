import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

const LocationPicker = () => {
  const [location, setLocation] = React.useState("");

  const handleSaveLocation = () => {
    localStorage.setItem("savedLocation", location);
    // Here we would typically also save coordinates for tide calculations
  };

  return (
    <Card className="p-4 flex gap-4 items-center">
      <MapPin className="text-tide-blue" />
      <Input
        placeholder="Enter location"
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