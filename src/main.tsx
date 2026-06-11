import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import 'leaflet/dist/leaflet.css';

// Self-healing: Unregister any active service worker and clear caches to fix corrupted caching
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((unregistered) => {
        if (unregistered) {
          console.log("Corrupted service worker unregistered successfully.");
          window.location.reload();
        }
      });
    }
  });
}

if (typeof window !== "undefined" && "caches" in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
