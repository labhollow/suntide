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
export const NOAA_STATIONS: Record<string, { 
  id: string; 
  name: string; 
  lat: number; 
  lng: number;
  state: string;
}> = {
  "san-diego": {
    "id": "9410170",
    "name": "San Diego",
    "lat": 32.715556,
    "lng": -117.176667,
    "state": "California"
  },
  "la-jolla": {
    "id": "9410230",
    "name": "La Jolla",
    "lat": 32.866889,
    "lng": -117.257139,
    "state": "California"
  },
  "los-patos-(highway-bridge)": {
    "id": "TWC0427",
    "name": "Los Patos (highway bridge)",
    "lat": 33.71666666666701,
    "lng": -118.05,
    "state": "California"
  },
  "los-angeles": {
    "id": "9410660",
    "name": "Los Angeles",
    "lat": 33.72,
    "lng": -118.271944,
    "state": "California"
  },
  "santa-monica": {
    "id": "9410840",
    "name": "Santa Monica",
    "lat": 34.0083,
    "lng": -118.5,
    "state": "California"
  },
  "santa-barbara": {
    "id": "9411340",
    "name": "Santa Barbara",
    "lat": 34.404589,
    "lng": -119.692494,
    "state": "California"
  },
  "port-san-luis": {
    "id": "9412110",
    "name": "Port San Luis",
    "lat": 35.168889,
    "lng": -120.754167,
    "state": "California"
  },
  "monterey": {
    "id": "9413450",
    "name": "Monterey",
    "lat": 36.608889,
    "lng": -121.891389,
    "state": "California"
  },
  "san-francisco": {
    "id": "9414290",
    "name": "San Francisco",
    "lat": 37.806306,
    "lng": -122.465889,
    "state": "California"
  },
  "redwood-city": {
    "id": "9414523",
    "name": "Redwood City",
    "lat": 37.506814,
    "lng": -122.211906,
    "state": "California"
  },
  "alameda": {
    "id": "9414750",
    "name": "Alameda",
    "lat": 37.771953,
    "lng": -122.300261,
    "state": "California"
  },
  "richmond": {
    "id": "9414863",
    "name": "Richmond",
    "lat": 37.928299,
    "lng": -122.400002,
    "state": "California"
  },
  "point-reyes": {
    "id": "9415020",
    "name": "Point Reyes",
    "lat": 37.994167,
    "lng": -122.973611,
    "state": "California"
  },
  "martinez-amorco-pier": {
    "id": "9415102",
    "name": "Martinez-Amorco Pier",
    "lat": 38.034639,
    "lng": -122.125194,
    "state": "California"
  },
  "port-chicago": {
    "id": "9415144",
    "name": "Port Chicago",
    "lat": 38.056,
    "lng": -122.0395,
    "state": "California"
  },
  "arena-cove": {
    "id": "9416841",
    "name": "Arena Cove",
    "lat": 38.914556,
    "lng": -123.711083,
    "state": "California"
  },
  "north-spit": {
    "id": "9418767",
    "name": "North Spit",
    "lat": 40.76691,
    "lng": -124.21734,
    "state": "California"
  },
  "crescent-city": {
    "id": "9419750",
    "name": "Crescent City",
    "lat": 41.74561,
    "lng": -124.18439,
    "state": "California"
  },
  "san-clemente": {
    "id": "TWC0419",
    "name": "San Clemente",
    "lat": 33.416666666667005,
    "lng": -117.61666666666996,
    "state": "California"
  },
  "balboa-pier,-newport-beach": {
    "id": "9410583",
    "name": "Balboa Pier, Newport Beach",
    "lat": 33.6,
    "lng": -117.9,
    "state": "California"
  },
  "santa-ana-river-entrance-(inside)": {
    "id": "9410599",
    "name": "Santa Ana River entrance (inside)",
    "lat": 33.63,
    "lng": -117.958,
    "state": "California"
  },
  "avalon,-santa-catalina-island": {
    "id": "9410079",
    "name": "Avalon, Santa Catalina Island",
    "lat": 33.345001220703125,
    "lng": -118.32499694824219,
    "state": "California"
  },
  "catalina-harbor,-santa-catalina-island": {
    "id": "9410092",
    "name": "Catalina Harbor, Santa Catalina Island",
    "lat": 33.4317,
    "lng": -118.503,
    "state": "California"
  },
  "imperial-beach": {
    "id": "9410120",
    "name": "Imperial Beach",
    "lat": 32.5783,
    "lng": -117.135,
    "state": "California"
  },
  "south-san-diego-bay": {
    "id": "9410135",
    "name": "South San Diego Bay",
    "lat": 32.62910079956055,
    "lng": -117.10780334472656,
    "state": "California"
  },
  "national-city,-san-diego-bay": {
    "id": "9410152",
    "name": "National City, San Diego Bay",
    "lat": 32.665,
    "lng": -117.118,
    "state": "California"
  },
  "san-diego,-quarantine-station": {
    "id": "9410166",
    "name": "San Diego, Quarantine Station",
    "lat": 32.7033,
    "lng": -117.235,
    "state": "California"
  },
  "san-diego-(broadway)": {
    "id": "9410170",
    "name": "SAN DIEGO (Broadway)",
    "lat": 32.71555555555555,
    "lng": -117.1766666666667,
    "state": "California"
  },
  "mission-bay,-campland": {
    "id": "9410196",
    "name": "Mission Bay, Campland",
    "lat": 32.793701171875,
    "lng": -117.22380065917969,
    "state": "California"
  },
  "la-jolla-(scripps-institution-wharf)": {
    "id": "9410230",
    "name": "La Jolla (Scripps Institution Wharf)",
    "lat": 32.86688888888889,
    "lng": -117.2571388888889,
    "state": "California"
  },
  "newport-bay-entrance,-corona-del-mar": {
    "id": "9410580",
    "name": "Newport Bay Entrance, Corona del Mar",
    "lat": 33.6033,
    "lng": -117.883,
    "state": "California"
  }
};