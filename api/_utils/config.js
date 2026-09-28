/**
 * Server-Side Backend Configuration
 * Resolves all AI models, endpoints, and version metadata from environment variables (.env).
 * Nothing is hardcoded.
 */

import fs from "fs";
import path from "path";

// Helper to reliably read environment variables from process.env or .env file
export function getEnv(key, fallback = "") {
  if (process.env[key] && !process.env[key].includes("YOUR_")) {
    return process.env[key].trim();
  }
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [k, ...v] = trimmed.split("=");
        if (k.trim() === key) {
          const val = v.join("=").trim().replace(/^['"]|['"]$/g, "");
          if (val && !val.includes("YOUR_")) {
            process.env[key] = val;
            return val;
          }
        }
      }
    }
  } catch (e) {}
  return fallback;
}

export const serverConfig = {
  // App Version & Date
  appVersion: getEnv("APP_VERSION", "v2.6.5"),
  releaseDate: getEnv("APP_RELEASE_DATE", "September 2026"),

  // Groq AI Models & Endpoint
  groqApiUrl: getEnv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions"),
  groqModels: (getEnv("GROQ_MODELS", "openai/gpt-oss-120b,openai/gpt-oss-20b"))
    .split(",")
    .map(m => m.trim())
    .filter(Boolean),

  // Google Gemini AI Models & Endpoint
  geminiApiUrl: getEnv("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta/models"),
  geminiModels: (getEnv("GEMINI_MODELS", "gemini-3.0-flash,gemini-2.5-flash,gemini-2.5-flash-lite"))
    .split(",")
    .map(m => m.trim())
    .filter(Boolean),

  // ScrapeGraph & Web Grounding
  scrapegraphMcpUrl: getEnv("SCRAPEGRAPH_MCP_URL", ""),
  scrapegraphApiKey: getEnv("SCRAPEGRAPH_API_KEY", "") || getEnv("MCPMARKET_TOKEN", ""),

  // MongoDB
  mongodbUri: getEnv("MONGODB_URI", ""),

  // Supabase
  supabaseUrl: getEnv("SUPABASE_URL", "") || getEnv("VITE_SUPABASE_URL", ""),
  supabaseServiceKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),

  // JWT
  jwtSecret: getEnv("JWT_SECRET", ""),

  // Support Contacts
  supportEmail: getEnv("SUPPORT_EMAIL", "sikkanam.customerfeedback@gmail.com"),
  supportPhone: getEnv("SUPPORT_PHONE", "916374161918"),
};

export default serverConfig;
