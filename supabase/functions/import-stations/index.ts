import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NOAA stations data
const stations = {
  "balboa-pier-newport-beach": {
    "id": "9410583",
    "name": "Balboa Pier, Newport Beach",
    "lat": 33.6,
    "lng": -117.9,
    "state": "California"
  },
  "los-angeles": {
    "id": "9410660",
    "name": "Los Angeles",
    "lat": 33.7197,
    "lng": -118.2722,
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
    "lat": 34.4033,
    "lng": -119.6847,
    "state": "California"
  },
  "port-san-luis": {
    "id": "9412110",
    "name": "Port San Luis",
    "lat": 35.1686,
    "lng": -120.7547,
    "state": "California"
  },
  "monterey": {
    "id": "9413450",
    "name": "Monterey",
    "lat": 36.6033,
    "lng": -121.8883,
    "state": "California"
  },
  "san-francisco": {
    "id": "9414290",
    "name": "San Francisco",
    "lat": 37.8063,
    "lng": -122.4659,
    "state": "California"
  },
  "point-reyes": {
    "id": "9415020",
    "name": "Point Reyes",
    "lat": 37.9963,
    "lng": -122.9758,
    "state": "California"
  },
  "arena-cove": {
    "id": "9416841",
    "name": "Arena Cove",
    "lat": 38.9146,
    "lng": -123.7111,
    "state": "California"
  },
  "north-spit": {
    "id": "9418767",
    "name": "North Spit",
    "lat": 40.7663,
    "lng": -124.2172,
    "state": "California"
  },
  "crescent-city": {
    "id": "9419750",
    "name": "Crescent City",
    "lat": 41.745,
    "lng": -124.1836,
    "state": "California"
  }
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

    // Process each station
    for (const [_, station] of Object.entries(stations)) {
      console.log(`Processing station ${station.id}: ${station.name}`);
      
      const { data, error } = await supabaseClient.rpc('insert_station', {
        station_id: station.id,
        station_name: station.name,
        station_lat: station.lat,
        station_lng: station.lng,
        station_state: station.state
      });

      if (error) {
        console.error(`Error inserting station ${station.id}:`, error);
        throw error;
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