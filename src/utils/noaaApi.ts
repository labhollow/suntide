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

interface NOAAAstronomyResponse {
  astronomy?: Array<{
    date: string;
    sunrise: string;
    sunset: string;
  }>;
}

export const fetchTideData = async (
  stationId: string,
  startDate: Date,
  days: number
) => {
  const endDate = addDays(startDate, days);
  
  // First fetch tide predictions
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

  // Then fetch astronomy data
  const astronomyParams = new URLSearchParams({
    begin_date: format(startDate, "yyyyMMdd"),
    end_date: format(endDate, "yyyyMMdd"),
    station: stationId,
    product: "astronomy",
    datum: "MLLW",
    time_zone: "lst_ldt",
    units: "metric",
    format: "json"
  });

  try {
    const [tideResponse, astronomyResponse] = await Promise.all([
      fetch(`${PROXY_BASE_URL}/datagetter?${tideParams}`),
      fetch(`${PROXY_BASE_URL}/datagetter?${astronomyParams}`)
    ]);

    if (!tideResponse.ok || !astronomyResponse.ok) {
      throw new Error(`API Error (${tideResponse.status}): ${tideResponse.statusText}`);
    }

    const tideData: NOAAResponse = await tideResponse.json();
    const astronomyData: NOAAAstronomyResponse = await astronomyResponse.json();

    if (!tideData.predictions || tideData.predictions.length === 0) {
      console.error('No predictions in response:', tideData);
      throw new Error('No tide predictions available for this location');
    }

    // Create a map of dates to astronomy data for quick lookup
    const astronomyMap = new Map(
      astronomyData.astronomy?.map(item => [
        item.date,
        { sunrise: item.sunrise, sunset: item.sunset }
      ]) || []
    );

    // Combine tide predictions with astronomy data
    return tideData.predictions.map(prediction => {
      const date = format(new Date(prediction.t), "yyyyMMdd");
      const astronomy = astronomyMap.get(date) || { sunrise: "", sunset: "" };
      
      return {
        ...prediction,
        sunrise: astronomy.sunrise,
        sunset: astronomy.sunset
      };
    });
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