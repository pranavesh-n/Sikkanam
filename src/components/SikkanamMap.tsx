import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper to create clean custom SVG icons for markers
const createSvgIcon = (color: string) => {
  return new L.DivIcon({
    html: `<div style="filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3));">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="34px" height="34px">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    className: "custom-marker-svg",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const startIcon = createSvgIcon("#10b981"); // Emerald Green
const endIcon = createSvgIcon("#ef4444");   // Rose Red

interface LocationInfo {
  lat: number;
  lng: number;
  name: string;
}

interface Props {
  source?: LocationInfo;
  destination?: LocationInfo;
  routeGeometry?: [number, number][];
}

// Controller component to dynamically pan and zoom the map to fit active pins/routes
function MapBoundsController({ source, destination, routeGeometry }: Props) {
  const map = useMap();

  useEffect(() => {
    if (routeGeometry && routeGeometry.length > 0) {
      const bounds = L.latLngBounds(routeGeometry);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (source && destination) {
      const bounds = L.latLngBounds([
        [source.lat, source.lng],
        [destination.lat, destination.lng],
      ]);
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 11);
    } else if (source) {
      map.setView([source.lat, source.lng], 11);
    }
  }, [source, destination, routeGeometry, map]);

  useEffect(() => {
    // Invalidate map size to trigger correct tile rendering if dimensions changed
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map, source, destination]);

  return null;
}

export default function SikkanamMap({ source, destination, routeGeometry }: Props) {
  const hasRoute = routeGeometry && routeGeometry.length > 0;
  
  // Choose initial center and zoom
  const initialCenter: [number, number] = destination 
    ? [destination.lat, destination.lng] 
    : source 
      ? [source.lat, source.lng] 
      : [11.1271, 78.6569];
      
  const initialZoom = (destination || source) ? 11 : 7;

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {source && (
        <Marker position={[source.lat, source.lng]} icon={startIcon}>
          <Popup>
            <div className="font-sans">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Start</span>
              <p className="font-semibold text-sm mt-0.5">{source.name}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={endIcon}>
          <Popup>
            <div className="font-sans">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Destination</span>
              <p className="font-semibold text-sm mt-0.5">{destination.name}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {hasRoute && (
        <Polyline
          positions={routeGeometry}
          color="hsl(var(--primary))"
          weight={5}
          opacity={0.8}
        />
      )}

      <MapBoundsController source={source} destination={destination} routeGeometry={routeGeometry} />
    </MapContainer>
  );
}