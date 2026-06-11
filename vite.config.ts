import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import generatePlanHandler from "./api/generatePlan.js";
import chatHandler from "./api/chat.js";
import fs from "fs";

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
    port: 8080,
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
          if (req.url?.startsWith("/api/generatePlan")) {
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const parsedBody = body ? JSON.parse(body) : {};
            
            const mockReq = { body: parsedBody, method: req.method };
            const mockRes = {
              status(code) {
                res.statusCode = code;
                return this;
              },
              json(data) {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              },
              setHeader(name, val) {
                res.setHeader(name, val);
              }
            };
            
            try {
              await generatePlanHandler(mockReq, mockRes);
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }
          if (req.url?.startsWith("/api/chat")) {
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const parsedBody = body ? JSON.parse(body) : {};
            
            const mockReq = { body: parsedBody, method: req.method };
            const mockRes = {
              status(code) {
                res.statusCode = code;
                return this;
              },
              json(data) {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              },
              setHeader(name, val) {
                res.setHeader(name, val);
              }
            };
            
            try {
              await chatHandler(mockReq, mockRes);
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
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
