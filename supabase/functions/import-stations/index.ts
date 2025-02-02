import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import stations from '../../../stations/noaa_stations.json' assert { type: "json" };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting station import process...');
    
    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process each station
    for (const [id, station] of Object.entries(stations)) {
      console.log(`Processing station ${id}: ${station.name}`);
      
      const { data, error } = await supabaseClient.rpc('insert_station', {
        station_id: id,
        station_name: station.name,
        station_lat: station.lat,
        station_lng: station.lng,
        station_state: station.state
      });

      if (error) {
        console.error(`Error inserting station ${id}:`, error);
      }
    }

    console.log('Station import completed successfully');

    return new Response(
      JSON.stringify({ message: 'Stations imported successfully' }),
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