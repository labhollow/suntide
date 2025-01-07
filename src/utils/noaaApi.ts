import { addDays, format } from "date-fns";

const NOAA_BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

interface NOAAResponse {
  predictions: Array<{
    t: string;  // Time of prediction
    v: string;  // Water level
    type: "H" | "L";  // High or Low tide
  }>;
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

  try {
    const response = await fetch(`${NOAA_BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tide data');
    }
    const data: NOAAResponse = await response.json();
    
    return data.predictions.map(prediction => ({
      time: new Date(prediction.t).toISOString(),
      height: parseFloat(prediction.v),
      type: prediction.type === "H" ? "high" : "low" as "high" | "low"
    }));
  } catch (error) {
    console.error("Error fetching tide data:", error);
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