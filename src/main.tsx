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

  if ("getInstalledRelatedApps" in navigator) {
    (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
      if (relatedApps && relatedApps.length > 0) {
        try {
          localStorage.setItem("sikkanam_pwa_installed", "true");
        } catch (e) {}
      } else if (!isStandalone) {
        try {
          // App uninstalled: remove stale flag so returning web browser users get prompted cleanly
          localStorage.removeItem("sikkanam_pwa_installed");
        } catch (e) {}
      }
    }).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
