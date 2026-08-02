/**
 * Weather Service for Sikkanam Live Weather & AI Rain Risk System
 * Uses Open-Meteo API with Hybrid Architecture:
 * 1. Best-Match Live Observational Feed for "NOW" conditions
 * 2. ECMWF IFS model (models=ecmwf_ifs025) for 16-Day Extended Forecast & Rain Risk Intelligence
 * 3. User Choice Custom Date Support for any date selected via calendar picker
 */

export interface CurrentWeather {
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number; // %
  weatherCode: number;
  weatherDesc: string;
  isDay: boolean;
  windSpeed: number; // km/h
  precipitation: number; // mm
}

export interface HourlyForecastItem {
  time: string; // ISO string e.g. "2026-07-29T15:00"
  hourFormatted: string; // "3 PM"
  temp: number;
  rainProb: number; // %
  precip: number; // mm
  weatherCode: number;
}

export interface DailyForecast {
  date: string; // ISO date string (YYYY-MM-DD)
  dayLabel: string; // "TODAY", "TOMORROW", "DAY 3", or "SAT, AUG 8"
  dateFormatted: string; // "Jul 29"
  weekdayShort: string; // "Sat"
  weatherCode: number;
  weatherDesc: string;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number; // Feels like temp (°C)
  windSpeedMax: number; // km/h
  uvIndexMax: number;
  uvCategory: "Low" | "Moderate" | "High" | "Very High" | "Extreme";
  sunriseFormatted: string; // "06:10 AM"
  sunsetFormatted: string; // "06:46 PM"
  peakRainProb: number; // Max hourly precipitation probability %
  rainProb: number; // Alias for peakRainProb
  precipSum: number; // Total daily rainfall volume mm
  rainyWindowText?: string; // e.g. "3 PM – 11 PM"
  bestSightseeingText?: string; // e.g. "7 AM – 11 AM"
  umbrellaNeeded: boolean;
  hourlyItems: HourlyForecastItem[];
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  confidence: "High" | "Moderate";
  isEcmwfModel: boolean;
}

export interface RainRiskAlert {
  triggered: boolean;
  rainyDayIndex: number;
  dayLabel: string;
  peakRainProb: number;
  rainProb: number;
  precipSum: number;
  rainyWindowText?: string;
}

/**
 * Maps WMO Weather Code to human readable condition description
 */
export function getWmoWeatherDesc(code: number): string {
  switch (code) {
    case 0:
      return "Clear Sky";
    case 1:
      return "Mainly Clear";
    case 2:
      return "Partly Cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Foggy";
    case 51:
    case 53:
    case 55:
      return "Light Drizzle";
    case 56:
    case 57:
      return "Freezing Drizzle";
    case 61:
      return "Light Rain";
    case 63:
      return "Moderate Rain";
    case 65:
      return "Heavy Rain";
    case 66:
    case 67:
      return "Freezing Rain";
    case 71:
    case 73:
    case 75:
      return "Snowfall";
    case 77:
      return "Snow Grains";
    case 80:
    case 81:
    case 82:
      return "Rain Showers";
    case 85:
    case 86:
      return "Snow Showers";
    case 95:
      return "Thunderstorm";
    case 96:
    case 99:
      return "Heavy Thunderstorm";
    default:
      return "Partly Cloudy";
  }
}

/**
 * Calculates UV Index Category
 */
export function getUvCategory(uvIndex: number): "Low" | "Moderate" | "High" | "Very High" | "Extreme" {
  if (uvIndex <= 2) return "Low";
  if (uvIndex <= 5) return "Moderate";
  if (uvIndex <= 7) return "High";
  if (uvIndex <= 10) return "Very High";
  return "Extreme";
}

/**
 * Formats ISO timestamp to 12-hour AM/PM string (e.g. "3 PM" or "06:10 AM")
 */
export function formatHourAmPm(isoString?: string): string {
  if (!isoString) return "--";
  try {
    const timePart = isoString.includes("T") ? isoString.split("T")[1] : isoString;
    if (timePart) {
      const [h] = timePart.split(":");
      const hours = parseInt(h, 10);
      if (!isNaN(hours)) {
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedH = hours % 12 || 12;
        return `${formattedH} ${ampm}`;
      }
    }
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  } catch (err) {
    return isoString;
  }
}

export function formatAmPm(isoString?: string): string {
  if (!isoString) return "--:--";
  try {
    const timePart = isoString.includes("T") ? isoString.split("T")[1] : isoString;
    if (timePart) {
      const [h, m] = timePart.split(":");
      const hours = parseInt(h, 10);
      if (!isNaN(hours)) {
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedH = (hours % 12 || 12).toString().padStart(2, "0");
        return `${formattedH}:${m.substring(0, 2)} ${ampm}`;
      }
    }
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    return isoString;
  }
}

/**
 * Parses hourly data to find peak rainy windows and best sightseeing windows
 */
function analyzeHourlyWindows(hourlyList: HourlyForecastItem[]) {
  const rainyHours = hourlyList.filter((h) => h.rainProb >= 50 || h.precip >= 0.2);

  let rainyWindowText: string | undefined = undefined;
  if (rainyHours.length > 0) {
    const startHour = formatHourAmPm(rainyHours[0].time);
    const endHour = formatHourAmPm(rainyHours[rainyHours.length - 1].time);
    rainyWindowText =
      startHour === endHour
        ? `Rain expected around ${startHour}`
        : `${startHour} – ${endHour}`;
  }

  const dryDaylightHours = hourlyList.filter((h) => {
    const timeStr = h.time.includes("T") ? h.time.split("T")[1] : h.time;
    const hourNum = parseInt(timeStr.split(":")[0], 10);
    return hourNum >= 6 && hourNum <= 19 && h.rainProb < 35;
  });

  let bestSightseeingText: string | undefined = undefined;
  if (dryDaylightHours.length >= 2) {
    const start = formatHourAmPm(dryDaylightHours[0].time);
    const end = formatHourAmPm(dryDaylightHours[dryDaylightHours.length - 1].time);
    bestSightseeingText = `${start} – ${end}`;
  } else if (dryDaylightHours.length === 1) {
    bestSightseeingText = `Around ${formatHourAmPm(dryDaylightHours[0].time)}`;
  } else {
    bestSightseeingText = "6 AM – 1 PM";
  }

  return { rainyWindowText, bestSightseeingText };
}

// 10-Minute Responsible In-Memory Cache (TTL = 10 minutes)
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function clearWeatherCache() {
  weatherCache.clear();
}

/**
 * Generates custom forecast item for any user-chosen date beyond standard 16-day window
 */
export function generateForecastForCustomDate(
  dateStr: string,
  baseForecast: DailyForecast,
  dayOffset = 0
): DailyForecast {
  const targetDateObj = new Date(dateStr + "T00:00:00");
  if (isNaN(targetDateObj.getTime())) return baseForecast;

  // Offset by dayOffset
  targetDateObj.setDate(targetDateObj.getDate() + dayOffset);

  const isoDate = targetDateObj.toISOString().split("T")[0];
  const month = targetDateObj.getMonth();

  // Seasonal temperature variation logic relative to base
  let tempAdj = 0;
  if (month >= 3 && month <= 5) tempAdj = 3; // Summer (Apr-Jun)
  else if (month >= 10 || month <= 1) tempAdj = -4; // Winter/Monsoon (Nov-Feb)

  const dateFormatted = targetDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const weekdayShort = targetDateObj.toLocaleDateString("en-US", { weekday: "short" });

  const dayLabel = targetDateObj
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  return {
    ...baseForecast,
    date: isoDate,
    dayLabel,
    dateFormatted,
    weekdayShort,
    tempMax: Math.max(15, Math.round(baseForecast.tempMax + tempAdj)),
    tempMin: Math.max(10, Math.round(baseForecast.tempMin + tempAdj)),
    apparentTempMax: Math.max(15, Math.round(baseForecast.apparentTempMax + tempAdj)),
  };
}

/**
 * Fetches Live Current Weather + 16-Day Extended Forecast from Open-Meteo API
 */
export async function fetchLiveWeatherData(
  lat: number,
  lng: number,
  forceRefresh = false
): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  if (!forceRefresh && weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }
  const currentFields = [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "is_day",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
  ].join(",");

  const hourlyFields = [
    "temperature_2m",
    "precipitation_probability",
    "precipitation",
    "weather_code",
  ].join(",");

  const dailyFields = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "precipitation_probability_max",
    "precipitation_sum",
    "wind_speed_10m_max",
    "uv_index_max",
    "sunrise",
    "sunset",
  ].join(",");

  const ecmwfUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=${currentFields}&hourly=${hourlyFields}&daily=${dailyFields}&forecast_days=16&models=ecmwf_ifs025&timezone=auto`;
  const fallbackUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=${currentFields}&hourly=${hourlyFields}&daily=${dailyFields}&forecast_days=16&timezone=auto`;

  let data: any = null;
  let isEcmwfModel = false;

  try {
    const res = await fetch(ecmwfUrl);
    if (res.ok) {
      data = await res.json();
      isEcmwfModel = true;
    }
  } catch (err) {
    console.warn("ECMWF fetch failed, using fallback Open-Meteo endpoint...", err);
  }

  if (!data || !data.daily || !data.current) {
    const resFallback = await fetch(fallbackUrl);
    if (!resFallback.ok) {
      throw new Error(`Weather API error (${resFallback.status})`);
    }
    data = await resFallback.json();
    isEcmwfModel = false;
  }

  // Parse Current Weather from Open-Meteo live API response
  const cur = data.current || {};
  const nowHour = new Date().getHours();
  const hourly = data.hourly || {};
  
  const currentTempRaw = cur.temperature_2m ?? hourly.temperature_2m?.[nowHour] ?? data.daily?.temperature_2m_max?.[0];
  const currentApparentRaw = cur.apparent_temperature ?? hourly.apparent_temperature?.[nowHour] ?? currentTempRaw;
  const currentHumidityRaw = cur.relative_humidity_2m ?? hourly.relative_humidity_2m?.[nowHour];
  const currentWindRaw = cur.wind_speed_10m ?? data.daily?.wind_speed_10m_max?.[0];
  const currentCodeRaw = cur.weather_code ?? hourly.weather_code?.[nowHour] ?? data.daily?.weather_code?.[0] ?? 0;

  const current: CurrentWeather = {
    temperature: Math.round(currentTempRaw),
    apparentTemperature: Math.round(currentApparentRaw),
    humidity: Math.round(currentHumidityRaw),
    weatherCode: currentCodeRaw,
    weatherDesc: getWmoWeatherDesc(currentCodeRaw),
    isDay: cur.is_day === 1 || (nowHour >= 6 && nowHour <= 18),
    windSpeed: Math.round(currentWindRaw),
    precipitation: Math.round((cur.precipitation ?? hourly.precipitation?.[nowHour] ?? 0) * 10) / 10,
  };

  // Parse Hourly Forecast
  const hourlyTimeList: string[] = hourly.time || [];
  const allHourlyItems: HourlyForecastItem[] = [];

  for (let i = 0; i < hourlyTimeList.length; i++) {
    allHourlyItems.push({
      time: hourlyTimeList[i],
      hourFormatted: formatHourAmPm(hourlyTimeList[i]),
      temp: Math.round(hourly.temperature_2m?.[i] ?? 25),
      rainProb: Math.round(hourly.precipitation_probability?.[i] ?? 0),
      precip: Math.round((hourly.precipitation?.[i] ?? 0) * 10) / 10,
      weatherCode: hourly.weather_code?.[i] ?? 0,
    });
  }

  // Parse 16-Day Forecast
  const daily = data.daily || {};
  const daysCount = daily.time?.length || 0;
  const dailyList: DailyForecast[] = [];

  for (let i = 0; i < daysCount; i++) {
    const dateStr = daily.time[i]; // e.g. "2026-08-02"
    const dateObj = new Date(dateStr + "T00:00:00");

    let dayLabel = "TODAY";
    let weekdayShort = "Today";

    if (i === 0) {
      dayLabel = "TODAY";
      weekdayShort = "Today";
    } else if (i === 1) {
      dayLabel = "TOMORROW";
      weekdayShort = "Tomorrow";
    } else if (i === 2) {
      dayLabel = "DAY 3";
      weekdayShort = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("en-US", { weekday: "short" })
        : "Day 3";
    } else if (!isNaN(dateObj.getTime())) {
      weekdayShort = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      dayLabel = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).toUpperCase();
    } else {
      dayLabel = `DAY ${i + 1}`;
      weekdayShort = `Day ${i + 1}`;
    }

    const dateFormatted = isNaN(dateObj.getTime())
      ? dateStr
      : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const uvVal = Math.round((daily.uv_index_max?.[i] ?? 4) * 10) / 10;
    const precipVal = Math.round((daily.precipitation_sum?.[i] ?? 0) * 10) / 10;
    const peakRainProb = Math.round(daily.precipitation_probability_max?.[i] ?? 0);

    const dayHourly = allHourlyItems.slice(i * 24, (i + 1) * 24);
    const { rainyWindowText, bestSightseeingText } = analyzeHourlyWindows(dayHourly);

    dailyList.push({
      date: dateStr,
      dayLabel,
      dateFormatted,
      weekdayShort,
      weatherCode: daily.weather_code?.[i] ?? 0,
      weatherDesc: getWmoWeatherDesc(daily.weather_code?.[i] ?? 0),
      tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 28),
      tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 18),
      apparentTempMax: Math.round(daily.apparent_temperature_max?.[i] ?? 30),
      windSpeedMax: Math.round(daily.wind_speed_10m_max?.[i] ?? 12),
      uvIndexMax: uvVal,
      uvCategory: getUvCategory(uvVal),
      sunriseFormatted: formatAmPm(daily.sunrise?.[i]),
      sunsetFormatted: formatAmPm(daily.sunset?.[i]),
      peakRainProb,
      rainProb: peakRainProb,
      precipSum: precipVal,
      rainyWindowText,
      bestSightseeingText,
      umbrellaNeeded: precipVal >= 1.5 || peakRainProb >= 60,
      hourlyItems: dayHourly,
    });
  }

  const result: WeatherData = {
    current,
    daily: dailyList,
    confidence: isEcmwfModel ? "High" : "Moderate",
    isEcmwfModel,
  };

  weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

/**
 * Legacy alias for forecast fetching
 */
export async function fetch3DayForecast(lat: number, lng: number): Promise<DailyForecast[]> {
  const res = await fetchLiveWeatherData(lat, lng);
  return res.daily;
}

/**
 * Checks for Sikkanam AI Rain Risk Alert condition:
 * Significant rainfall sum (>= 2.0mm) AND high peak rain probability (> 70%)
 */
export function evaluateRainRisk(dailyList: DailyForecast[]): RainRiskAlert | null {
  const rainyDayIndex = dailyList.findIndex(
    (f) => f.peakRainProb > 70 && f.precipSum >= 2.0
  );

  if (rainyDayIndex !== -1) {
    const day = dailyList[rainyDayIndex];
    return {
      triggered: true,
      rainyDayIndex,
      dayLabel: day.dayLabel,
      peakRainProb: day.peakRainProb,
      rainProb: day.peakRainProb,
      precipSum: day.precipSum,
      rainyWindowText: day.rainyWindowText,
    };
  }

  return null;
}
