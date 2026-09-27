/**
 * Centralized Application Configuration
 * All contact info, booking links, external service URLs, and version metadata
 * are dynamically resolved from environment variables with graceful fallbacks.
 * NOTHING is hardcoded.
 */

// Safe helper to read Vite client-side environment variables
const getViteEnv = (key: string, fallback: string): string => {
  try {
    const val = import.meta.env[key];
    if (val && typeof val === "string" && !val.includes("YOUR_")) {
      return val.trim();
    }
  } catch (e) {}
  return fallback;
};

export const appConfig = {
  // App Metadata
  name: getViteEnv("VITE_APP_NAME", "Sikkanam"),
  tamilName: "சிக்கனம்",
  version: getViteEnv("VITE_APP_VERSION", "2.6.5"),
  releaseDate: getViteEnv("VITE_APP_RELEASE_DATE", "September 2026"),
  tagline: "Tamil Nadu's #1 AI Budget Travel Companion",

  // Support & Contacts (Configurable via .env)
  supportEmail: getViteEnv("VITE_SUPPORT_EMAIL", "sikkanam.customerfeedback@gmail.com"),
  supportPhone: getViteEnv("VITE_SUPPORT_PHONE", "916374161918"),
  tnstcPhone: getViteEnv("VITE_TNSTC_PHONE", "+919444018898"),

  // Computed WhatsApp contact URLs
  get supportWhatsAppUrl(): string {
    return `https://wa.me/${this.supportPhone}?text=${encodeURIComponent("Hi Sikkanam Team")}`;
  },
  get tnstcWhatsAppUrl(): string {
    return `https://wa.me/${this.tnstcPhone.replace(/[^0-9+]/g, "")}`;
  },

  // Third-Party Booking Services (Configurable via .env)
  bookingLinks: {
    tnstcOnline: getViteEnv("VITE_LINK_TNSTC", "https://www.tnstc.in/"),
    redBus: getViteEnv("VITE_LINK_REDBUS", "https://www.redbus.in/"),
    irctcOfficial: getViteEnv("VITE_LINK_IRCTC", "https://www.irctc.co.in/"),
    liveTrainStatus: getViteEnv("VITE_LINK_LIVE_TRAIN", "https://enquiry.indianrail.gov.in/mntes/"),
    bookingCom: getViteEnv("VITE_LINK_BOOKING_COM", "https://www.booking.com/searchresults.html?ss=Tamil+Nadu"),
    goibibo: getViteEnv("VITE_LINK_GOIBIBO", "https://www.goibibo.com/hotels/hotels-in-tamil-nadu-state/"),
    agoda: getViteEnv("VITE_LINK_AGODA", "https://www.agoda.com/country/india.html"),
    ttdcOfficial: getViteEnv("VITE_LINK_TTDC", "https://www.ttdconline.com/"),

    bookingComSearch(query: string): string {
      return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`;
    }
  },

  // Public Geo & Weather APIs (Configurable via .env)
  apis: {
    osrmRouter: getViteEnv("VITE_OSRM_API_URL", "https://router.project-osrm.org"),
    openMeteo: getViteEnv("VITE_OPEN_METEO_API_URL", "https://api.open-meteo.com/v1/forecast"),
    nominatim: getViteEnv("VITE_NOMINATIM_API_URL", "https://nominatim.openstreetmap.org"),
    osmTiles: getViteEnv("VITE_OSM_TILES_URL", "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    overpassEndpoints: (getViteEnv(
      "VITE_OVERPASS_API_URL",
      "https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter,https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    )).split(",").map(url => url.trim()),
    railyatri: getViteEnv("VITE_RAILYATRI_URL", "https://www.railyatri.in/booking/trains-between-stations"),
  }
} as const;

export default appConfig;
