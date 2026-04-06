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
import { trackEvent } from "@/lib/analytics";
import { TerraceType } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const NEIGHBORHOODS = [
  "Ahuntsic",
  "Chinatown",
  "Downtown",
  "Griffintown",
  "Hochelaga",
  "Latin Quarter",
  "Laval",
  "Little Burgundy",
  "Little Italy",
  "Mile End",
  "Mile-Ex",
  "NDG",
  "Old Montreal",
  "Old Port",
  "Outremont",
  "Parc-Extension",
  "Petite-Patrie",
  "Plateau-Mont-Royal",
  "Pointe-Saint-Charles",
  "Quartier des Spectacles",
  "Rosemont",
  "Saint-Henri",
  "South Shore",
  "The Village",
  "Verdun",
  "Villeray",
  "West Island",
];

const MONTREAL_CENTER: [number, number] = [45.5152, -73.58];
const DEFAULT_ZOOM = 13;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
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

function LocateOverlayButton({
  onLocate,
  locating,
}: {
  onLocate: () => void;
  locating: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        right: 12,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={onLocate}
        title="My location"
        style={{
          width: 36,
          height: 36,
          background: "#fff",
          border: "2px solid rgba(0,0,0,0.15)",
          borderRadius: 6,
          cursor: locating ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          opacity: locating ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke={locating ? "#9c8b78" : "#4285F4"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      </button>
    </div>
  );
}

const LogoIcon = () => (
  <svg
    className="w-7 h-7 shrink-0"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="16,1 14,8 18,8" fill="#c45d3e" />
    <polygon points="16,31 14,24 18,24" fill="#c45d3e" />
    <polygon points="1,16 8,14 8,18" fill="#c45d3e" />
    <polygon points="31,16 24,14 24,18" fill="#c45d3e" />
    <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e" />
    <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e" />
    <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e" />
    <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e" />
    <circle cx="16" cy="16" r="6" fill="#c45d3e" />
  </svg>
);

export default function Home() {
  const { lang, setLang, t } = useLang();
  const [search, setSearch] = useState("");
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [terraceTypes, setTerraceTypes] = useState<string[]>([]);
  const [dogFriendly, setDogFriendly] = useState(false);
  const [covered, setCovered] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("list");
  const [mobileMapHighlightId, setMobileMapHighlightId] = useState<
    string | null
  >(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locatedAt, setLocatedAt] = useState<[number, number] | null>(null);
  const [mapLocating, setMapLocating] = useState(false);
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [allCardsLoaded, setAllCardsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<
    "ios" | "android" | "desktop"
  >("desktop");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setInstallPlatform("ios");
    else if (/android/i.test(ua)) setInstallPlatform("android");
    else setInstallPlatform("desktop");
  }, []);
  const [desktopMapMounted, setDesktopMapMounted] = useState(false);
  const [mobileMapMounted, setMobileMapMounted] = useState(true);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const neighborhoodDropdownRef = useRef<HTMLDivElement>(null);
  const savedScrollTop = useRef(0);
  const desktopListRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cb = () => setAllCardsLoaded(true);
    if ("requestIdleCallback" in window) {
      (
        window as Window & { requestIdleCallback: (cb: () => void) => void }
      ).requestIdleCallback(cb);
    } else {
      setTimeout(cb, 200);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) setDesktopMapMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      if (
        neighborhoodDropdownRef.current &&
        !neighborhoodDropdownRef.current.contains(e.target as Node)
      ) {
        setNeighborhoodOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNeighborhood = useCallback((n: string) => {
    setNeighborhoods((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );
  }, []);

  const toggleType = useCallback((v: string) => {
    setTerraceTypes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  }, []);

  const terraceTypesList: { value: TerraceType; label: string }[] = [
    { value: "sidewalk", label: t.sidewalk },
    { value: "rooftop", label: t.rooftop },
    { value: "backyard", label: t.backyard },
    { value: "courtyard", label: t.courtyard },
    { value: "balcony", label: t.balcony },
    { value: "garden", label: t.garden },
  ];

  const typeLabel =
    terraceTypes.length === 0
      ? t.allTypes
      : terraceTypes.length === 1
        ? (terraceTypesList.find((tt) => tt.value === terraceTypes[0])?.label ??
          terraceTypes[0])
        : `${terraceTypes.length} ${t.types}`;

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
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortByDistance(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false },
    );
  }, [sortByDistance, userLocation]);

  const handleLocateOnMap = useCallback(() => {
    if (mapLocating) return;
    setMapLocating(true);
    const fallback = setTimeout(() => setMapLocating(false), 8000);
    const done = (pos?: GeolocationPosition) => {
      clearTimeout(fallback);
      if (pos) {
        setLocatedAt([pos.coords.latitude, pos.coords.longitude]);
        setLocateTrigger((n) => n + 1);
      }
      setMapLocating(false);
    };
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        navigator.geolocation.clearWatch(watchId);
        done(pos);
      },
      () => {
        navigator.geolocation.clearWatch(watchId);
        done();
      },
      { timeout: 6000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }, [mapLocating]);

  const filteredWithDistance = useMemo(() => {
    const q = search.toLowerCase();
    const scored = terraces
      .flatMap((t) => {
        if (search) {
          const nameLower = t.name.toLowerCase();
          const match =
            nameLower.includes(q) ||
            t.address.toLowerCase().includes(q) ||
            t.cuisineType.toLowerCase().includes(q);
          if (!match) return [];
          const score = nameLower.startsWith(q)
            ? 0
            : nameLower.includes(q)
              ? 1
              : 2;
          return [{ terrace: t, score }];
        }
        return [{ terrace: t, score: 0 }];
      })
      .filter(({ terrace: t }) => {
        if (neighborhoods.length > 0 && !neighborhoods.includes(t.neighborhood))
          return false;
        if (
          terraceTypes.length > 0 &&
          (!t.terraceType ||
            !t.terraceType.some((tt) => terraceTypes.includes(tt)))
        )
          return false;
        if (dogFriendly && !t.dogFriendly) return false;
        if (covered && !t.covered) return false;
        if (openNow && isOpenNow(t) !== true) return false;
        return true;
      });

    if (sortByDistance && userLocation) {
      const withDist = scored.map(({ terrace: t }) => ({
        t,
        dist: haversineKm(userLocation.lat, userLocation.lng, t.lat, t.lng),
      }));
      withDist.sort((a, b) => a.dist - b.dist);
      return withDist.map(({ t, dist }) => ({ terrace: t, distance: dist }));
    }

    if (search) scored.sort((a, b) => a.score - b.score);

    return scored.map(({ terrace: t }) => ({
      terrace: t,
      distance: undefined,
    }));
  }, [
    search,
    neighborhoods,
    terraceTypes,
    dogFriendly,
    covered,
    openNow,
    sortByDistance,
    userLocation,
  ]);

  const filtered = useMemo(
    () => filteredWithDistance.map((x) => x.terrace),
    [filteredWithDistance],
  );

  const INITIAL_CARD_COUNT = 4;
  const visibleCards = allCardsLoaded
    ? filteredWithDistance
    : filteredWithDistance.slice(0, INITIAL_CARD_COUNT);

  const selectedTerrace = selectedId
    ? (terraces.find((t) => t.id === selectedId) ?? null)
    : null;

  const [mapCenter, setMapCenter] = useState<[number, number]>(MONTREAL_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  const openTerrace = useCallback((id: string) => {
    savedScrollTop.current =
      desktopListRef.current?.scrollTop ??
      mobileListRef.current?.scrollTop ??
      0;
    const t = terraces.find((t) => t.id === id);
    if (t) {
      setMapCenter([t.lat, t.lng]);
      setMapZoom(16);
    }
    setSelectedId(id);
  }, []);

  const openFromCard = useCallback(
    (id: string) => {
      trackEvent(id, "card_click");
      openTerrace(id);
    },
    [openTerrace],
  );

  const openFromMap = useCallback(
    (id: string) => {
      trackEvent(id, "map_marker_click");
      openTerrace(id);
    },
    [openTerrace],
  );

  const closeTerrace = useCallback(() => {
    setSelectedId(null);
  }, []);

  useEffect(() => {
    if (locatedAt) {
      setMapCenter(locatedAt);
      setMapZoom(15);
    }
  }, [locatedAt]);

  useEffect(() => {
    if (mobileMapHighlightId) {
      const t = terraces.find((t) => t.id === mobileMapHighlightId);
      if (t) {
        setMapCenter([t.lat + 0.0018, t.lng]);
        setMapZoom(16);
      }
    }
  }, [mobileMapHighlightId]);

  useEffect(() => {
    if (!selectedId) {
      requestAnimationFrame(() => {
        if (desktopListRef.current)
          desktopListRef.current.scrollTop = savedScrollTop.current;
        if (mobileListRef.current)
          mobileListRef.current.scrollTop = savedScrollTop.current;
      });
    }
  }, [selectedId]);

  const filterBarProps = {
    search,
    onSearchChange: setSearch,
    selectedNeighborhoods: neighborhoods,
    onNeighborhoodsChange: setNeighborhoods,
    selectedTypes: terraceTypes,
    onTypesChange: setTerraceTypes,
    dogFriendly,
    onDogFriendlyChange: setDogFriendly,
    covered,
    onCoveredChange: setCovered,
    openNow,
    onOpenNowChange: setOpenNow,
    sortByDistance,
    onSortByDistanceChange: handleSortByDistance,
    locating,
    resultCount: filteredWithDistance.length,
    mobileView,
    onLocateOnMap: handleLocateOnMap,
    mapLocating,
  };

  // Shared pill class helper
  const pillClass = (active: boolean) =>
    `shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
      active
        ? "bg-foreground text-white border-foreground"
        : "border-border text-muted bg-white/40 hover:border-border-strong hover:text-foreground"
    }`;

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* ══ Desktop Header ══ */}
      <header className="hidden md:flex relative shrink-0 items-center gap-4 px-6 h-16 bg-background border-b border-border z-[1000]">
        {/* Logo */}
        <div className="flex items-start gap-2.5 shrink-0">
          <div className="mt-[3px]">
            <LogoIcon />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight leading-none">
              Terrasse Season
            </h1>
            <p className="text-[10px] text-muted tracking-wide mt-0.5">
              {lang === "fr"
                ? "Le guide des terrasses de Montréal"
                : "Montreal's terrace guide"}
            </p>
          </div>
        </div>

        {/* Search pill */}
        <div className="flex-1 flex justify-center">
          <div className="relative flex items-stretch h-11 bg-white rounded-full border border-border-strong shadow-sm w-full max-w-2xl">
            {/* Segment 1: Name search */}
            <div className="flex-1 flex items-center gap-2 px-4 border-r border-border min-w-0">
              <svg
                className="w-3.5 h-3.5 text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-light min-w-0"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-muted hover:text-foreground shrink-0 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Segment 2: Neighborhood dropdown */}
            <div
              className="relative flex items-center shrink-0"
              ref={neighborhoodDropdownRef}
            >
              <button
                onClick={() => setNeighborhoodOpen(!neighborhoodOpen)}
                className={`flex items-center gap-1.5 px-4 h-full border-r border-border text-sm whitespace-nowrap transition-colors cursor-pointer ${
                  neighborhoods.length > 0
                    ? "text-foreground font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {neighborhoods.length === 0
                  ? t.allNeighborhoods
                  : neighborhoods.length === 1
                    ? neighborhoods[0]
                    : `${neighborhoods.length} ${t.neighborhoods}`}
                <svg
                  className={`w-3 h-3 shrink-0 transition-transform duration-150 ${neighborhoodOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {neighborhoodOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl border border-border shadow-lg py-1.5 min-w-[200px] max-h-72 overflow-y-auto z-[1000]">
                  {neighborhoods.length > 0 && (
                    <div className="px-3 py-1.5 border-b border-border">
                      <button
                        onClick={() => setNeighborhoods([])}
                        className="text-[11px] text-accent hover:underline cursor-pointer"
                      >
                        {t.clearAll}
                      </button>
                    </div>
                  )}
                  {NEIGHBORHOODS.map((n) => (
                    <label
                      key={n}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={neighborhoods.includes(n)}
                        onChange={() => toggleNeighborhood(n)}
                        className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                      />
                      <span className="text-sm text-foreground">{n}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Segment 3: Open now toggle */}
            <button
              onClick={() => setOpenNow(!openNow)}
              className={`flex items-center gap-1.5 px-4 h-full rounded-r-full text-sm whitespace-nowrap transition-colors cursor-pointer ${
                openNow
                  ? "bg-accent text-white font-medium"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {openNow && (
                <svg
                  className="w-3 h-3 shrink-0"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <circle cx="6" cy="6" r="3" />
                </svg>
              )}
              {t.openNow}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/submit"
            className="text-xs px-4 py-1.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors font-medium whitespace-nowrap"
          >
            {lang === "fr" ? "Soumettre une terrasse" : "Submit a terrace"}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="text-[11px] px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all font-semibold tracking-wide cursor-pointer"
          >
            {lang === "en" ? "Français" : "English"}
          </button>
          <div className="w-px h-4 bg-border shrink-0 ml-1" />
          <nav className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              {lang === "fr" ? "Notes" : "Blog"}
            </Link>
            <Link
              href="/about"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              {lang === "fr" ? "À propos" : "About"}
            </Link>
            <Link
              href="/faq"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      {/* ══ Desktop Filter Bar ══ */}
      <div className="hidden md:flex shrink-0 border-b border-border bg-background items-stretch justify-center px-6">
        {/* Terrace type group */}
        <div className="flex items-center gap-1.5 py-2.5 pr-5">
          <span className="text-[10px] font-semibold text-muted-light uppercase tracking-wider shrink-0 mr-1">
            {lang === "fr" ? "Type" : "Type"}
          </span>
          {terraceTypesList.map((tt) => (
            <button
              key={tt.value}
              onClick={() => toggleType(tt.value)}
              className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                terraceTypes.includes(tt.value)
                  ? "bg-accent text-white shadow-sm shadow-accent/30"
                  : "bg-[#ede8e0] text-muted hover:bg-[#e4ddd4] hover:text-foreground"
              }`}
            >
              {tt.label}
            </button>
          ))}
        </div>

        {/* Full-height divider */}
        <div className="w-px bg-border self-stretch" />

        {/* Attribute filter group */}
        <div className="flex items-center gap-1.5 py-2.5 pl-5">
          <span className="text-[10px] font-semibold text-muted-light uppercase tracking-wider shrink-0 mr-1">
            {lang === "fr" ? "Filtres" : "Filters"}
          </span>
          <button
            onClick={handleSortByDistance}
            disabled={locating}
            className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-default ${
              sortByDistance
                ? "bg-accent text-white shadow-sm shadow-accent/30"
                : "bg-[#ede8e0] text-muted hover:bg-[#e4ddd4] hover:text-foreground"
            }`}
          >
            {locating ? t.locating : t.nearMe}
          </button>
          <button
            onClick={() => setDogFriendly(!dogFriendly)}
            className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
              dogFriendly
                ? "bg-accent text-white shadow-sm shadow-accent/30"
                : "bg-[#ede8e0] text-muted hover:bg-[#e4ddd4] hover:text-foreground"
            }`}
          >
            {t.dogFriendly}
          </button>
          <button
            onClick={() => setCovered(!covered)}
            className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
              covered
                ? "bg-accent text-white shadow-sm shadow-accent/30"
                : "bg-[#ede8e0] text-muted hover:bg-[#e4ddd4] hover:text-foreground"
            }`}
          >
            {t.covered}
          </button>
        </div>
      </div>

      {/* ══ Desktop Content ══ */}
      <div
        className="hidden md:grid flex-1 overflow-hidden"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Left: scrollable card grid */}
        <div
          ref={desktopListRef}
          className="overflow-y-auto overflow-x-hidden border-r border-border"
        >
          <div className="p-4 pb-8">
            <p className="text-[11px] text-muted mb-3 px-0.5">
              {t.spots(filteredWithDistance.length)}
            </p>
            {filteredWithDistance.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">&#9789;</p>
                <p className="text-sm text-muted">{t.noResults}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {visibleCards.map(({ terrace, distance }, i) => (
                  <div
                    key={terrace.id}
                    className="card-enter"
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                    onMouseEnter={() => setHoveredId(terrace.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <TerraceCard
                      terrace={terrace}
                      selected={selectedId === terrace.id}
                      onClick={() => openFromCard(terrace.id)}
                      distance={distance}
                      priority={i === 0}
                      compact
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer links — bottom of card grid */}
          <div className="border-t border-border px-5 py-3 flex items-center gap-4">
            <Link
              href="/blog"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              {lang === "fr" ? "Notes" : "Blog"}
            </Link>
            <Link
              href="/about"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              {lang === "fr" ? "À propos" : "About"}
            </Link>
            <Link
              href="/faq"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted hover:text-foreground transition-colors ml-auto"
            >
              {lang === "fr" ? "Conditions" : "Terms"}
            </Link>
          </div>
        </div>

        {/* Right: map + detail overlay */}
        <div className="relative h-full">
          {desktopMapMounted && (
            <Map
              terraces={filtered}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onViewDetails={openFromMap}
              center={mapCenter}
              zoom={mapZoom}
              userPosition={locatedAt}
              flyTrigger={locateTrigger}
              panelOffset={selectedTerrace ? 220 : 0}
            />
          )}
          <LocateOverlayButton
            onLocate={handleLocateOnMap}
            locating={mapLocating}
          />

          {/* Detail panel — slides in over right portion of map */}
          {/* z-[1000] needed: Leaflet panes go up to z-index 800 */}
          {selectedTerrace && (
            <div className="absolute right-0 top-0 bottom-0 w-[440px] bg-background shadow-2xl overflow-y-auto z-[1000] flex flex-col animate-slide-in-right border-l border-border">
              <TerraceDetail
                terrace={selectedTerrace}
                onClose={closeTerrace}
                closeOnly
              />
            </div>
          )}
        </div>
      </div>

      {/* ══ Mobile Layout ══ */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile header */}
        <div className="shrink-0 px-4 pt-3 pb-2 bg-background border-b border-border">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 shrink-0"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon points="16,1 14,8 18,8" fill="#c45d3e" />
                <polygon points="16,31 14,24 18,24" fill="#c45d3e" />
                <polygon points="1,16 8,14 8,18" fill="#c45d3e" />
                <polygon points="31,16 24,14 24,18" fill="#c45d3e" />
                <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e" />
                <polygon
                  points="26.6,26.6 21.8,23.6 24.2,21.2"
                  fill="#c45d3e"
                />
                <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e" />
                <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e" />
                <circle cx="16" cy="16" r="6" fill="#c45d3e" />
              </svg>
              <div>
                <h1 className="font-display text-base font-bold tracking-tight leading-none">
                  Terrasse Season
                </h1>
                <p className="text-[9px] text-muted tracking-wide mt-0.5">
                  {lang === "fr"
                    ? "Les terrasses de Montréal"
                    : "Montreal's terrace guide"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/submit"
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted"
              >
                {t.submit}
              </Link>
              <button
                onClick={() => setLang(lang === "en" ? "fr" : "en")}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-accent/40 text-accent hover:bg-accent hover:text-white transition-colors font-semibold tracking-wide cursor-pointer"
              >
                {lang === "en" ? "FR" : "EN"}
              </button>
              <div className="relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-7 h-7 flex flex-col items-center justify-center gap-[4px] text-muted hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Menu"
                >
                  <span className="w-4 h-px bg-current rounded-full" />
                  <span className="w-4 h-px bg-current rounded-full" />
                  <span className="w-4 h-px bg-current rounded-full" />
                </button>
                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[120px] z-50">
                    <Link
                      href="/blog"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-foreground hover:bg-foreground/[0.04] transition-colors"
                    >
                      {lang === "fr" ? "Notes" : "Blog"}
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-foreground hover:bg-foreground/[0.04] transition-colors"
                    >
                      {lang === "fr" ? "À propos" : "About"}
                    </Link>
                    <Link
                      href="/faq"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-foreground hover:bg-foreground/[0.04] transition-colors"
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/terms"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-foreground hover:bg-foreground/[0.04] transition-colors"
                    >
                      {lang === "fr" ? "Conditions" : "Terms"}
                    </Link>
                    <div className="border-t border-border mx-2 my-1" />
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowInstallModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-accent font-medium hover:bg-foreground/[0.04] transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                        />
                      </svg>
                      {lang === "fr" ? "Installer l'app" : "Install App"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!selectedTerrace && <FilterBar {...filterBarProps} />}
        </div>

        {/* Mobile: detail or tabs + content */}
        {selectedTerrace ? (
          <TerraceDetail
            terrace={selectedTerrace}
            onClose={closeTerrace}
            backLabel={mobileView === "map" ? "Back to map" : undefined}
          />
        ) : (
          <>
            {/* Toggle: List (left) | Map (right) */}
            <div className="shrink-0 px-4 py-2.5 bg-background border-b border-border">
              <div className="flex rounded-xl bg-[#ede8e0] p-1 gap-1">
                {/* List tab — now on left */}
                <button
                  onClick={() => setMobileView("list")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mobileView === "list"
                      ? "bg-white text-accent shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1"
                      y="3"
                      width="14"
                      height="2"
                      rx="1"
                      fill="currentColor"
                    />
                    <rect
                      x="1"
                      y="7"
                      width="14"
                      height="2"
                      rx="1"
                      fill="currentColor"
                    />
                    <rect
                      x="1"
                      y="11"
                      width="14"
                      height="2"
                      rx="1"
                      fill="currentColor"
                    />
                  </svg>
                  {t.list} ({filteredWithDistance.length})
                </button>
                {/* Map tab — now on right */}
                <button
                  onClick={() => {
                    setMobileView("map");
                    setMobileMapMounted(true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mobileView === "map"
                      ? "bg-white text-accent shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.375 4.5 8.5 4.5 8.5s4.5-5.125 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                      fill="currentColor"
                    />
                  </svg>
                  {t.map}
                </button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {/* List view */}
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
                  visibleCards.map(({ terrace, distance }, i) => (
                    <TerraceCard
                      key={terrace.id}
                      terrace={terrace}
                      selected={selectedId === terrace.id}
                      onClick={() => openFromCard(terrace.id)}
                      distance={distance}
                      priority={i === 0}
                    />
                  ))
                )}
              </div>

              {/* Map view */}
              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  mobileView === "map"
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {mobileMapMounted && (
                  <Map
                    terraces={filtered}
                    selectedId={mobileMapHighlightId}
                    onSelect={(id) => {
                      trackEvent(id, "map_marker_click");
                      setMobileMapHighlightId(id);
                    }}
                    onViewDetails={openTerrace}
                    center={mapCenter}
                    zoom={mapZoom}
                    userPosition={locatedAt}
                    flyTrigger={locateTrigger}
                  />
                )}
                <LocateOverlayButton
                  onLocate={handleLocateOnMap}
                  locating={mapLocating}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Install App Modal */}
      {showInstallModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base">
                {lang === "fr" ? "Installer l'app" : "Install App"}
              </h2>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {installPlatform === "ios" && (
              <ol className="space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  {lang === "fr" ? (
                    <>
                      Ouvrez ce site dans <strong>Safari</strong>
                    </>
                  ) : (
                    <>
                      Open this site in <strong>Safari</strong>
                    </>
                  )}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  {lang === "fr" ? (
                    <>
                      Appuyez sur <strong>Partager</strong> ⎙ en bas de l'écran
                    </>
                  ) : (
                    <>
                      Tap the <strong>Share</strong> button ⎙ at the bottom
                    </>
                  )}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  {lang === "fr" ? (
                    <>
                      Appuyez sur <strong>Sur l'écran d'accueil</strong>
                    </>
                  ) : (
                    <>
                      Tap <strong>Add to Home Screen</strong>
                    </>
                  )}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  {lang === "fr" ? (
                    <>
                      Appuyez sur <strong>Ajouter</strong>
                    </>
                  ) : (
                    <>
                      Tap <strong>Add</strong>
                    </>
                  )}
                </li>
              </ol>
            )}

            {installPlatform === "android" && (
              <ol className="space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  {lang === "fr" ? (
                    <>
                      Appuyez sur <strong>⋮</strong> en haut à droite
                    </>
                  ) : (
                    <>
                      Tap <strong>⋮</strong> in the top-right corner
                    </>
                  )}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  {lang === "fr" ? (
                    <>
                      Appuyez sur <strong>Ajouter à l'écran d'accueil</strong>
                    </>
                  ) : (
                    <>
                      Tap <strong>Add to Home Screen</strong>
                    </>
                  )}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  {lang === "fr" ? (
                    <>
                      Appuyez sur <strong>Ajouter</strong>
                    </>
                  ) : (
                    <>
                      Tap <strong>Add</strong>
                    </>
                  )}
                </li>
              </ol>
            )}

            {installPlatform === "desktop" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Chrome / Edge
                  </p>
                  <p className="text-sm text-foreground/80">
                    {lang === "fr" ? (
                      <>
                        Cliquez sur l'icône <strong>installer</strong> ⊕ dans la
                        barre d'adresse, puis sur <strong>Installer</strong>.
                      </>
                    ) : (
                      <>
                        Click the <strong>install</strong> icon ⊕ in the address
                        bar, then click <strong>Install</strong>.
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Safari (Mac)
                  </p>
                  <p className="text-sm text-foreground/80">
                    {lang === "fr" ? (
                      <>
                        Cliquez sur <strong>Partager</strong> →{" "}
                        <strong>Ajouter au Dock</strong>.
                      </>
                    ) : (
                      <>
                        Click <strong>Share</strong> →{" "}
                        <strong>Add to Dock</strong>.
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
