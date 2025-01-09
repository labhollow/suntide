import { addDays, format } from "date-fns";
import SunCalc from "suncalc";

const PROXY_BASE_URL = "http://localhost:3000/api";

interface NOAAResponse {
  predictions?: Array<{
    t: string;
    v: string;
    type: "H" | "L";
  }>;
  error?: {
    message: string;
  };
}

interface TidePrediction {
  t: string;
  v: string;
  type: "H" | "L";
  sunrise?: string;
  sunset?: string;
}

// Helper function to format time to HH:mm format
const formatTime = (date: Date): string => {
  return format(date, "HH:mm");
};

export const fetchTideData = async (
  stationId: string,
  startDate: Date,
  days: number
): Promise<TidePrediction[]> => {
  const endDate = addDays(startDate, days);
  
  const tideParams = new URLSearchParams({
    begin_date: format(startDate, "yyyyMMdd"),
    end_date: format(endDate, "yyyyMMdd"),
    station: stationId,
    product: "predictions",
    datum: "MLLW",
    time_zone: "lst_ldt",
    units: "metric",
    format: "json",
    interval: "hilo"
  });

  try {
    const response = await fetch(`${PROXY_BASE_URL}/datagetter?${tideParams}`);
    const data: NOAAResponse = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      console.error('No predictions in response:', data);
      throw new Error('No tide predictions available for this location');
    }

    // Get station coordinates from NOAA_STATIONS
    const station = Object.values(NOAA_STATIONS).find(s => s.id === stationId);
    if (!station) {
      throw new Error('Station not found');
    }

    // Add sunrise and sunset times to each prediction
    return data.predictions.map(prediction => {
      const date = new Date(prediction.t);
      const times = SunCalc.getTimes(date, station.lat, station.lng);
      
      return {
        ...prediction,
        sunrise: formatTime(times.sunrise),
        sunset: formatTime(times.sunset)
      };
    });
  } catch (error) {
    console.error('Error fetching tide data:', error);
    throw error;
  }
};

// Map of locations to their NOAA station IDs and coordinates
export const NOAA_STATIONS: Record<string, { id: string; name: string; lat: number; lng: number }> = {
  "san-francisco": { 
    id: "9414290", 
    name: "San Francisco",
    lat: 37.8067, 
    lng: -122.4659
  },
  "santa-cruz": { 
    id: "9413745", 
    name: "Santa Cruz",
    lat: 36.9573, 
    lng: -122.0173
  },
  "monterey": { 
    id: "9413450", 
    name: "Monterey",
    lat: 36.6051, 
    lng: -121.8884
  },
  "los-angeles": { 
    id: "9410660", 
    name: "Los Angeles",
    lat: 33.7201, 
    lng: -118.2737
  }
};