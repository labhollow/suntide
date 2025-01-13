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
    "bucksport": {
        "id": "9418778",
        "name": "Bucksport",
        "lat": 40.7783,
        "lng": -124.197,
        "state": "California"
    },
    "wilson-cove,-san-clemente-island": {
        "id": "9410032",
        "name": "Wilson Cove, San Clemente Island",
        "lat": 33.005001068115234,
        "lng": -118.55699920654297,
        "state": "California"
    },
    "san-nicolas-island": {
        "id": "9410068",
        "name": "San Nicolas Island",
        "lat": 33.2667,
        "lng": -119.497,
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
    "cabrillo-beach": {
        "id": "9410650",
        "name": "Cabrillo Beach",
        "lat": 33.7067,
        "lng": -118.273,
        "state": "California"
    },
    "los-angeles-(outer-harbor)": {
        "id": "9410660",
        "name": "LOS ANGELES (Outer Harbor)",
        "lat": 33.72,
        "lng": -118.272,
        "state": "California"
    },
    "long-beach,-terminal-island": {
        "id": "9410680",
        "name": "Long Beach, Terminal Island",
        "lat": 33.7517,
        "lng": -118.227,
        "state": "California"
    },
    "long-beach,-inner-harbor": {
        "id": "9410686",
        "name": "Long Beach, Inner Harbor",
        "lat": 33.7717,
        "lng": -118.21,
        "state": "California"
    },
    "king-harbor,-santa-monica-bay": {
        "id": "9410738",
        "name": "King Harbor, Santa Monica Bay",
        "lat": 33.8467,
        "lng": -118.398,
        "state": "California"
    },
    "el-segundo,-santa-monica-bay": {
        "id": "9410777",
        "name": "El Segundo, Santa Monica Bay",
        "lat": 33.9083,
        "lng": -118.433,
        "state": "California"
    },
    "santa-monica,-municipal-pier": {
        "id": "9410840",
        "name": "Santa Monica, Municipal Pier",
        "lat": 34.0083,
        "lng": -118.5,
        "state": "California"
    },
    "bechers-bay,-santa-rosa-island": {
        "id": "9410962",
        "name": "Bechers Bay, Santa Rosa Island",
        "lat": 34.0083,
        "lng": -120.047,
        "state": "California"
    },
    "prisoners-harbor,-santa-cruz-island": {
        "id": "9410971",
        "name": "Prisoners Harbor, Santa Cruz Island",
        "lat": 34.02,
        "lng": -119.683,
        "state": "California"
    },
    "cuyler-harbor,-san-miguel-island": {
        "id": "9410988",
        "name": "Cuyler Harbor, San Miguel Island",
        "lat": 34.0567,
        "lng": -120.355,
        "state": "California"
    },
    "port-hueneme": {
        "id": "9411065",
        "name": "Port Hueneme",
        "lat": 34.1483,
        "lng": -119.203,
        "state": "California"
    },
    "ventura": {
        "id": "9411189",
        "name": "Ventura",
        "lat": 34.2667,
        "lng": -119.283,
        "state": "California"
    },
    "rincon-island,-mussel-shoals": {
        "id": "9411270",
        "name": "Rincon Island, Mussel Shoals",
        "lat": 34.3483,
        "lng": -119.443,
        "state": "California"
    },
    "santa-barbara": {
        "id": "9411340",
        "name": "Santa Barbara",
        "lat": 34.40458888888889,
        "lng": -119.6924944444445,
        "state": "California"
    },
    "gaviota-state-park,-pacific-ocean": {
        "id": "9411399",
        "name": "Gaviota State Park, Pacific Ocean",
        "lat": 34.46938888888889,
        "lng": -120.2283055555556,
        "state": "California"
    },
    "port-san-luis": {
        "id": "9412110",
        "name": "PORT SAN LUIS",
        "lat": 35.16888888888889,
        "lng": -120.7541666666667,
        "state": "California"
    },
    "san-simeon": {
        "id": "9412553",
        "name": "San Simeon",
        "lat": 35.6417,
        "lng": -121.188,
        "state": "California"
    },
    "mansfield-cone": {
        "id": "9412802",
        "name": "Mansfield Cone",
        "lat": 35.94952777777777,
        "lng": -121.4819444444445,
        "state": "California"
    },
    "carmel-cove,-carmel-bay": {
        "id": "9413375",
        "name": "Carmel Cove, Carmel Bay",
        "lat": 36.52,
        "lng": -121.94,
        "state": "California"
    },
    "monterey,-monterey-bay": {
        "id": "9413450",
        "name": "MONTEREY, MONTEREY BAY",
        "lat": 36.6088889,
        "lng": -121.8913889,
        "state": "California"
    },
    "moss-landing,-ocean-pier": {
        "id": "9413616",
        "name": "Moss Landing, Ocean Pier",
        "lat": 36.8017,
        "lng": -121.79,
        "state": "California"
    },
    "general-fish-company-pier": {
        "id": "9413617",
        "name": "General Fish Company Pier",
        "lat": 36.8017,
        "lng": -121.787,
        "state": "California"
    },
    "elkhorn-slough,-highway-1-bridge": {
        "id": "9413623",
        "name": "Elkhorn Slough, Highway 1 Bridge",
        "lat": 36.81,
        "lng": -121.785,
        "state": "California"
    },
    "pacific-mariculture-dock": {
        "id": "9413624",
        "name": "Pacific Mariculture Dock",
        "lat": 36.8133,
        "lng": -121.758,
        "state": "California"
    },
    "elkhorn-yacht-club": {
        "id": "9413626",
        "name": "Elkhorn Yacht Club",
        "lat": 36.8133,
        "lng": -121.787,
        "state": "California"
    },
    "elkhorn,-elkhorn-slough": {
        "id": "9413631",
        "name": "Elkhorn, Elkhorn Slough",
        "lat": 36.81829833984375,
        "lng": -121.74700164794922,
        "state": "California"
    },
    "tidal-creek,-elkhorn-slough": {
        "id": "9413643",
        "name": "Tidal Creek, Elkhorn Slough",
        "lat": 36.83330154418945,
        "lng": -121.74500274658203,
        "state": "California"
    },
    "kirby-park,-elkhorn-slough": {
        "id": "9413651",
        "name": "Kirby Park, Elkhorn Slough",
        "lat": 36.84130096435547,
        "lng": -121.74530029296875,
        "state": "California"
    },
    "elkhorn-slough-railroad-bridge": {
        "id": "9413663",
        "name": "Elkhorn Slough railroad bridge",
        "lat": 36.85667,
        "lng": -121.755,
        "state": "California"
    },
    "santa-cruz,-monterey-bay": {
        "id": "9413745",
        "name": "Santa Cruz, Monterey Bay",
        "lat": 36.9583,
        "lng": -122.017,
        "state": "California"
    },
    "ano-nuevo-island": {
        "id": "9413878",
        "name": "Ano Nuevo Island",
        "lat": 37.1083,
        "lng": -122.338,
        "state": "California"
    },
    "pillar-point-harbor,-half-moon-bay": {
        "id": "9414131",
        "name": "Pillar Point Harbor, Half Moon Bay",
        "lat": 37.5025,
        "lng": -122.4821666666667,
        "state": "California"
    },
    "southeast-farallon-island": {
        "id": "9414262",
        "name": "Southeast Farallon Island",
        "lat": 37.7,
        "lng": -123.0,
        "state": "California"
    },
    "ocean-beach,-outer-coast": {
        "id": "9414275",
        "name": "Ocean Beach, outer coast",
        "lat": 37.775,
        "lng": -122.513,
        "state": "California"
    },
    "san-francisco-(golden-gate)": {
        "id": "9414290",
        "name": "SAN FRANCISCO (Golden Gate)",
        "lat": 37.80630555555555,
        "lng": -122.4658888888889,
        "state": "California"
    },
    "san-francisco,-north-point,-pier-41": {
        "id": "9414305",
        "name": "San Francisco, North Point, Pier 41",
        "lat": 37.81,
        "lng": -122.413,
        "state": "California"
    },
    "rincon-point,-pier-22-1/2": {
        "id": "9414317",
        "name": "Rincon Point, Pier 22 1/2",
        "lat": 37.79,
        "lng": -122.387,
        "state": "California"
    },
    "potrero-point": {
        "id": "9414334",
        "name": "Potrero Point",
        "lat": 37.7583,
        "lng": -122.383,
        "state": "California"
    },
    "hunters-point": {
        "id": "9414358",
        "name": "Hunters Point",
        "lat": 37.73,
        "lng": -122.357,
        "state": "California"
    },
    "borden-highway-bridge,-san-joaquin-river": {
        "id": "9414367",
        "name": "Borden Highway Bridge, San Joaquin River",
        "lat": 37.93666666666701,
        "lng": -121.33333333333005,
        "state": "California"
    },
    "south-san-francisco": {
        "id": "9414391",
        "name": "South San Francisco",
        "lat": 37.6667,
        "lng": -122.39,
        "state": "California"
    },
    "oyster-point-marina": {
        "id": "9414392",
        "name": "Oyster Point Marina",
        "lat": 37.665,
        "lng": -122.377,
        "state": "California"
    },
    "point-san-bruno": {
        "id": "9414402",
        "name": "Point San Bruno",
        "lat": 37.65,
        "lng": -122.377,
        "state": "California"
    },
    "seaplane-harbor": {
        "id": "9414413",
        "name": "Seaplane Harbor",
        "lat": 37.6367,
        "lng": -122.383,
        "state": "California"
    },
    "coyote-point-marina": {
        "id": "9414449",
        "name": "Coyote Point Marina",
        "lat": 37.5917,
        "lng": -122.313,
        "state": "California"
    },
    "san-mateo-bridge-(west-end)": {
        "id": "9414458",
        "name": "San Mateo Bridge (west end)",
        "lat": 37.58,
        "lng": -122.253,
        "state": "California"
    },
    "bay-slough,-west-end": {
        "id": "9414483",
        "name": "Bay Slough, west end",
        "lat": 37.5517,
        "lng": -122.243,
        "state": "California"
    },
    "bay-slough,-east-end": {
        "id": "9414486",
        "name": "Bay Slough, east end",
        "lat": 37.545,
        "lng": -122.222,
        "state": "California"
    },
    "redwood-creek-marker-8": {
        "id": "9414501",
        "name": "Redwood Creek Marker 8",
        "lat": 37.5333,
        "lng": -122.193,
        "state": "California"
    },
    "corkscrew-slough": {
        "id": "9414505",
        "name": "Corkscrew Slough",
        "lat": 37.5083,
        "lng": -122.21,
        "state": "California"
    },
    "newark-slough": {
        "id": "9414506",
        "name": "Newark Slough",
        "lat": 37.5133,
        "lng": -122.08,
        "state": "California"
    },
    "west-point-slough": {
        "id": "9414507",
        "name": "West Point Slough",
        "lat": 37.505,
        "lng": -122.192,
        "state": "California"
    },
    "dumbarton-highway-bridge": {
        "id": "9414509",
        "name": "Dumbarton Highway Bridge",
        "lat": 37.5067,
        "lng": -122.115,
        "state": "California"
    },
    "smith-slough": {
        "id": "9414511",
        "name": "Smith Slough",
        "lat": 37.5017,
        "lng": -122.223,
        "state": "California"
    },
    "granite-rock,-redwood-creek": {
        "id": "9414513",
        "name": "Granite Rock, Redwood Creek",
        "lat": 37.495,
        "lng": -122.213,
        "state": "California"
    },
    "mowry-slough": {
        "id": "9414519",
        "name": "Mowry Slough",
        "lat": 37.4933,
        "lng": -122.042,
        "state": "California"
    },
    "redwood-city,-wharf-5": {
        "id": "9414523",
        "name": "Redwood City, Wharf 5",
        "lat": 37.50681388888889,
        "lng": -122.2119055555556,
        "state": "California"
    },
    "palo-alto-yacht-harbor": {
        "id": "9414525",
        "name": "Palo Alto Yacht Harbor",
        "lat": 37.4583,
        "lng": -122.105,
        "state": "California"
    },
    "calaveras-point,-west-of": {
        "id": "9414539",
        "name": "Calaveras Point, west of",
        "lat": 37.4667,
        "lng": -122.067,
        "state": "California"
    },
    "upper-guadalupe-slough": {
        "id": "9414549",
        "name": "Upper Guadalupe Slough",
        "lat": 37.435,
        "lng": -122.007,
        "state": "California"
    },
    "gold-street-bridge,-alviso-slough": {
        "id": "9414551",
        "name": "Gold Street Bridge, Alviso Slough",
        "lat": 37.4233,
        "lng": -121.975,
        "state": "California"
    },
    "coyote-creek,-tributary-no.1": {
        "id": "9414561",
        "name": "Coyote Creek, Tributary no.1",
        "lat": 37.4467,
        "lng": -121.963,
        "state": "California"
    },
    "coyote-creek,-alviso-slough": {
        "id": "9414575",
        "name": "Coyote Creek, Alviso Slough",
        "lat": 37.465,
        "lng": -122.023,
        "state": "California"
    },
    "south-bay-wreck": {
        "id": "9414609",
        "name": "South Bay Wreck",
        "lat": 37.5517,
        "lng": -122.162,
        "state": "California"
    },
    "coyote-hills-slough-entrance": {
        "id": "9414621",
        "name": "Coyote Hills Slough entrance",
        "lat": 37.5633,
        "lng": -122.128,
        "state": "California"
    },
    "alameda-creek": {
        "id": "9414632",
        "name": "Alameda Creek",
        "lat": 37.595,
        "lng": -122.145,
        "state": "California"
    },
    "san-mateo-bridge-(east-end)": {
        "id": "9414637",
        "name": "San Mateo Bridge (east end)",
        "lat": 37.6083,
        "lng": -122.182,
        "state": "California"
    },
    "san-leandro-marina": {
        "id": "9414688",
        "name": "San Leandro Marina",
        "lat": 37.695,
        "lng": -122.192,
        "state": "California"
    },
    "oakland-airport": {
        "id": "9414711",
        "name": "Oakland Airport",
        "lat": 37.7317,
        "lng": -122.208,
        "state": "California"
    },
    "san-leandro-channel,-san-leandro-bay": {
        "id": "9414724",
        "name": "San Leandro Channel, San Leandro Bay",
        "lat": 37.7483,
        "lng": -122.235,
        "state": "California"
    },
    "oakland-harbor,-park-street-bridge": {
        "id": "9414746",
        "name": "Oakland Harbor, Park Street Bridge",
        "lat": 37.7717,
        "lng": -122.235,
        "state": "California"
    },
    "alameda": {
        "id": "9414750",
        "name": "Alameda",
        "lat": 37.77195277777778,
        "lng": -122.3002611111111,
        "state": "California"
    },
    "oakland-harbor,-grove-street": {
        "id": "9414763",
        "name": "Oakland Harbor, Grove Street",
        "lat": 37.795,
        "lng": -122.283,
        "state": "California"
    },
    "oakland-inner-harbor": {
        "id": "9414764",
        "name": "Oakland Inner Harbor",
        "lat": 37.795,
        "lng": -122.282,
        "state": "California"
    },
    "oakland-pier": {
        "id": "9414765",
        "name": "Oakland Pier",
        "lat": 37.795,
        "lng": -122.33,
        "state": "California"
    },
    "alameda-naval-air-station": {
        "id": "9414767",
        "name": "Alameda Naval Air Station",
        "lat": 37.7933,
        "lng": -122.315,
        "state": "California"
    },
    "oakland-middle-harbor": {
        "id": "9414777",
        "name": "Oakland Middle Harbor",
        "lat": 37.805,
        "lng": -122.338,
        "state": "California"
    },
    "oakland,-matson-wharf": {
        "id": "9414779",
        "name": "Oakland, Matson Wharf",
        "lat": 37.81,
        "lng": -122.327,
        "state": "California"
    },
    "yerba-buena-island": {
        "id": "9414782",
        "name": "Yerba Buena Island",
        "lat": 37.81,
        "lng": -122.36,
        "state": "California"
    },
    "grant-line-canal-(drawbridge)": {
        "id": "9414785",
        "name": "Grant Line Canal (drawbridge)",
        "lat": 37.82,
        "lng": -121.447,
        "state": "California"
    },
    "alcatraz-island": {
        "id": "9414792",
        "name": "Alcatraz Island",
        "lat": 37.8267,
        "lng": -122.417,
        "state": "California"
    },
    "sausalito": {
        "id": "9414806",
        "name": "Sausalito",
        "lat": 37.8467,
        "lng": -122.477,
        "state": "California"
    },
    "bradmoor-island,-nurse-slough": {
        "id": "9414811",
        "name": "Bradmoor Island, Nurse Slough",
        "lat": 38.1833,
        "lng": -121.923,
        "state": "California"
    },
    "berkeley": {
        "id": "9414816",
        "name": "Berkeley",
        "lat": 37.8650016784668,
        "lng": -122.30699920654297,
        "state": "California"
    },
    "angel-island-(west-side)": {
        "id": "9414817",
        "name": "Angel Island (west side)",
        "lat": 37.86,
        "lng": -122.443,
        "state": "California"
    },
    "angel-island,-east-garrison": {
        "id": "9414818",
        "name": "Angel Island, East Garrison",
        "lat": 37.8633,
        "lng": -122.42,
        "state": "California"
    },
    "sausalito,-corps-of-engineers-dock": {
        "id": "9414819",
        "name": "Sausalito, Corps of Engineers Dock",
        "lat": 37.865,
        "lng": -122.493,
        "state": "California"
    },
    "borden-highway-bridge,-middle-river": {
        "id": "9414835",
        "name": "Borden Highway Bridge, Middle River",
        "lat": 37.8917,
        "lng": -121.488,
        "state": "California"
    },
    "borden-highway-bridge,-old-river": {
        "id": "9414836",
        "name": "Borden Highway Bridge, Old River",
        "lat": 37.8833,
        "lng": -121.577,
        "state": "California"
    },
    "point-chauncey": {
        "id": "9414837",
        "name": "Point Chauncey",
        "lat": 37.8917,
        "lng": -122.443,
        "state": "California"
    },
    "point-isabel": {
        "id": "9414843",
        "name": "Point Isabel",
        "lat": 37.8983,
        "lng": -122.32,
        "state": "California"
    },
    "richmond-inner-harbor": {
        "id": "9414849",
        "name": "Richmond Inner Harbor",
        "lat": 37.91,
        "lng": -122.358,
        "state": "California"
    },
    "chevron-oil-company-pier,-richmond": {
        "id": "9414863",
        "name": "Chevron Oil Company Pier, Richmond",
        "lat": 37.92829895019531,
        "lng": -122.4000015258789,
        "state": "California"
    },
    "holt,-whiskey-slough": {
        "id": "9414866",
        "name": "Holt, Whiskey Slough",
        "lat": 37.935,
        "lng": -121.435,
        "state": "California"
    },
    "orwood,-old-river": {
        "id": "9414868",
        "name": "Orwood, Old River",
        "lat": 37.9383,
        "lng": -121.56,
        "state": "California"
    },
    "point-san-quentin": {
        "id": "9414873",
        "name": "Point San Quentin",
        "lat": 37.945,
        "lng": -122.475,
        "state": "California"
    },
    "corte-madera-creek": {
        "id": "9414874",
        "name": "Corte Madera Creek",
        "lat": 37.94329833984375,
        "lng": -122.51300048828125,
        "state": "California"
    },
    "point-orient": {
        "id": "9414881",
        "name": "Point Orient",
        "lat": 37.9583,
        "lng": -122.425,
        "state": "California"
    },
    "stockton": {
        "id": "9414883",
        "name": "Stockton",
        "lat": 37.9583,
        "lng": -121.29,
        "state": "California"
    },
    "point-bonita,-bonita-cove": {
        "id": "9414906",
        "name": "Point Bonita, Bonita Cove",
        "lat": 37.8183,
        "lng": -122.528,
        "state": "California"
    },
    "bolinas-lagoon": {
        "id": "9414958",
        "name": "Bolinas Lagoon",
        "lat": 37.90800094604492,
        "lng": -122.67849731445312,
        "state": "California"
    },
    "point-san-pedro": {
        "id": "9415009",
        "name": "Point San Pedro",
        "lat": 37.9933,
        "lng": -122.447,
        "state": "California"
    },
    "point-reyes": {
        "id": "9415020",
        "name": "Point Reyes",
        "lat": 37.9941667,
        "lng": -122.9736111,
        "state": "California"
    },
    "blackslough-landing": {
        "id": "9415021",
        "name": "Blackslough Landing",
        "lat": 37.994998931884766,
        "lng": -121.41999816894531,
        "state": "California"
    },
    "gallinas,-gallinas-creek": {
        "id": "9415052",
        "name": "Gallinas, Gallinas Creek",
        "lat": 38.015,
        "lng": -122.503,
        "state": "California"
    },
    "dutch-slough": {
        "id": "9415053",
        "name": "Dutch Slough",
        "lat": 38.0117,
        "lng": -121.638,
        "state": "California"
    },
    "pinole-point": {
        "id": "9415056",
        "name": "Pinole Point",
        "lat": 38.015,
        "lng": -122.363,
        "state": "California"
    },
    "antioch": {
        "id": "9415064",
        "name": "Antioch",
        "lat": 38.02,
        "lng": -121.815,
        "state": "California"
    },
    "hercules,-refugio-landing": {
        "id": "9415074",
        "name": "Hercules, Refugio Landing",
        "lat": 38.0233,
        "lng": -122.292,
        "state": "California"
    },
    "irish-landing,-sand-mound-slough": {
        "id": "9415095",
        "name": "Irish Landing, Sand Mound Slough",
        "lat": 38.0333,
        "lng": -121.583,
        "state": "California"
    },
    "pittsburg,-new-york-slough": {
        "id": "9415096",
        "name": "Pittsburg, New York Slough",
        "lat": 38.0367,
        "lng": -121.88,
        "state": "California"
    },
    "martinez-amorco-pier": {
        "id": "9415102",
        "name": "Martinez-Amorco Pier",
        "lat": 38.03463888888889,
        "lng": -122.1251944444445,
        "state": "California"
    },
    "wards-island,-little-connection-slough": {
        "id": "9415105",
        "name": "Wards Island, Little Connection Slough",
        "lat": 38.04999923706055,
        "lng": -121.49700164794922,
        "state": "California"
    },
    "benicia": {
        "id": "9415111",
        "name": "Benicia",
        "lat": 38.0433,
        "lng": -122.13,
        "state": "California"
    },
    "mallard-island-ferry-wharf": {
        "id": "9415112",
        "name": "Mallard Island Ferry Wharf",
        "lat": 38.0433,
        "lng": -121.918,
        "state": "California"
    },
    "bishop-cut,-disappointment-slough": {
        "id": "9415117",
        "name": "Bishop Cut, Disappointment Slough",
        "lat": 38.045,
        "lng": -121.42,
        "state": "California"
    },
    "selby": {
        "id": "9415142",
        "name": "Selby",
        "lat": 38.0583,
        "lng": -122.243,
        "state": "California"
    },
    "crockett": {
        "id": "9415143",
        "name": "Crockett",
        "lat": 38.0583,
        "lng": -122.223,
        "state": "California"
    },
    "port-chicago,-suisun-bay": {
        "id": "9415144",
        "name": "PORT CHICAGO, SUISUN BAY",
        "lat": 38.056,
        "lng": -122.0395,
        "state": "California"
    },
    "false-river": {
        "id": "9415145",
        "name": "False River",
        "lat": 38.055,
        "lng": -121.657,
        "state": "California"
    },
    "prisoners-point": {
        "id": "9415149",
        "name": "Prisoners Point",
        "lat": 38.0617,
        "lng": -121.555,
        "state": "California"
    },
    "vallejo,-mare-island-strait": {
        "id": "9415165",
        "name": "Vallejo, Mare Island Strait",
        "lat": 38.1117,
        "lng": -122.273,
        "state": "California"
    },
    "collinsville": {
        "id": "9415176",
        "name": "Collinsville",
        "lat": 38.0733,
        "lng": -121.848,
        "state": "California"
    },
    "threemile-slough-entrance": {
        "id": "9415193",
        "name": "Threemile Slough entrance",
        "lat": 38.086700439453125,
        "lng": -121.68499755859375,
        "state": "California"
    },
    "montezuma-slough": {
        "id": "9415205",
        "name": "Montezuma Slough",
        "lat": 38.0767,
        "lng": -121.885,
        "state": "California"
    },
    "mare-island": {
        "id": "9415218",
        "name": "Mare Island",
        "lat": 38.07,
        "lng": -122.25,
        "state": "California"
    },
    "point-buckler": {
        "id": "9415227",
        "name": "Point Buckler",
        "lat": 38.1,
        "lng": -122.033,
        "state": "California"
    },
    "inverness,-tomales-bay": {
        "id": "9415228",
        "name": "Inverness, Tomales Bay",
        "lat": 38.1133,
        "lng": -122.868,
        "state": "California"
    },
    "korths-harbor,-san-joaquin-river": {
        "id": "9415229",
        "name": "Korths Harbor, San Joaquin River",
        "lat": 38.097599029541016,
        "lng": -121.56839752197266,
        "state": "California"
    },
    "threemile-slough": {
        "id": "9415236",
        "name": "Threemile Slough",
        "lat": 38.1067,
        "lng": -121.7,
        "state": "California"
    },
    "petaluma-river-entrance": {
        "id": "9415252",
        "name": "Petaluma River entrance",
        "lat": 38.11530555555556,
        "lng": -122.5056666666667,
        "state": "California"
    },
    "terminous,-south-fork": {
        "id": "9415257",
        "name": "Terminous, South Fork",
        "lat": 38.11,
        "lng": -121.498,
        "state": "California"
    },
    "suisun-slough-entrance": {
        "id": "9415265",
        "name": "Suisun Slough entrance",
        "lat": 38.1283,
        "lng": -122.073,
        "state": "California"
    },
    "pierce-harbor,-goodyear-slough": {
        "id": "9415266",
        "name": "Pierce Harbor, Goodyear Slough",
        "lat": 38.1267,
        "lng": -122.1,
        "state": "California"
    },
    "georgiana-slough-entrance": {
        "id": "9415287",
        "name": "Georgiana Slough entrance",
        "lat": 38.125,
        "lng": -121.578,
        "state": "California"
    },
    "meins-landing,-montezuma-slough": {
        "id": "9415307",
        "name": "Meins Landing, Montezuma Slough",
        "lat": 38.1367,
        "lng": -121.907,
        "state": "California"
    },
    "rio-vista": {
        "id": "9415316",
        "name": "Rio Vista",
        "lat": 38.145,
        "lng": -121.692,
        "state": "California"
    },
    "reynolds,-tomales-bay": {
        "id": "9415320",
        "name": "Reynolds, Tomales Bay",
        "lat": 38.1467,
        "lng": -122.883,
        "state": "California"
    },
    "sonoma-creek": {
        "id": "9415338",
        "name": "Sonoma Creek",
        "lat": 38.1567,
        "lng": -122.407,
        "state": "California"
    },
    "marshall,-tomales-bay": {
        "id": "9415339",
        "name": "Marshall, Tomales Bay",
        "lat": 38.1617,
        "lng": -122.893,
        "state": "California"
    },
    "hog-island,-san-antonio-creek": {
        "id": "9415344",
        "name": "Hog Island, San Antonio Creek",
        "lat": 38.1617,
        "lng": -122.55,
        "state": "California"
    },
    "joice-island,-suisun-slough": {
        "id": "9415379",
        "name": "Joice Island, Suisun Slough",
        "lat": 38.18,
        "lng": -122.045,
        "state": "California"
    },
    "blakes-landing,-tomales-bay": {
        "id": "9415396",
        "name": "Blakes Landing, Tomales Bay",
        "lat": 38.19,
        "lng": -122.917,
        "state": "California"
    },
    "montezuma-slough-bridge": {
        "id": "9415402",
        "name": "Montezuma Slough Bridge",
        "lat": 38.1867,
        "lng": -121.98,
        "state": "California"
    },
    "steamboat-slough,-snug-harbor-marina": {
        "id": "9415414",
        "name": "Steamboat Slough, Snug Harbor Marina",
        "lat": 38.1833,
        "lng": -121.655,
        "state": "California"
    },
    "edgerley-island,-napa-river": {
        "id": "9415415",
        "name": "Edgerley Island, Napa River",
        "lat": 38.1917,
        "lng": -122.312,
        "state": "California"
    },
    "brazos-drawbridge,-napa-river": {
        "id": "9415446",
        "name": "Brazos Drawbridge, Napa River",
        "lat": 38.21,
        "lng": -122.307,
        "state": "California"
    },
    "wingo,-sonoma-creek": {
        "id": "9415447",
        "name": "Wingo, Sonoma Creek",
        "lat": 38.21,
        "lng": -122.427,
        "state": "California"
    },
    "tomales-bay-entrance": {
        "id": "9415469",
        "name": "Tomales Bay entrance",
        "lat": 38.2283,
        "lng": -122.977,
        "state": "California"
    },
    "new-hope-bridge": {
        "id": "9415478",
        "name": "New Hope Bridge",
        "lat": 38.2267,
        "lng": -121.49,
        "state": "California"
    },
    "suisun-city,-suisun-slough": {
        "id": "9415498",
        "name": "Suisun City, Suisun Slough",
        "lat": 38.2367,
        "lng": -122.03,
        "state": "California"
    },
    "snodgrass-slough": {
        "id": "9415565",
        "name": "Snodgrass Slough",
        "lat": 38.2767,
        "lng": -121.495,
        "state": "California"
    },
    "upper-drawbridge,-petaluma-river": {
        "id": "9415584",
        "name": "Upper drawbridge, Petaluma River",
        "lat": 38.2283,
        "lng": -122.613,
        "state": "California"
    },
    "napa,-napa-river": {
        "id": "9415623",
        "name": "Napa, Napa River",
        "lat": 38.2983,
        "lng": -122.28,
        "state": "California"
    },
    "bodega-harbor-entrance": {
        "id": "9415625",
        "name": "Bodega Harbor entrance",
        "lat": 38.3083,
        "lng": -123.055,
        "state": "California"
    },
    "clarksburg": {
        "id": "9415846",
        "name": "Clarksburg",
        "lat": 38.4167,
        "lng": -121.523,
        "state": "California"
    },
    "fort-ross": {
        "id": "9416024",
        "name": "Fort Ross",
        "lat": 38.5133,
        "lng": -123.245,
        "state": "California"
    },
    "sacramento": {
        "id": "9416174",
        "name": "Sacramento",
        "lat": 38.58,
        "lng": -121.507,
        "state": "California"
    },
    "green-cove": {
        "id": "9416409",
        "name": "Green Cove",
        "lat": 38.70433333333333,
        "lng": -123.4493888888889,
        "state": "California"
    },
    "arena-cove": {
        "id": "9416841",
        "name": "ARENA COVE",
        "lat": 38.91455555555556,
        "lng": -123.7110833333333,
        "state": "California"
    },
    "noyo-harbor": {
        "id": "9417426",
        "name": "NOYO HARBOR",
        "lat": 39.42577777777778,
        "lng": -123.8051111111111,
        "state": "California"
    },
    "westport": {
        "id": "9417624",
        "name": "Westport",
        "lat": 39.6333,
        "lng": -123.783,
        "state": "California"
    },
    "shelter-cove": {
        "id": "9418024",
        "name": "Shelter Cove",
        "lat": 40.025001525878906,
        "lng": -124.05799865722656,
        "state": "California"
    },
    "cockrobin-island-bridge,-eel-river": {
        "id": "9418637",
        "name": "Cockrobin Island Bridge, Eel River",
        "lat": 40.63719940185547,
        "lng": -124.2822036743164,
        "state": "California"
    },
    "hookton-slough": {
        "id": "9418686",
        "name": "Hookton Slough",
        "lat": 40.6867,
        "lng": -124.222,
        "state": "California"
    },
    "fields-landing": {
        "id": "9418723",
        "name": "Fields Landing",
        "lat": 40.7233,
        "lng": -124.222,
        "state": "California"
    },
    "elk-river-railroad-bridge": {
        "id": "9418757",
        "name": "Elk River Railroad Bridge",
        "lat": 40.7567,
        "lng": -124.193,
        "state": "California"
    },
    "humboldt-bay-(north-spit)": {
        "id": "9418767",
        "name": "HUMBOLDT BAY (North Spit)",
        "lat": 40.76690555555555,
        "lng": -124.2173444444445,
        "state": "California"
    },
    "eureka": {
        "id": "9418801",
        "name": "Eureka",
        "lat": 40.8067,
        "lng": -124.167,
        "state": "California"
    },
    "eureka-slough-bridge": {
        "id": "9418802",
        "name": "Eureka Slough Bridge",
        "lat": 40.8067,
        "lng": -124.142,
        "state": "California"
    },
    "samoa": {
        "id": "9418817",
        "name": "Samoa",
        "lat": 40.8267,
        "lng": -124.18,
        "state": "California"
    },
    "arcata-wharf": {
        "id": "9418851",
        "name": "Arcata Wharf",
        "lat": 40.85,
        "lng": -124.117,
        "state": "California"
    },
    "mad-river-slough,-arcata-bay": {
        "id": "9418865",
        "name": "Mad River Slough, Arcata Bay",
        "lat": 40.865,
        "lng": -124.148,
        "state": "California"
    },
    "trinidad-harbor": {
        "id": "9419059",
        "name": "Trinidad Harbor",
        "lat": 41.0567,
        "lng": -124.147,
        "state": "California"
    },
    "crescent-city": {
        "id": "9419750",
        "name": "CRESCENT CITY",
        "lat": 41.74561111111111,
        "lng": -124.1843888888889,
        "state": "California"
    },
    "pyramid-point,-smith-river": {
        "id": "9419945",
        "name": "Pyramid Point, Smith River",
        "lat": 41.94525,
        "lng": -124.2009166666667,
        "state": "California"
    },
    "point-loma": {
        "id": "TWC0405",
        "name": "Point Loma",
        "lat": 32.666666666667005,
        "lng": -117.23333333333005,
        "state": "California"
    },
    "quivira-basin,-mission-bay": {
        "id": "TWC0413",
        "name": "Quivira Basin, Mission Bay",
        "lat": 32.76666666666701,
        "lng": -117.23333333333005,
        "state": "California"
    },
    "san-clemente": {
        "id": "TWC0419",
        "name": "San Clemente",
        "lat": 33.416666666667005,
        "lng": -117.61666666666996,
        "state": "California"
    },
    "los-patos-(highway-bridge)": {
        "id": "TWC0427",
        "name": "Los Patos (highway bridge)",
        "lat": 33.71666666666701,
        "lng": -118.05,
        "state": "California"
    },
    "los-angeles-harbor,-mormon-island": {
        "id": "TWC0439",
        "name": "Los Angeles Harbor, Mormon Island",
        "lat": 33.75,
        "lng": -118.26666666666995,
        "state": "California"
    },
    "mugu-lagoon-(ocean-pier)": {
        "id": "TWC0445",
        "name": "Mugu Lagoon (ocean pier)",
        "lat": 34.1,
        "lng": -119.1,
        "state": "California"
    },
    "santa-barbara-island": {
        "id": "TWC0463",
        "name": "Santa Barbara Island",
        "lat": 33.48333333333299,
        "lng": -119.03333333333005,
        "state": "California"
    },
    "point-arguello": {
        "id": "TWC0473",
        "name": "Point Arguello",
        "lat": 34.583333333332995,
        "lng": -120.65,
        "state": "California"
    },
    "san-francisco-bar": {
        "id": "TWC0509",
        "name": "San Francisco Bar",
        "lat": 37.76666666666701,
        "lng": -122.63333333333004,
        "state": "California"
    },
    "roberts-landing,-1.3-miles-west-of": {
        "id": "TWC0547",
        "name": "Roberts Landing, 1.3 miles west of",
        "lat": 37.666666666667005,
        "lng": -122.2,
        "state": "California"
    },
    "lakeville,-petaluma-river": {
        "id": "TWC0649",
        "name": "Lakeville, Petaluma River",
        "lat": 38.2,
        "lng": -122.56666666666995,
        "state": "California"
    },
    "point-arena": {
        "id": "TWC0771",
        "name": "Point Arena",
        "lat": 38.95,
        "lng": -123.73333333333005,
        "state": "California"
    },
    "mendocino,-mendocino-bay": {
        "id": "TWC0777",
        "name": "Mendocino, Mendocino Bay",
        "lat": 39.3,
        "lng": -123.8,
        "state": "California"
    }
};