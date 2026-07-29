import { useEffect, useState } from "react";
import {
  Sun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Cloud,
  Thermometer,
  Wind,
  Sunrise,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  Umbrella,
  Clock,
  Compass,
  Droplets,
  MapPin,
  X,
  Target,
  Check,
} from "lucide-react";
import {
  fetchLiveWeatherData,
  evaluateRainRisk,
  WeatherData,
  DailyForecast,
  RainRiskAlert,
} from "@/services/weatherService";
import { getIndoorAlternatives, IndoorSpot } from "@/data/indoorSpotsData";
import { getSubLocations, SubLocation } from "@/data/subLocationsData";

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  destinationId: string;
  destinationName: string;
  category?: string;
}

export const WeatherWidget = ({
  lat,
  lng,
  destinationId,
  destinationName,
  category = "hill",
}: WeatherWidgetProps) => {
  // Coordinates & Location Name state
  const [activeLat, setActiveLat] = useState<number>(lat);
  const [activeLng, setActiveLng] = useState<number>(lng);
  const [activeLocationName, setActiveLocationName] = useState<string>(destinationName);

  // Weather data & UI state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showAreaModal, setShowAreaModal] = useState<boolean>(false);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);

  // Sub locations for area modal
  const subLocations: SubLocation[] = getSubLocations(
    destinationId,
    destinationName,
    activeLat,
    activeLng
  );

  const loadWeather = async (targetLat = activeLat, targetLng = activeLng) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLiveWeatherData(targetLat, targetLng);
      setWeatherData(data);
    } catch (err: any) {
      console.error("Error loading weather data:", err);
      setError("Unable to load live weather forecast.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveLat(lat);
    setActiveLng(lng);
    setActiveLocationName(destinationName);
    loadWeather(lat, lng);
  }, [lat, lng, destinationName]);

  const handleSelectSubLocation = (subLoc: SubLocation) => {
    setActiveLat(subLoc.lat);
    setActiveLng(subLoc.lng);
    setActiveLocationName(subLoc.name);
    setShowAreaModal(false);
    loadWeather(subLoc.lat, subLoc.lng);
  };

  const handleResetToMainLocation = () => {
    setActiveLat(lat);
    setActiveLng(lng);
    setActiveLocationName(destinationName);
    setShowAreaModal(false);
    loadWeather(lat, lng);
  };

  const handleUsePreciseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setActiveLat(userLat);
        setActiveLng(userLng);
        setActiveLocationName("Current Location");
        setLocatingUser(false);
        setShowAreaModal(false);
        loadWeather(userLat, userLng);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocatingUser(false);
        alert("Unable to retrieve precise location. Please allow location access.");
      },
      { timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <section className="px-5 mt-5">
        <div className="bg-blue-50/40 dark:bg-slate-900/40 border border-blue-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-200/60 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-blue-200/60 dark:bg-slate-800 rounded-md" />
                <div className="h-3 w-44 bg-blue-200/40 dark:bg-slate-800/60 rounded-md" />
              </div>
            </div>
            <div className="h-6 w-20 bg-blue-200/60 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-blue-200/50 dark:bg-slate-800 rounded-xl" />
            <div className="h-20 bg-blue-200/50 dark:bg-slate-800 rounded-xl" />
            <div className="h-20 bg-blue-200/50 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-32 bg-blue-200/40 dark:bg-slate-800/80 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (error || !weatherData || weatherData.daily.length === 0) {
    return (
      <section className="px-5 mt-5">
        <div className="bg-card border border-border rounded-2xl p-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">{error || "Weather data unavailable."}</p>
          <button
            onClick={() => loadWeather(activeLat, activeLng)}
            className="text-xs font-semibold text-primary inline-flex items-center gap-1.5 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Forecast
          </button>
        </div>
      </section>
    );
  }

  const { current, daily } = weatherData;
  const selectedDay: DailyForecast = daily[selectedIndex] || daily[0];
  const isTodayActive = selectedIndex === 0;

  const rainAlert: RainRiskAlert | null = evaluateRainRisk(daily);
  const indoorSpots: IndoorSpot[] = getIndoorAlternatives(destinationId, category);

  // Helper icon renderer
  const getWeatherIcon = (code: number, className = "w-5 h-5") => {
    if (code === 0 || code === 1) return <Sun className={`${className} text-amber-500`} />;
    if (code >= 51 && code <= 57) return <CloudDrizzle className={`${className} text-blue-400`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-600`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-purple-600`} />;
    if (code >= 61 && code <= 65) return <CloudRain className={`${className} text-blue-500`} />;
    return <Cloud className={`${className} text-blue-400`} />;
  };

  return (
    <section className="px-3 sm:px-5 mt-5 space-y-4">
      {/* Outer Weather Card Container */}
      <div className="bg-blue-50/40 dark:bg-slate-900/40 border border-blue-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs transition-all relative">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-500 shrink-0">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-extrabold text-slate-800 dark:text-white text-sm sm:text-base leading-tight truncate">
                {activeLocationName} Live Weather
              </h3>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">
                Open-Meteo (ECMWF Model Feed)
              </p>
            </div>
          </div>

          {/* Clickable Location / Choose Area Pill Badge */}
          <button
            onClick={() => setShowAreaModal(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-100/80 hover:bg-blue-200/90 dark:bg-blue-950/80 dark:hover:bg-blue-900/90 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
            title="Choose area or precise location"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate max-w-[120px] sm:max-w-none">{activeLocationName}</span>
            <span className="text-[10px] text-blue-500 font-normal">▼</span>
          </button>
        </div>

        {/* 3-Day Selector Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {daily.map((day, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`p-3 rounded-xl text-center transition-all duration-200 flex flex-col items-center justify-center ${
                  isActive
                    ? "border-2 border-orange-400 bg-orange-50/50 dark:bg-amber-950/20 shadow-xs scale-[1.02]"
                    : "border border-border/80 bg-card hover:bg-accent/40 active:scale-95"
                }`}
              >
                <span
                  className={`text-[11px] font-bold tracking-wider uppercase mb-1 ${
                    isActive ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                  }`}
                >
                  {day.dayLabel}
                </span>

                <div className="my-0.5">{getWeatherIcon(day.weatherCode, "w-6 h-6")}</div>

                <div className="text-xs font-extrabold text-foreground mt-1">
                  {day.tempMax}° / {day.tempMin}°C
                </div>

                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1 mt-0.5">
                  <CloudRain className="w-3 h-3" /> {day.peakRainProb}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Main Weather Details Panel */}
        <div className="bg-card border border-border/60 rounded-2xl p-4.5 mt-3.5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1">
                {getWeatherIcon(
                  isTodayActive ? current.weatherCode : selectedDay.weatherCode,
                  "w-10 h-10"
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {isTodayActive ? `${current.temperature}°C` : `${selectedDay.tempMax}°C`}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {isTodayActive
                      ? `(${selectedDay.tempMax}° / ${selectedDay.tempMin}°C)`
                      : `/ ${selectedDay.tempMin}°C`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    {isTodayActive ? current.weatherDesc : selectedDay.weatherDesc}
                  </span>
                  {isTodayActive && (
                    <span className="text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/70 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      NOW
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-end gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                {selectedDay.peakRainProb >= 50
                  ? "Rain expected later today"
                  : selectedDay.peakRainProb > 0
                  ? "Slight Chance of Rain"
                  : "Dry Conditions"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                Expected: {selectedDay.precipSum} mm
              </div>
            </div>
          </div>

          {/* Stat Metrics Grid (4 items) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* Feels Like */}
            <div className="bg-muted/40 dark:bg-slate-900/60 border border-border/40 rounded-xl p-2.5 flex items-center gap-2.5">
              <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  FEELS LIKE
                </p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {isTodayActive ? `${current.apparentTemperature}°C` : `${selectedDay.apparentTempMax}°C`}
                </p>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="bg-muted/40 dark:bg-slate-900/60 border border-border/40 rounded-xl p-2.5 flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  WIND SPEED
                </p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {isTodayActive ? `${current.windSpeed} km/h` : `${selectedDay.windSpeedMax} km/h`}
                </p>
              </div>
            </div>

            {/* Humidity / UV Index */}
            <div className="bg-muted/40 dark:bg-slate-900/60 border border-border/40 rounded-xl p-2.5 flex items-center gap-2.5">
              {isTodayActive ? (
                <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
              ) : (
                <Sun className="w-4 h-4 text-purple-500 shrink-0" />
              )}
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {isTodayActive ? "HUMIDITY" : "UV INDEX"}
                </p>
                <p className="text-xs font-bold text-foreground mt-0.5 truncate">
                  {isTodayActive
                    ? `${current.humidity}%`
                    : `${selectedDay.uvIndexMax} (${selectedDay.uvCategory})`}
                </p>
              </div>
            </div>

            {/* Sunrise / Sunset */}
            <div className="bg-muted/40 dark:bg-slate-900/60 border border-border/40 rounded-xl p-2.5 flex items-center gap-2.5">
              <Sunrise className="w-4 h-4 text-orange-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  SUNRISE / SUNSET
                </p>
                <p className="text-[11px] font-bold text-foreground mt-0.5 truncate">
                  {selectedDay.sunriseFormatted} / {selectedDay.sunsetFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Sikkanam Travel Intelligence Advice Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                SIKKANAM TRAVEL ADVICE ({selectedDay.dayLabel})
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-foreground font-medium">
              {selectedDay.umbrellaNeeded && (
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <Umbrella className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Carry an umbrella or raincoat</span>
                </div>
              )}

              {selectedDay.rainyWindowText && (
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Most likely rain window: <strong>{selectedDay.rainyWindowText.replace("Rain expected between ", "").replace("Rain expected around ", "")}</strong> (Expected: {selectedDay.precipSum} mm)
                  </span>
                </div>
              )}

              {selectedDay.bestSightseeingText && (
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    Best time for outdoor sightseeing:{" "}
                    <strong className="font-semibold">{selectedDay.bestSightseeingText}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-3.5 px-1 font-medium">
          <Info className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
          Weather data by{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary font-semibold"
          >
            Open-Meteo
          </a>{" "}
          (ECMWF Feed). Forecasts may change.
        </p>
      </div>

      {/* Sikkanam AI Rain Risk Alert Card (Smart Trigger) */}
      {rainAlert && rainAlert.triggered && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-3xl p-4.5 shadow-xs space-y-3 transition-all animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                SIKKANAM AI RAIN RISK ALERT
              </span>
              <span className="bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                {rainAlert.dayLabel}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-amber-900/90 dark:text-amber-200/90 font-medium leading-relaxed">
            <p className="font-bold text-amber-950 dark:text-amber-100">
              ☔ Rain is likely later today. (Expected rainfall: {rainAlert.precipSum} mm in {activeLocationName}, {rainAlert.dayLabel})
            </p>
            <p className="text-[11.5px] opacity-90">
              {rainAlert.rainyWindowText ? `${rainAlert.rainyWindowText}. ` : ""}
              Indoor attractions are recommended during rain hours:
            </p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold text-amber-800/80 dark:text-amber-300/70 uppercase tracking-wider mb-2">
              INDOOR ALTERNATIVES:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {indoorSpots.map((spot, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-foreground shadow-2xs hover:border-amber-400 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{spot.name}</span>
                  <span className="ml-auto">{spot.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHOOSE AN AREA MODAL (Google Weather Style) */}
      {showAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-5 shadow-elevated space-y-4 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display font-extrabold text-foreground text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Choose an area
              </h3>
              <button
                onClick={() => setShowAreaModal(false)}
                className="w-8 h-8 rounded-full bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current GPS Precision Location Section */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Current location
              </p>
              <button
                onClick={handleUsePreciseLocation}
                disabled={locatingUser}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all font-semibold text-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <Target className={`w-4 h-4 ${locatingUser ? "animate-spin" : ""}`} />
                  <span>{locatingUser ? "Locating precise coordinates..." : "Use precise GPS location"}</span>
                </div>
                {activeLocationName === "Current Location" && <Check className="w-4 h-4 text-primary" />}
              </button>
            </div>

            {/* Default Destination Main Area */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Main Destination
                </p>
              </div>
              <button
                onClick={handleResetToMainLocation}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-semibold ${
                  activeLocationName === destinationName
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 hover:bg-accent border-border/60 text-foreground"
                }`}
              >
                <span>{destinationName} Center</span>
                {activeLocationName === destinationName && <Check className="w-4 h-4" />}
              </button>
            </div>

            {/* Popular Sub-Areas Section */}
            {subLocations.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Popular areas in {destinationName}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {subLocations.map((subLoc, idx) => {
                    const isSelected = activeLocationName === subLoc.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectSubLocation(subLoc)}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 hover:bg-accent border-border/60 text-foreground"
                        }`}
                      >
                        <span className="truncate">{subLoc.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border/60 text-center">
              <p className="text-[11px] text-muted-foreground">
                Sikkanam Live Weather fetches hyper-local ECMWF forecasts per area.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
