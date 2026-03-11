"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { terraces } from "@/data/terraces";
import FilterBar from "@/components/FilterBar";
import { isOpenNow } from "@/lib/utils";
import TerraceCard from "@/components/TerraceCard";
import TerraceDetail from "@/components/TerraceDetail";
import { useLang } from "@/lib/LanguageContext";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const MONTREAL_CENTER: [number, number] = [45.5152, -73.58];
const DEFAULT_ZOOM = 13;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const { lang, setLang, t } = useLang();
  const [search, setSearch] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [terraceType, setTerraceType] = useState("");
  const [dogFriendly, setDogFriendly] = useState(false);
  const [covered, setCovered] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("list");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locating, setLocating] = useState(false);

  const savedScrollTop = useRef(0);
  const desktopListRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);

  const handleSortByDistance = useCallback(() => {
    if (sortByDistance) {
      setSortByDistance(false);
      return;
    }
    if (userLocation) {
      setSortByDistance(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }, [sortByDistance, userLocation]);

  const filteredWithDistance = useMemo(() => {
    const base = terraces.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          t.name.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q) ||
          t.cuisineType.toLowerCase().includes(q) ||
          t.neighborhood.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (neighborhood && t.neighborhood !== neighborhood) return false;
      if (terraceType && t.terraceType !== terraceType) return false;
      if (dogFriendly && !t.dogFriendly) return false;
      if (covered && !t.covered) return false;
      if (openNow && isOpenNow(t) !== true) return false;
      return true;
    });

    if (sortByDistance && userLocation) {
      const withDist = base.map((t) => ({
        t,
        dist: haversineKm(userLocation.lat, userLocation.lng, t.lat, t.lng),
      }));
      withDist.sort((a, b) => a.dist - b.dist);
      return withDist.map(({ t, dist }) => ({ terrace: t, distance: dist }));
    }

    return base.map((t) => ({ terrace: t, distance: undefined }));
  }, [search, neighborhood, terraceType, dogFriendly, covered, openNow, sortByDistance, userLocation]);

  const filtered = useMemo(() => filteredWithDistance.map((x) => x.terrace), [filteredWithDistance]);

  const selectedTerrace = selectedId
    ? terraces.find((t) => t.id === selectedId) ?? null
    : null;

  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedTerrace) return [selectedTerrace.lat, selectedTerrace.lng];
    return MONTREAL_CENTER;
  }, [selectedTerrace]);

  const mapZoom = selectedTerrace ? 16 : DEFAULT_ZOOM;

  const openTerrace = useCallback((id: string) => {
    savedScrollTop.current = desktopListRef.current?.scrollTop ?? mobileListRef.current?.scrollTop ?? 0;
    setSelectedId(id);
  }, []);

  const closeTerrace = useCallback(() => {
    setSelectedId(null);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      requestAnimationFrame(() => {
        if (desktopListRef.current) desktopListRef.current.scrollTop = savedScrollTop.current;
        if (mobileListRef.current) mobileListRef.current.scrollTop = savedScrollTop.current;
      });
    }
  }, [selectedId]);

  const filterBarProps = {
    search, onSearchChange: setSearch,
    selectedNeighborhood: neighborhood, onNeighborhoodChange: setNeighborhood,
    selectedType: terraceType, onTypeChange: setTerraceType,
    dogFriendly, onDogFriendlyChange: setDogFriendly,
    covered, onCoveredChange: setCovered,
    openNow, onOpenNowChange: setOpenNow,
    sortByDistance, onSortByDistanceChange: handleSortByDistance,
    locating,
    resultCount: filteredWithDistance.length,
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row overflow-hidden bg-background">
      {/* ── Desktop sidebar ── */}
      <div className="hidden md:flex w-[500px] shrink-0 flex-col h-full border-r border-border-strong bg-background">
        {/* Header — always visible */}
        <div className="p-5 pb-0 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="16,1 14,8 18,8" fill="#c45d3e"/>
                <polygon points="16,31 14,24 18,24" fill="#c45d3e"/>
                <polygon points="1,16 8,14 8,18" fill="#c45d3e"/>
                <polygon points="31,16 24,14 24,18" fill="#c45d3e"/>
                <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e"/>
                <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e"/>
                <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e"/>
                <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e"/>
                <circle cx="16" cy="16" r="6" fill="#c45d3e"/>
              </svg>
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight leading-none">
                  Terrace Season
                </h1>
                <p className="text-[11px] text-muted mt-0.5 tracking-wide uppercase">
                  Montr&eacute;al
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "en" ? "fr" : "en")}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors font-medium tracking-wide"
              >
                {lang === "en" ? "FR" : "EN"}
              </button>
              <Link
                href="/submit"
                className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors"
              >
                {t.submit}
              </Link>
            </div>
          </div>
        </div>

        {/* Filters or Detail — swaps based on selection */}
        {selectedTerrace ? (
          <TerraceDetail terrace={selectedTerrace} onClose={closeTerrace} />
        ) : (
          <>
            <div className="px-5 pb-0 shrink-0">
              <FilterBar {...filterBarProps} />
            </div>

            <div className="mx-5 mt-3 h-px bg-border shrink-0" />

            <div ref={desktopListRef} className="flex-1 overflow-y-auto overflow-x-hidden w-0 min-w-full p-4 space-y-2.5">
              {filteredWithDistance.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">&#9789;</p>
                  <p className="text-sm text-muted">{t.noResults}</p>
                </div>
              ) : (
                filteredWithDistance.map(({ terrace, distance }, i) => (
                  <div
                    key={terrace.id}
                    className="card-enter"
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    <TerraceCard
                      terrace={terrace}
                      selected={selectedId === terrace.id}
                      onClick={() => openTerrace(terrace.id)}
                      distance={distance}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Desktop map ── */}
      <div className="hidden md:block flex-1 h-full">
        <Map
          terraces={filtered}
          selectedId={selectedId}
          onSelect={openTerrace}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile header */}
        <div className="shrink-0 px-4 pt-3 pb-2 bg-background border-b border-border">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="16,1 14,8 18,8" fill="#c45d3e"/>
                <polygon points="16,31 14,24 18,24" fill="#c45d3e"/>
                <polygon points="1,16 8,14 8,18" fill="#c45d3e"/>
                <polygon points="31,16 24,14 24,18" fill="#c45d3e"/>
                <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e"/>
                <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e"/>
                <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e"/>
                <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e"/>
                <circle cx="16" cy="16" r="6" fill="#c45d3e"/>
              </svg>
              <h1 className="font-display text-base font-bold tracking-tight leading-none">
                Terrace Season
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "en" ? "fr" : "en")}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted font-medium tracking-wide"
              >
                {lang === "en" ? "FR" : "EN"}
              </button>
              <Link
                href="/submit"
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted"
              >
                {t.submit}
              </Link>
            </div>
          </div>

          {!selectedTerrace && <FilterBar {...filterBarProps} />}
        </div>

        {/* Mobile: detail takes over, or show tabs */}
        {selectedTerrace ? (
          <TerraceDetail terrace={selectedTerrace} onClose={closeTerrace} />
        ) : (
          <>
            <div className="shrink-0 flex bg-background border-b border-border">
              <button
                onClick={() => setMobileView("list")}
                className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors cursor-pointer ${
                  mobileView === "list"
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted"
                }`}
              >
                {t.list} ({filteredWithDistance.length})
              </button>
              <button
                onClick={() => setMobileView("map")}
                className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors cursor-pointer ${
                  mobileView === "map"
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted"
                }`}
              >
                {t.map}
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <div
                ref={mobileListRef}
                className={`absolute inset-0 overflow-y-auto p-3 space-y-2 transition-opacity duration-200 ${
                  mobileView === "list"
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {filteredWithDistance.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">&#9789;</p>
                    <p className="text-sm text-muted">{t.noResults}</p>
                  </div>
                ) : (
                  filteredWithDistance.map(({ terrace, distance }) => (
                    <TerraceCard
                      key={terrace.id}
                      terrace={terrace}
                      selected={selectedId === terrace.id}
                      onClick={() => openTerrace(terrace.id)}
                      distance={distance}
                    />
                  ))
                )}
              </div>

              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  mobileView === "map"
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Map
                  terraces={filtered}
                  selectedId={selectedId}
                  onSelect={openTerrace}
                  center={mapCenter}
                  zoom={mapZoom}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
