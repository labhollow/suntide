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
  "san-diego": {
    "id": "9410170",
    "name": "San Diego",
    "lat": 32.715556,
    "lng": -117.176667
  },
  "la-jolla": {
    "id": "9410230",
    "name": "La Jolla",
    "lat": 32.866889,
    "lng": -117.257139
  },
  "los-angeles": {
    "id": "9410660",
    "name": "Los Angeles",
    "lat": 33.72,
    "lng": -118.271944
  },
  "santa-monica": {
    "id": "9410840",
    "name": "Santa Monica",
    "lat": 34.0083,
    "lng": -118.5
  },
  "santa-barbara": {
    "id": "9411340",
    "name": "Santa Barbara",
    "lat": 34.404589,
    "lng": -119.692494
  },
  "port-san-luis": {
    "id": "9412110",
    "name": "Port San Luis",
    "lat": 35.168889,
    "lng": -120.754167
  },
  "monterey": {
    "id": "9413450",
    "name": "Monterey",
    "lat": 36.608889,
    "lng": -121.891389
  },
  "san-francisco": {
    "id": "9414290",
    "name": "San Francisco",
    "lat": 37.806306,
    "lng": -122.465889
  },
  "redwood-city": {
    "id": "9414523",
    "name": "Redwood City",
    "lat": 37.506814,
    "lng": -122.211906
  },
  "alameda": {
    "id": "9414750",
    "name": "Alameda",
    "lat": 37.771953,
    "lng": -122.300261
  },
  "richmond": {
    "id": "9414863",
    "name": "Richmond",
    "lat": 37.928299,
    "lng": -122.400002
  },
  "point-reyes": {
    "id": "9415020",
    "name": "Point Reyes",
    "lat": 37.994167,
    "lng": -122.973611
  },
  "martinez-amorco-pier": {
    "id": "9415102",
    "name": "Martinez-Amorco Pier",
    "lat": 38.034639,
    "lng": -122.125194
  },
  "port-chicago": {
    "id": "9415144",
    "name": "Port Chicago",
    "lat": 38.056,
    "lng": -122.0395
  },
  "arena-cove": {
    "id": "9416841",
    "name": "Arena Cove",
    "lat": 38.914556,
    "lng": -123.711083
  },
  "north-spit": {
    "id": "9418767",
    "name": "North Spit",
    "lat": 40.76691,
    "lng": -124.21734
  },
  "crescent-city": {
    "id": "9419750",
    "name": "Crescent City",
    "lat": 41.74561,
    "lng": -124.18439
  }
};