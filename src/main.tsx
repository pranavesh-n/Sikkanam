import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import 'leaflet/dist/leaflet.css';

declare global {
  interface Window {
    deferredPwaPrompt?: any;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.deferredPwaPrompt = e;
  });

  window.addEventListener("appinstalled", () => {
    window.deferredPwaPrompt = null;
    try {
      localStorage.setItem("sikkanam_pwa_installed", "true");
    } catch (err) {}
  });
}

createRoot(document.getElementById("root")!).render(<App />);
