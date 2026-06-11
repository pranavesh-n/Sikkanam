import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTrainSearchUrl(fromStation: string, toStation: string): string {
  const STATION_MAP: Record<string, { code: string; name: string }> = {
    "chennai": { code: "MAS", name: "MGR CHENNAI CENTRAL" },
    "chennai central": { code: "MAS", name: "MGR CHENNAI CENTRAL" },
    "chennai central / egmore": { code: "MAS", name: "MGR CHENNAI CENTRAL" },
    "egmore": { code: "MS", name: "CHENNAI EGMORE" },
    "coimbatore": { code: "CBE", name: "COIMBATORE JN" },
    "coimbatore junction": { code: "CBE", name: "COIMBATORE JN" },
    "erode": { code: "ED", name: "ERODE JN" },
    "erode junction": { code: "ED", name: "ERODE JN" },
    "madurai": { code: "MDU", name: "MADURAI JN" },
    "madurai junction": { code: "MDU", name: "MADURAI JN" },
    "salem": { code: "SA", name: "SALEM JN" },
    "salem junction": { code: "SA", name: "SALEM JN" },
    "salem junction / erode junction": { code: "SA", name: "SALEM JN" },
    "trichy": { code: "TPJ", name: "TIRUCHCHIRAPPALLI JN" },
    "tiruchchirappalli junction": { code: "TPJ", name: "TIRUCHCHIRAPPALLI JN" },
    "tirunelveli": { code: "TEN", name: "TIRUNELVELI JN" },
    "tirunelveli junction": { code: "TEN", name: "TIRUNELVELI JN" },
    "mettupalayam": { code: "MTP", name: "METTUPALAYAM" },
    "dindigul": { code: "DG", name: "DINDIGUL JN" },
    "dindigul junction": { code: "DG", name: "DINDIGUL JN" },
    "jolarpettai": { code: "JTJ", name: "JOLARPETTAI" },
    "pollachi": { code: "POY", name: "POLLACHI JN" },
    "pollachi junction": { code: "POY", name: "POLLACHI JN" },
    "rameswaram": { code: "RMM", name: "RAMESWARAM" },
    "kanyakumari": { code: "CAPE", name: "KANYAKUMARI" },
    "puducherry": { code: "PDY", name: "PUDUCHERRY" },
    "pondicherry": { code: "PDY", name: "PUDUCHERRY" },
    "tuticorin": { code: "TN", name: "TUTICORIN" },
    "thoothukudi": { code: "TN", name: "TUTICORIN" },
    "thirupathiripuliyur": { code: "TDPR", name: "TIRUPADRIPULYUR" },
    "chengalpattu": { code: "CGL", name: "CHENGALPATTU JN" },
    "chidambaram": { code: "CDM", name: "CHIDAMBARAM" },
    "kumbakonam": { code: "KMU", name: "KUMBAKONAM" },
    "kumbakonam railway station": { code: "KMU", name: "KUMBAKONAM" },
    "katpadi junction": { code: "KPD", name: "KATPADI JN" },
    "vellore": { code: "KPD", name: "KATPADI JN" },
    "nagapattinam junction": { code: "NGT", name: "NAGAPATTINAM" },
    "nagapattinam": { code: "NGT", name: "NAGAPATTINAM" },
    "tiruvannamalai": { code: "TNM", name: "TIRUVANNAMALAI" },
    "ambur": { code: "AB", name: "AMBUR" },
    "tiruppur": { code: "TUP", name: "TIRUPPUR" },
    "karaikudi": { code: "KKDI", name: "KARAIKUDI JN" },
    "karaikudi junction": { code: "KKDI", name: "KARAIKUDI JN" },
    "mayiladuthurai": { code: "MV", name: "MAYILADUTHURAI JN" },
    "mayiladuthurai junction": { code: "MV", name: "MAYILADUTHURAI JN" },
    "tiruchendur": { code: "TCN", name: "TIRUCHENDUR" },
    "tiruttani": { code: "TRT", name: "TIRUTTANI" },
    "palani": { code: "PLNI", name: "PALANI" },
    "tenkasi": { code: "TSI", name: "TENKASI JN" },
    "tenkasi junction": { code: "TSI", name: "TENKASI JN" },
    "nagercoil": { code: "NCJ", name: "NAGERCOIL JN" },
    "nagercoil junction": { code: "NCJ", name: "NAGERCOIL JN" },
    "arakkonam": { code: "AJJ", name: "ARAKKONAM JN" },
    "arakkonam junction": { code: "AJJ", name: "ARAKKONAM JN" },
    "mylapore mrts station": { code: "MSB", name: "CHENNAI BEACH" }
  };

  const getDetails = (station: string) => {
    const key = station.toLowerCase().trim();
    if (STATION_MAP[key]) return STATION_MAP[key];
    
    // Fallback if not mapped
    const cleanName = station.replace(/junction/gi, "").replace(/railway station/gi, "").trim().toUpperCase();
    return {
      code: cleanName.slice(0, 4),
      name: cleanName
    };
  };

  const fromDetails = getDetails(fromStation);
  const toDetails = getDetails(toStation);

  const fromCode = encodeURIComponent(fromDetails.code);
  const fromName = encodeURIComponent(fromDetails.name);
  const toCode = encodeURIComponent(toDetails.code);
  const toName = encodeURIComponent(toDetails.name);

  // RailYatri trains between stations query URL structure
  return `https://www.railyatri.in/booking/trains-between-stations?from_code=${fromCode}&from_name=${fromName}&to_code=${toCode}&to_name=${toName}&src=tbs`;
}

export function roundFriendly(value: number): number {
  if (value <= 0) return 0;
  
  // Rules: Round to nearest 500, 250, or 100, whichever produces cleaner values.
  const candidates = [500, 250, 100];
  for (const step of candidates) {
    const rounded = Math.round(value / step) * step;
    // Allow up to 12% deviation to select a cleaner round number
    if (rounded > 0 && Math.abs(rounded - value) / value <= 0.12) {
      return rounded;
    }
  }
  return Math.round(value / 100) * 100;
}
