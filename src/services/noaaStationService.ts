import axios from 'axios';

export interface NOAAStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  region?: string;  // Optional region/state field
  distance?: number; // Added distance field as optional
}

interface NOAAStationsResponse {
  stations: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    state?: string;
  }>;
}

const NOAA_API_BASE_URL = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi';

export const fetchNearbyStations = async (lat: number, lng: number, radius: number = 50): Promise<NOAAStation[]> => {
  try {
    const response = await axios.get<NOAAStationsResponse>(`${NOAA_API_BASE_URL}/stations.json`);
    
    // Calculate distances and filter stations
    const stations = response.data.stations.map(station => ({
      id: station.id,
      name: station.name,
      lat: station.lat,
      lng: station.lng,
      region: station.state || 'International'
    }));

    // Filter stations within radius and sort by distance
    return filterAndSortStations(stations, lat, lng, radius);
  } catch (error) {
    console.error('Error fetching NOAA stations:', error);
    return [];
  }
};

const filterAndSortStations = (
  stations: NOAAStation[],
  userLat: number,
  userLng: number,
  radius: number
): NOAAStation[] => {
  return stations
    .map(station => ({
      ...station,
      distance: calculateDistance(userLat, userLng, station.lat, station.lng)
    }))
    .filter(station => station.distance <= radius)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
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

// Cache for storing fetched stations
let stationsCache: NOAAStation[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const getCachedStations = async (): Promise<NOAAStation[]> => {
  const now = Date.now();
  if (stationsCache && (now - lastFetchTime < CACHE_DURATION)) {
    return stationsCache;
  }

  try {
    const response = await axios.get<NOAAStationsResponse>(`${NOAA_API_BASE_URL}/stations.json`);
    stationsCache = response.data.stations.map(station => ({
      id: station.id,
      name: station.name,
      lat: station.lat,
      lng: station.lng,
      region: station.state || 'International'
    }));
    lastFetchTime = now;
    return stationsCache;
  } catch (error) {
    console.error('Error fetching and caching NOAA stations:', error);
    return stationsCache || [];
  }
};