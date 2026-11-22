import fs from "fs";
import path from "path";
import { serverConfig, getEnv } from "./config.js";
import { VERIFIED_GROUND_TRUTH } from "./scrapegraphGrounding.js";

const firecrawlCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Searches the web in real-time using Firecrawl v1 Search API
 * Non-blocking, with strict timeout to ensure zero latency lag
 */
export async function queryFirecrawlLive(query, destination = "") {
  const apiKey = getEnv("FIRECRAWL_API_KEY") || serverConfig.firecrawlApiKey || "fc-4a91679410ab4f89a3ac30da22d569dd";
  let baseUrl = getEnv("FIRECRAWL_API_URL") || serverConfig.firecrawlApiUrl || "https://api.firecrawl.dev";
  if (!baseUrl || baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
    baseUrl = "https://api.firecrawl.dev";
  }

  if (!apiKey || apiKey.includes("YOUR_")) {
    return null;
  }

  const cleanDest = (destination || "").trim();
  const searchQuery = cleanDest
    ? `${cleanDest} Tamil Nadu TTDC room tariffs TNSTC bus fares entry tickets 2026`
    : `${(query || "").trim()} Tamil Nadu travel 2026`;

  const cacheKey = searchQuery.toLowerCase();
  if (firecrawlCache.has(cacheKey)) {
    const entry = firecrawlCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200); // 2.2s budget

    const res = await fetch(`${baseUrl}/v1/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        query: searchQuery,
        limit: 3,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Firecrawl] HTTP ${res.status} for "${searchQuery}"`);
      return null;
    }

    const json = await res.json();
    const items = json?.data || json?.web || [];
    const snippets = items
      .slice(0, 3)
      .map((item) => {
        const title = (item.title || "").trim();
        const desc = (item.description || "").trim();
        return title ? `${title}: ${desc}` : desc;
      })
      .filter((s) => s.length > 20);

    if (snippets.length === 0) return null;

    const result = {
      destination: cleanDest,
      query: searchQuery,
      snippets,
      source: "Firecrawl Real-Time Web Intelligence",
      retrievedAt: new Date().toISOString(),
    };

    firecrawlCache.set(cacheKey, { data: result, timestamp: Date.now() });
    console.log(`[Firecrawl] ✅ Real-time web intelligence retrieved for: ${cleanDest || searchQuery}`);
    return result;
  } catch (err) {
    // Non-fatal graceful degradation to verified ground benchmarks
    console.warn(`[Firecrawl] Search skipped (${err.message})`);
    return null;
  }
}

/**
 * Composite live intelligence retriever:
 * 1. Checks verified ground truth benchmarks (0ms)
 * 2. Fetches Firecrawl real-time web search in parallel
 */
export async function queryLiveTravelIntelligence(destinationName, userQuery = "") {
  if (!destinationName) return null;
  const cleanName = destinationName.trim().toLowerCase();

  // 1. Instant verified benchmark match
  let benchmark = VERIFIED_GROUND_TRUTH[cleanName];
  if (!benchmark) {
    for (const [key, val] of Object.entries(VERIFIED_GROUND_TRUTH)) {
      if (cleanName.includes(key) || key.includes(cleanName) || val.hub.toLowerCase().includes(cleanName)) {
        benchmark = val;
        break;
      }
    }
  }

  // 2. Fetch live web data using Firecrawl
  let firecrawlData = null;
  try {
    firecrawlData = await queryFirecrawlLive(userQuery, destinationName);
  } catch (e) {
    // Non-fatal
  }

  return {
    destination: destinationName,
    benchmark: benchmark || null,
    firecrawl: firecrawlData || null,
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Formats Firecrawl and Verified Benchmarks into a strict, non-hallucinatory grounding block
 */
export function formatGroundedContext(intelligenceData) {
  if (!intelligenceData) return "";
  const b = intelligenceData.benchmark;
  const fc = intelligenceData.firecrawl;

  if (!b && (!fc || !fc.snippets || fc.snippets.length === 0)) {
    return "";
  }

  let report = "\n=== REAL-TIME GROUNDED INTELLIGENCE (FIRECRAWL WEB SEARCH & OFFICIAL TARIFF BENCHMARKS) ===\n";

  if (b) {
    report += `• Destination Profile: ${b.hub} (${b.district} District)\n`;
    report += `• Official TTDC Hotel Tariff: ${b.ttdcStay}\n`;
    report += `• Realistic Budget Stays: ${b.budgetStayRange}\n`;
    report += `• Public Transit & Official Fares:\n`;
    b.transit.forEach((t) => { report += `  - ${t}\n`; });
    report += `• Official Entry & Activity Fees:\n`;
    b.officialEntryFees.forEach((f) => { report += `  - ${f}\n`; });
    report += `• Authentic Local Eateries & Costs: ${b.localFoodTips}\n`;
    if (b.seasonalNotice) {
      report += `• Real-Time Seasonal & Crowd Advisory: ${b.seasonalNotice}\n`;
    }
  }

  if (fc && fc.snippets && fc.snippets.length > 0) {
    report += `• Firecrawl Live Web Findings (Current Online Market Data):\n`;
    fc.snippets.forEach((snippet) => {
      report += `  - ${snippet.replace(/\n+/g, " ").substring(0, 220)}\n`;
    });
  }

  report += "=============================================================================================\n";
  report += "CRITICAL ACCURACY & GROUNDING RULES FOR MODEL:\n";
  report += "1. ZERO HALLUCINATION: All prices, hotel names, bus/train routes, and entry tickets MUST adhere to the verified real-world market ranges above.\n";
  report += "2. BUDGET REALISM: Plans must be optimistic yet 99% achievable under real Tamil Nadu market conditions.\n";
  report += "3. FORMAT: Clean structured text with bullet points only (NO markdown tables or pipe grids).\n";
  report += "4. NO ARTIFICIAL LABELS: Do NOT output fake tags like [⚡ Live Verified]. Present facts naturally.\n";

  return report;
}
