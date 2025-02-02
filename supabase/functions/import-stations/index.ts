import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting station import process...');
    
    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch stations from NOAA API
    console.log('Fetching stations from NOAA API...');
    const response = await fetch('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json');
    const data = await response.json();
    
    if (!data.stations) {
      throw new Error('No stations found in NOAA API response');
    }

    console.log(`Found ${data.stations.length} stations`);

    // Process each station
    let importedCount = 0;
    for (const station of data.stations) {
      // Only import stations with water level observations
      if (station.observations?.includes('water_level')) {
        console.log(`Processing station ${station.id}: ${station.name}`);
        
        try {
          const { error } = await supabaseClient.rpc('insert_station', {
            station_id: station.id,
            station_name: station.name,
            station_lat: station.lat,
            station_lng: station.lng,
            station_state: station.state || null
          });

          if (error) {
            console.error(`Error inserting station ${station.id}:`, error);
          } else {
            importedCount++;
          }
        } catch (error) {
          console.error(`Failed to process station ${station.id}:`, error);
        }
      }
    }

    console.log(`Station import completed. Imported ${importedCount} stations`);

    return new Response(
      JSON.stringify({ message: `Imported ${importedCount} stations successfully` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});