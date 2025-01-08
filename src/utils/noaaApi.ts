import { addDays, format } from "date-fns";

const PROXY_BASE_URL = "http://localhost:3000/api";

interface NOAAResponse {
  predictions?: Array<{
    t: string;  // Time of prediction
    v: string;  // Water level
    type: "H" | "L";  // High or Low tide
  }>;
  error?: {
    message: string;
  };
}

export const fetchTideData = async (
  stationId: string,
  startDate: Date,
  days: number
) => {
  const endDate = addDays(startDate, days);
  
  const params = new URLSearchParams({
    begin_date: format(startDate, "yyyyMMdd"),
    end_date: format(endDate, "yyyyMMdd"),
    station: stationId,
    product: "predictions",
    datum: "MLLW",
    time_zone: "lst_ldt",
    units: "english",
    format: "json",
    interval: "hilo"  // Only get high/low tide predictions
  });

  const url = `${PROXY_BASE_URL}/datagetter?${params}`;
  console.log(`Fetching tide data from: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`API Error (${response.status}): ${response.statusText}`);
    }

    const data: NOAAResponse = await response.json();
    
    if (!data.predictions || data.predictions.length === 0) {
      console.error('No predictions in response:', data);
      throw new Error('No tide predictions available for this location');
    }
    
    return data.predictions.map(prediction => ({
      time: new Date(prediction.t).toISOString(),
      height: parseFloat(prediction.v),
      type: prediction.type === "H" ? "high" : "low" as "high" | "low"
    }));
  } catch (error) {
    console.error('Error fetching tide data:', error);
    throw error;
  }
};

// Map of locations to their NOAA station IDs
export const NOAA_STATIONS: Record<string, { id: string, name: string }> = {
  "san-francisco": { id: "9414290", name: "San Francisco" },
  "santa-cruz": { id: "9413745", name: "Santa Cruz" },
  "monterey": { id: "9413450", name: "Monterey" },
  "los-angeles": { id: "9410660", name: "Los Angeles" }
};