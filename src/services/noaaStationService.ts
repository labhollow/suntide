import { supabase } from "@/integrations/supabase/client";

export interface NOAAStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  state?: string;
  distance?: number;
  region?: string;
}

export const importStations = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('import-stations');
    if (error) throw error;
    console.log('Stations imported:', data);
  } catch (error) {
    console.error('Error importing stations:', error);
    throw error;
  }
};

export const fetchNearbyStations = async (lat: number, lng: number, radius: number = 50): Promise<NOAAStation[]> => {
  const { data, error } = await supabase
    .rpc('get_nearby_stations', { 
      search_lat: lat,
      search_lng: lng,
      radius: radius,
      max_stations: 50
    });

  if (error) {
    console.error('Error fetching nearby stations:', error);
    return [];
  }

  return (data as any[]).map((station: any) => ({
    ...station,
    region: station.state || 'International'
  }));
};

export const getCachedStations = async (): Promise<NOAAStation[]> => {
  const { data, error } = await supabase
    .from('noaa_stations')
    .select('*')
    .order('state', { ascending: true });

  if (error) {
    console.error('Error fetching stations:', error);
    return [];
  }

  return data.map((station: any) => ({
    ...station,
    region: station.state || 'International'
  }));
};

export const searchStations = async (searchTerm: string): Promise<NOAAStation[]> => {
  const { data, error } = await supabase
    .rpc('search_stations', { 
      search_term: searchTerm,
      max_results: 50
    });

  if (error) {
    console.error('Error searching stations:', error);
    return [];
  }

  return (data as any[]).map((station: any) => ({
    ...station,
    region: station.state || 'International'
  }));
};
