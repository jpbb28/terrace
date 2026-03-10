"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Terrace } from "@/lib/types";

const FALLBACK_CENTER: [number, number] = [45.5152, -73.58];

function isValidLatLng(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng)
  );
}

function createIcon(active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="terrace-marker ${active ? "active" : ""}"><span class="terrace-marker-inner"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="16" height="16"><circle cx="16" cy="16" r="5.5" fill="white"/><line x1="16" y1="2" x2="16" y2="7" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="25" x2="16" y2="30" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="2" y1="16" x2="7" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="16" x2="30" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="6.1" y1="6.1" x2="9.6" y2="9.6" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="22.4" y1="22.4" x2="25.9" y2="25.9" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="25.9" y1="6.1" x2="22.4" y2="9.6" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="9.6" y1="22.4" x2="6.1" y2="25.9" stroke="white" stroke-width="2" stroke-linecap="round"/></svg></span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (
      prevCenter.current[0] === center[0] &&
      prevCenter.current[1] === center[1]
    ) {
      return;
    }
    prevCenter.current = center;

    if (!isValidLatLng(center[0], center[1])) return;

    try {
      map.flyTo(center, zoom, { duration: 0.8 });
    } catch {
      // Leaflet can throw on invalid state during initialization
    }
  }, [center, zoom, map]);

  return null;
}

const terraceTypeLabel: Record<string, string> = {
  sidewalk: "Sidewalk",
  rooftop: "Rooftop",
  backyard: "Backyard",
  courtyard: "Courtyard",
};

interface MapProps {
  terraces: Terrace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  center: [number, number];
  zoom: number;
}

export default function Map({ terraces, selectedId, onSelect, center, zoom }: MapProps) {
  const safeCenter = isValidLatLng(center[0], center[1]) ? center : FALLBACK_CENTER;

  const validTerraces = terraces.filter((t) => isValidLatLng(t.lat, t.lng));

  return (
    <MapContainer center={safeCenter} zoom={zoom} className="h-full w-full" zoomControl={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo center={safeCenter} zoom={zoom} />
      {validTerraces.map((t) => (
        <Marker
          key={t.id}
          position={[t.lat, t.lng]}
          icon={createIcon(selectedId === t.id)}
          eventHandlers={{ click: () => onSelect(t.id) }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-sm mb-1" style={{ color: "#2c2418", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {t.name}
              </p>
              <p className="text-xs mb-1.5" style={{ color: "#9c8b78" }}>{t.address}</p>
              {t.terraceType && (
                <span
                  className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(196, 93, 62, 0.12)", color: "#c45d3e" }}
                >
                  {terraceTypeLabel[t.terraceType]}
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
