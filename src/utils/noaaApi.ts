import { addDays, format,parse } from "date-fns";

const NOAA_BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

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

  //const response = await fetch(`${NOAA_BASE_URL}?${params}`);
  const response = await fetch(`/api/datagetter?${params}`);
  const data: NOAAResponse = await response.json();
  console.log(data);

  if (!response.ok) {
    console.error('No tide predictions available for this location');
    throw new Error(`API Error (${response.status}): ${response.statusText}`);
  }
  
  if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No tide predictions available for this location');
  }
  
  return data.predictions.map(prediction => {
    console.log(`Parsing prediction: ${JSON.stringify(prediction)}`);
    console.log(`Parsing date: ${prediction.t}`);
    try {
      return {
          time: parse(prediction.t, "yyyy-MM-dd HH:mm", new Date()).toISOString(),
          height: parseFloat(prediction.v),
          type: prediction.type === "H" ? "high" : "low" as "high" | "low"
      };
    } catch (error) {
        console.error(`Error parsing prediction: ${prediction.t}`, error);
        throw new Error('Failed to parse tide predictions');
    }
  });
};

// Map of locations to their NOAA station IDs
export const NOAA_STATIONS: Record<string, { id: string, name: string }> = {
  "san-francisco": { id: "9414290", name: "San Francisco" },
  "santa-cruz": { id: "9413745", name: "Santa Cruz" },
  "monterey": { id: "9413450", name: "Monterey" },
  "los-angeles": { id: "9410660", name: "Los Angeles" }
};