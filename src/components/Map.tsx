"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Terrace } from "@/lib/types";
import { getHoursStatus } from "@/lib/utils";

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

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createIcon(active: boolean, name: string) {
  const activeClass = active ? "active" : "";
  const label = escapeHtml(name);
  return L.divIcon({
    className: "",
    html: `<div class="terrace-marker-wrapper ${activeClass}" style="position:relative;width:36px"><div class="terrace-marker ${activeClass}"><span class="terrace-marker-inner"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="16" height="16"><polygon points="16,1 14,8 18,8" fill="white"/><polygon points="16,31 14,24 18,24" fill="white"/><polygon points="1,16 8,14 8,18" fill="white"/><polygon points="31,16 24,14 24,18" fill="white"/><polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="white"/><polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="white"/><polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="white"/><polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="white"/><circle cx="16" cy="16" r="6" fill="white"/></svg></span></div><div class="terrace-marker-label-wrap"><div class="terrace-marker-label-nub"></div><span class="terrace-marker-label">${label}</span></div></div>`,
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
  balcony: "Balcony",
  garden: "Garden",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#c45d3e", fontSize: 12, letterSpacing: 1 }}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function TerracePopup({
  t,
  onViewDetails,
}: {
  t: Terrace;
  onViewDetails?: (id: string) => void;
}) {
  const hours = getHoursStatus(t);
  const photo = t.photos?.[0];

  return (
    <div
      style={{
        width: 240,
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      {/* Photo */}
      {photo && (
        <div style={{ height: 130, overflow: "hidden", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={t.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Gradient overlay for close button legibility */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 60,
              height: 40,
              background:
                "linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.35) 100%)",
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "12px 14px 13px" }}>
        {/* Name */}
        <p
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 15,
            fontWeight: 700,
            color: "#2c2418",
            marginBottom: 3,
            lineHeight: 1.25,
          }}
        >
          {t.name}
        </p>

        {/* Neighborhood · cuisine */}
        <p style={{ fontSize: 11, color: "#9c8b78", marginBottom: 7 }}>
          {t.neighborhood}
          {t.cuisineType ? ` · ${t.cuisineType}` : ""}
        </p>

        {/* Open/closed status */}
        {hours && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 7,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.04em",
                padding: "2px 7px",
                borderRadius: 20,
                background: hours.open
                  ? "rgba(74,142,74,0.12)"
                  : "rgba(180,60,40,0.1)",
                color: hours.open ? "#3a8a3a" : "#b43c28",
              }}
            >
              {hours.open ? "OPEN" : "CLOSED"}
            </span>
            {hours.qualifier && (
              <span style={{ fontSize: 11, color: "#9c8b78" }}>
                {hours.qualifier}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {t.googleRating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 8,
            }}
          >
            <StarRating rating={t.googleRating} />
            <span style={{ fontSize: 11, color: "#9c8b78" }}>
              {t.googleRating.toFixed(1)}
              {t.googleReviewCount
                ? ` (${t.googleReviewCount.toLocaleString()})`
                : ""}
            </span>
          </div>
        )}

        {/* Badges row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {t.terraceType?.map((tt) => (
            <span
              key={tt}
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 7px",
                borderRadius: 20,
                background: "rgba(196,93,62,0.1)",
                color: "#c45d3e",
              }}
            >
              {terraceTypeLabel[tt]}
            </span>
          ))}
          {t.dogFriendly && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 7px",
                borderRadius: 20,
                background: "rgba(100,80,50,0.08)",
                color: "#7a6040",
              }}
            >
              🐾 Dog friendly
            </span>
          )}
          {t.heated && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 7px",
                borderRadius: 20,
                background: "rgba(100,80,50,0.08)",
                color: "#7a6040",
              }}
            >
              🔥 Heated
            </span>
          )}
          {t.covered && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: "2px 7px",
                borderRadius: 20,
                background: "rgba(100,80,50,0.08)",
                color: "#7a6040",
              }}
            >
              ☂ Covered
            </span>
          )}
        </div>

        {/* View details button — only on mobile map */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(t.id)}
            style={{
              marginTop: 11,
              width: "100%",
              padding: "7px 0",
              borderRadius: 8,
              background: "#c45d3e",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            View details →
          </button>
        )}
      </div>
    </div>
  );
}

interface MapProps {
  terraces: Terrace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onViewDetails?: (id: string) => void;
  center: [number, number];
  zoom: number;
}

export default function Map({
  terraces,
  selectedId,
  onSelect,
  onViewDetails,
  center,
  zoom,
}: MapProps) {
  const safeCenter = isValidLatLng(center[0], center[1])
    ? center
    : FALLBACK_CENTER;

  const validTerraces = terraces.filter((t) => isValidLatLng(t.lat, t.lng));

  return (
    <MapContainer
      center={safeCenter}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo center={safeCenter} zoom={zoom} />
      {validTerraces.map((t) => (
        <Marker
          key={t.id}
          position={[t.lat, t.lng]}
          icon={createIcon(selectedId === t.id, t.name)}
          eventHandlers={{ click: () => onSelect(t.id) }}
          title={t.name}
          alt={t.name}
        >
          <Popup>
            <TerracePopup t={t} onViewDetails={onViewDetails} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
