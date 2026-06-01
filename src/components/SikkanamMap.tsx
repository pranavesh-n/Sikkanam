import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
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

interface Props {
  destination?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export default function SikkanamMap({ destination }: Props) {
  return (
    <MapContainer
      center={
        destination
          ? [destination.lat, destination.lng]
          : [11.1271, 78.6569]
      }
      zoom={destination ? 11 : 7}
      style={{
        height: "calc(100vh - 80px)",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {destination && (
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>{destination.name}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}