import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import { parse as parseCookie } from "cookie";

// Load .env file if it exists
try {
  const envPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key) {
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn("Could not load .env file:", e);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    {
      name: "api-server-middleware",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith("/api/")) {
            const urlObj = new URL(req.url || "", `http://${req.headers.host || 'localhost'}`);
            const pathname = urlObj.pathname;
            
            // Map pathname to local JS file path, e.g. /api/auth/google -> ./api/auth/google.js
            const relativePath = `.${pathname}.js`;
            const absolutePath = path.resolve(__dirname, relativePath);
            
            if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
              // Read request body if needed
              let body = "";
              if (req.method !== "GET" && req.method !== "HEAD") {
                for await (const chunk of req) {
                  body += chunk;
                }
              }
              
              let parsedBody = {};
              if (body) {
                try {
                  parsedBody = JSON.parse(body);
                } catch (e) {
                  try {
                    parsedBody = Object.fromEntries(new URLSearchParams(body).entries());
                  } catch (e2) {
                    parsedBody = body;
                  }
                }
              }
              
              const query: Record<string, string | string[]> = {};
              urlObj.searchParams.forEach((value, key) => {
                if (query[key]) {
                  if (Array.isArray(query[key])) {
                    (query[key] as string[]).push(value);
                  } else {
                    query[key] = [query[key] as string, value];
                  }
                } else {
                  query[key] = value;
                }
              });

              const cookies = parseCookie(req.headers.cookie || "");

              const mockReq = {
                method: req.method,
                headers: req.headers,
                url: req.url,
                query,
                body: parsedBody,
                cookies,
              };
              
              const mockRes = {
                status(code: number) {
                  res.statusCode = code;
                  return this;
                },
                json(data: any) {
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify(data));
                  return this;
                },
                send(body: any) {
                  if (typeof body === "object") {
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(body));
                  } else {
                    res.end(body);
                  }
                  return this;
                },
                redirect(statusOrUrl: string | number, url?: string) {
                  let redirectStatus = 307;
                  let redirectUrl = statusOrUrl;
                  if (typeof statusOrUrl === "number") {
                    redirectStatus = statusOrUrl;
                    redirectUrl = url || "";
                  }
                  res.statusCode = redirectStatus;
                  res.setHeader("Location", String(redirectUrl));
                  res.end();
                  return this;
                },
                setHeader(name: string, val: any) {
                  res.setHeader(name, val);
                  return this;
                },
                end(chunk?: any) {
                  res.end(chunk);
                  return this;
                }
              };

              try {
                // Load and transpile the module dynamically using Vite's SSR module loader
                const module = await server.ssrLoadModule(absolutePath);
                
                if (typeof module.default === "function") {
                  await module.default(mockReq, mockRes);
                } else {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: `Module at ${pathname} does not export a default handler function.` }));
                }
              } catch (err: any) {
                console.error(`Error executing handler for ${pathname}:`, err);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err.message || "Internal Server Error" }));
              }
              return;
            }
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
