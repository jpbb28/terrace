"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { PawPrint, Umbrella, Flame } from "lucide-react";
import { terraces } from "@/data/terraces";
import FilterBar from "@/components/FilterBar";
import { isOpenNow } from "@/lib/utils";
import TerraceCard from "@/components/TerraceCard";
import TerraceDetail from "@/components/TerraceDetail";
import FavoritesTray from "@/components/FavoritesTray";
import Logo from "@/components/Logo";
import NavMenu from "@/components/NavMenu";
import { useFavorites } from "@/lib/favorites";
import { useLang } from "@/lib/LanguageContext";
import { localize } from "@/lib/localize";
import { neighborhoodFR } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { Terrace, TerraceType, TERRACE_TYPES } from "@/lib/types";

const nbhdLabel = (n: string, lang: string) =>
  lang === "fr" ? (neighborhoodFR[n] ?? n) : n;

type SortBy = "recommended" | "rating" | "distance";

function bayesianRating(t: Terrace): number {
  if (!t.googleRating || !t.googleReviewCount) return -Infinity;
  const m = 4.0;
  const C = 50;
  return (
    (t.googleRating * t.googleReviewCount + m * C) / (t.googleReviewCount + C)
  );
}

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

export default function Home() {
  const { lang, t } = useLang();
  // Language follows the URL: English at "/", French at "/fr". The toggle
  // navigates between the two; internal SEO links are prefixed with /fr in
  // French so the user (and crawlers) stay within the French route tree.
  // Functional pages (/submit, /open) stay single-URL with their own toggle.
  const localizePath = (p: string) => localize(lang, p);
  const otherLangHref = lang === "fr" ? "/" : "/fr";
  const { count: favCount } = useFavorites();
  const [favOpen, setFavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [terraceTypes, setTerraceTypes] = useState<string[]>([]);
  const [dogFriendly, setDogFriendly] = useState(false);
  const [covered, setCovered] = useState(false);
  const [heated, setHeated] = useState(false);
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
  const [sortBy, setSortBy] = useState<SortBy>("recommended");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [locating, setLocating] = useState(false);
  const [locatedAt, setLocatedAt] = useState<[number, number] | null>(null);
  const [mapLocating, setMapLocating] = useState(false);
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [allCardsLoaded, setAllCardsLoaded] = useState(false);
  const [desktopMapMounted, setDesktopMapMounted] = useState(false);
  const [mobileMapMounted, setMobileMapMounted] = useState(true);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);

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
        neighborhoodDropdownRef.current &&
        !neighborhoodDropdownRef.current.contains(e.target as Node)
      ) {
        setNeighborhoodOpen(false);
      }
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(e.target as Node)
      ) {
        setSortMenuOpen(false);
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

  const terraceTypesList: { value: TerraceType; label: string }[] =
    TERRACE_TYPES.map((value) => ({ value, label: t[value] }));

  const handleSortChange = useCallback(
    (value: SortBy) => {
      setSortMenuOpen(false);
      if (value !== "distance") {
        setSortBy(value);
        return;
      }
      if (userLocation) {
        setSortBy("distance");
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setSortBy("distance");
          setLocating(false);
        },
        (err) => {
          console.error(
            "[geolocation] distance sort failed:",
            err.code,
            err.message,
          );
          setLocating(false);
        },
        { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false },
      );
    },
    [userLocation],
  );

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
      (err) => {
        console.error(
          "[geolocation] locate-on-map failed:",
          err.code,
          err.message,
        );
        navigator.geolocation.clearWatch(watchId);
        done();
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
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
        if (heated && !t.heated) return false;
        if (openNow && isOpenNow(t) !== true) return false;
        return true;
      });

    const withDist = scored.map(({ terrace: t, score }) => ({
      terrace: t,
      score,
      distance: userLocation
        ? haversineKm(userLocation.lat, userLocation.lng, t.lat, t.lng)
        : undefined,
    }));

    if (sortBy === "distance" && userLocation) {
      withDist.sort(
        (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
      );
    } else if (sortBy === "rating") {
      withDist.sort(
        (a, b) => bayesianRating(b.terrace) - bayesianRating(a.terrace),
      );
    } else if (search) {
      withDist.sort((a, b) => a.score - b.score);
    }

    return withDist.map(({ terrace, distance }) => ({ terrace, distance }));
  }, [
    search,
    neighborhoods,
    terraceTypes,
    dogFriendly,
    covered,
    heated,
    openNow,
    sortBy,
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
    // Track the view here (once) rather than in TerraceDetail's mount effect:
    // the detail renders in both the desktop and mobile layout slots, and CSS
    // only hides one — both stay mounted, so an effect there fires twice.
    trackEvent(id, "view");
    setSelectedId(id);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("terrace");
    if (id) {
      openTerrace(id);
      window.history.replaceState({}, "", "/");
    }
  }, [openTerrace]);

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
    heated,
    onHeatedChange: setHeated,
    openNow,
    onOpenNowChange: setOpenNow,
    sortBy,
    onSortChange: handleSortChange,
    locating,
    resultCount: filteredWithDistance.length,
    mobileView,
  };

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* ══ Desktop Header ══ */}
      <header className="hidden md:flex relative shrink-0 items-center gap-4 px-6 h-16 bg-background border-b border-border z-[1100]">
        {/* Logo */}
        <Link
          href={lang === "fr" ? "/fr" : "/"}
          className="flex items-start gap-2.5 shrink-0 group"
        >
          <div className="mt-[3px]">
            <Logo className="w-7 h-7 shrink-0" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-lg font-bold tracking-tight leading-none group-hover:text-accent transition-colors">
              Terrasse Season
            </h1>
            <p className="text-[10px] text-muted tracking-wide mt-0.5">
              {lang === "fr"
                ? "Le guide des terrasses de Montréal"
                : "Montreal's terrace guide"}
            </p>
          </div>
        </Link>

        {/* Season open CTA */}
        <Link
          href="/open"
          className="ml-6 shrink-0 text-xs px-4 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition-colors font-medium whitespace-nowrap shadow-sm"
        >
          {lang === "fr"
            ? "Terrasses ouvertes cette saison"
            : "What's open this season?"}
        </Link>

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
                    ? nbhdLabel(neighborhoods[0], lang)
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
                      <span className="text-sm text-foreground">
                        {nbhdLabel(n, lang)}
                      </span>
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
          <a
            href="https://www.mtlblog.com/montreal-restaurants-terrasses-map"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-muted hover:text-foreground transition-colors whitespace-nowrap"
          >
            <span className="hidden lg:inline">
              {lang === "fr" ? "Vu sur" : "As seen in"}
            </span>
            <Image
              src="/mtlbloglogo.png"
              alt="MTL Blog"
              width={500}
              height={378}
              className="h-5 w-auto"
            />
          </a>
          <div className="w-px h-4 bg-border shrink-0" />
          <Link
            href="/submit"
            className="text-xs px-4 py-1.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors font-medium whitespace-nowrap"
          >
            {lang === "fr" ? "Soumettre une terrasse" : "Submit a terrace"}
          </Link>
          <Link
            href={otherLangHref}
            hrefLang={lang === "en" ? "fr" : "en"}
            className="text-[11px] text-muted hover:text-foreground hover:underline transition-colors font-semibold tracking-wide cursor-pointer"
          >
            {lang === "en" ? "FR" : "EN"}
          </Link>
          <NavMenu
            lang={lang}
            size="sm"
            renderTop={(close) => (
              <>
                <button
                  onClick={() => {
                    close();
                    setFavOpen(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-xs text-foreground hover:bg-foreground/[0.04] transition-colors cursor-pointer"
                >
                  {favCount > 0 ? t.myListCount(favCount) : t.myList}
                </button>
                <div className="my-1 border-t border-border" />
                <a
                  href="https://instagram.com/terrasseseason"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="block px-4 py-2 text-xs text-accent font-medium hover:bg-foreground/[0.04] transition-colors"
                >
                  @terrasseseason
                </a>
              </>
            )}
          />
        </div>
      </header>

      {/* ══ Desktop Filter Bar ══ */}
      <div className="hidden md:flex shrink-0 border-b border-border bg-background items-center justify-center gap-1.5 py-2.5 px-6">
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
        <button
          onClick={() => setDogFriendly(!dogFriendly)}
          className={`inline-flex items-center gap-1.5 shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            dogFriendly
              ? "bg-accent text-white shadow-sm shadow-accent/30"
              : "bg-[#ede8e0] text-muted hover:bg-[#e4ddd4] hover:text-foreground"
          }`}
        >
          <PawPrint className="w-3.5 h-3.5" strokeWidth={2} />
          {t.dogFriendly}
        </button>
        <button
          onClick={() => setCovered(!covered)}
          className={`inline-flex items-center gap-1.5 shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            covered
              ? "bg-accent text-white shadow-sm shadow-accent/30"
              : "bg-[#ede8e0] text-muted hover:bg-[#e4ddd4] hover:text-foreground"
          }`}
        >
          <Umbrella className="w-3.5 h-3.5" strokeWidth={2} />
          {t.covered}
        </button>
        <button
          onClick={() => setHeated(!heated)}
          className={`inline-flex items-center gap-1.5 shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            heated
              ? "bg-accent text-white shadow-sm shadow-accent/30"
              : "bg-[#ede8e0] text-muted hover:bg-[#e4ddd4] hover:text-foreground"
          }`}
        >
          <Flame className="w-3.5 h-3.5" strokeWidth={2} />
          {t.heated}
        </button>
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
            <div className="flex items-center justify-between mb-3 px-0.5">
              <p className="text-[11px] text-muted">
                {t.spots(filteredWithDistance.length)}
              </p>
              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setSortMenuOpen(!sortMenuOpen)}
                  disabled={locating}
                  className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
                >
                  <span>{t.sortBy}:</span>
                  <span className="font-medium text-foreground">
                    {locating && sortBy === "distance"
                      ? t.locating
                      : sortBy === "rating"
                        ? t.sortRating
                        : sortBy === "distance"
                          ? t.sortDistance
                          : t.sortRecommended}
                  </span>
                  <svg
                    className={`w-3 h-3 shrink-0 transition-transform duration-150 ${sortMenuOpen ? "rotate-180" : ""}`}
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
                {sortMenuOpen && (
                  <div className="absolute z-50 top-full mt-1 right-0 min-w-[160px] bg-white border border-border rounded-xl shadow-lg py-1 overflow-hidden">
                    {(
                      [
                        { value: "recommended", label: t.sortRecommended },
                        { value: "rating", label: t.sortRating },
                        { value: "distance", label: t.sortDistance },
                      ] as { value: SortBy; label: string }[]
                    ).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleSortChange(value)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-foreground/[0.04] transition-colors cursor-pointer ${
                          sortBy === value
                            ? "text-accent font-medium"
                            : "text-foreground"
                        }`}
                      >
                        <span>{label}</span>
                        {sortBy === value && (
                          <svg
                            className="w-3 h-3 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {locating && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2 text-[11px] text-accent">
                <svg
                  className="w-3.5 h-3.5 shrink-0 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{t.locatingMessage}</span>
              </div>
            )}
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

          {/* Editorial intro — below the fold, for search crawlers */}
          <div className="px-5 py-6 border-t border-border/60 bg-foreground/[0.015] space-y-3">
            {lang === "fr" ? (
              <>
                <p className="text-[11px] text-muted leading-relaxed">
                  Terrasse Season recense {terraces.length} terrasses et patios
                  à Montréal pour la saison 2026, le répertoire le plus complet
                  de la ville. Rooftops dans le Vieux-Montréal, jardins au bord
                  du canal Lachine à Saint-Henri, cours intérieures dans le
                  Plateau-Mont-Royal, terrasses de trottoir à Verdun et dans
                  Mile End, et terrasses couvertes et chauffées pour les soirs
                  frais de mai et septembre.
                </p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Quelques incontournables : Terrasse William Gray et Terrasse
                  Nelligan dans le Vieux-Montréal, Réservoir et Café Santropol
                  dans le Plateau, Terrasse Saint-Ambroise et Messorem
                  Bracitorium au bord du canal à Saint-Henri, Taverne Atlantic à
                  Mile-Ex, et Rose Orange au 44e étage de la Place Ville Marie.
                  Recherchez par type (rooftop, cour intérieure, jardin,
                  trottoir), par caractéristique (dog-friendly, couvert,
                  chauffé) ou par quartier.
                </p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Les horaires sont tirés de Google Places et mis à jour à
                  chaque saison, croisés avec Cult MTL, Tastet, Time Out
                  Montréal, Tourisme Montréal, Daily Hive, Narcity et
                  d&apos;autres publications locales. Les mentions dog-friendly
                  et terrasse couverte ne figurent que lorsqu&apos;une source
                  les confirme.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-muted leading-relaxed">
                  Terrasse Season is Montréal&apos;s most complete terrace and
                  patio directory, with over {terraces.length} outdoor spots
                  across 24 neighbourhoods for the 2026 season. Hotel rooftops
                  in Old Montréal, canal-side gardens along the Lachine Canal in
                  Saint-Henri, hidden courtyards in Plateau-Mont-Royal, sidewalk
                  tables in Verdun and Mile End, and covered heated terraces for
                  the cool evenings of May and September.
                </p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Among the most recognized spots: Terrasse William Gray and
                  Terrasse Nelligan in Old Montréal, Réservoir and Café
                  Santropol in the Plateau, Terrasse Saint-Ambroise and Messorem
                  Bracitorium on the canal in Saint-Henri, Taverne Atlantic in
                  Mile-Ex, and Rose Orange on the 44th floor of Place Ville
                  Marie. Filter by type (rooftop, courtyard, garden, sidewalk),
                  features (dog-friendly, covered, heated), and neighbourhood.
                </p>
                <p className="text-[11px] text-muted leading-relaxed">
                  Hours come from Google Places and are refreshed each season,
                  cross-referenced from Cult MTL, Tastet, Time Out Montréal,
                  Tourisme Montréal, Daily Hive, Narcity, and other local
                  publications. Dog-friendly and covered are only marked when a
                  source confirms them.
                </p>
              </>
            )}
          </div>

          {/* Footer links — bottom of card grid */}
          <div className="border-t border-border px-5 py-3 flex items-center gap-4">
            <Link
              href={localizePath("/blog")}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              {lang === "fr" ? "Le blogue" : "Blog"}
            </Link>
            <Link
              href={localizePath("/about")}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              {lang === "fr" ? "À propos" : "About"}
            </Link>
            <Link
              href={localizePath("/faq")}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              href={localizePath("/terms")}
              className="text-xs text-muted hover:text-foreground transition-colors ml-auto"
            >
              {lang === "fr" ? "Conditions" : "Terms"}
            </Link>
          </div>

          {/* Press credit */}
          <div className="border-t border-border px-5 py-2.5">
            <a
              href="https://www.mtlblog.com/montreal-restaurants-terrasses-map"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted hover:text-accent transition-colors"
            >
              {lang === "fr" ? "Vu sur MTL Blog ↗" : "Featured in MTL Blog ↗"}
            </a>
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
            <Link
              href={lang === "fr" ? "/fr" : "/"}
              className="flex items-center gap-2"
            >
              <Logo className="w-6 h-6 shrink-0" />
              <div className="text-center">
                <h1 className="font-display text-base font-bold tracking-tight leading-none">
                  Terrasse Season
                </h1>
                <p className="text-[9px] text-muted tracking-wide mt-0.5">
                  {lang === "fr"
                    ? "Les terrasses de Montréal"
                    : "Montreal's terrace guide"}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/submit"
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted"
              >
                {t.submit}
              </Link>
              <Link
                href={otherLangHref}
                hrefLang={lang === "en" ? "fr" : "en"}
                className="text-[11px] px-1.5 py-1 text-muted hover:text-foreground hover:underline transition-colors font-semibold tracking-wide cursor-pointer"
              >
                {lang === "en" ? "FR" : "EN"}
              </Link>
              <NavMenu
                lang={lang}
                size="md"
                renderTop={(close) => (
                  <>
                    <button
                      onClick={() => {
                        close();
                        setFavOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-xs text-foreground hover:bg-foreground/[0.04] transition-colors cursor-pointer"
                    >
                      {favCount > 0 ? t.myListCount(favCount) : t.myList}
                    </button>
                    <div className="my-1 border-t border-border" />
                    <a
                      href="https://instagram.com/terrasseseason"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={close}
                      className="block px-4 py-2 text-xs text-accent font-medium hover:bg-foreground/[0.04] transition-colors"
                    >
                      @terrasseseason
                    </a>
                  </>
                )}
              />
            </div>
          </div>
          {!selectedTerrace && (
            <Link
              href="/open"
              className="-mx-4 flex items-center justify-center gap-1.5 py-1.5 mt-2 mb-2 bg-green-700/[0.07] border-y border-green-700/12 text-[11px] font-medium text-green-800"
            >
              {lang === "fr"
                ? "Terrasses ouvertes cette saison"
                : "What's open this season?"}
              <svg
                className="w-3 h-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
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
                {locating && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2 text-[11px] text-accent">
                    <svg
                      className="w-3.5 h-3.5 shrink-0 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{t.locatingMessage}</span>
                  </div>
                )}
                {filteredWithDistance.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">&#9789;</p>
                    <p className="text-sm text-muted">{t.noResults}</p>
                  </div>
                ) : (
                  <>
                    {visibleCards.map(({ terrace, distance }, i) => (
                      <TerraceCard
                        key={terrace.id}
                        terrace={terrace}
                        selected={selectedId === terrace.id}
                        onClick={() => openFromCard(terrace.id)}
                        distance={distance}
                        priority={i === 0}
                      />
                    ))}
                    <div className="px-1 pt-2 pb-4 space-y-3">
                      {lang === "fr" ? (
                        <>
                          <p className="text-[10px] text-muted leading-relaxed">
                            Terrasse Season recense {terraces.length} terrasses
                            et patios à Montréal pour la saison 2026, le
                            répertoire le plus complet de la ville. Rooftops
                            dans le Vieux-Montréal, jardins au bord du canal
                            Lachine à Saint-Henri, cours intérieures dans le
                            Plateau-Mont-Royal, terrasses de trottoir à Verdun
                            et dans Mile End, et terrasses couvertes et
                            chauffées pour les soirs frais de mai et septembre.
                          </p>
                          <p className="text-[10px] text-muted leading-relaxed">
                            Quelques incontournables : Terrasse William Gray et
                            Terrasse Nelligan dans le Vieux-Montréal, Réservoir
                            et Café Santropol dans le Plateau, Terrasse
                            Saint-Ambroise et Messorem Bracitorium au bord du
                            canal à Saint-Henri, Taverne Atlantic à Mile-Ex, et
                            Rose Orange au 44e étage de la Place Ville Marie.
                            Recherchez par type (rooftop, cour intérieure,
                            jardin, trottoir), par caractéristique
                            (dog-friendly, couvert, chauffé) ou par quartier.
                          </p>
                          <p className="text-[10px] text-muted leading-relaxed">
                            Les horaires sont tirés de Google Places et mis à
                            jour à chaque saison, croisés avec Cult MTL, Tastet,
                            Time Out Montréal, Tourisme Montréal, Daily Hive,
                            Narcity et d&apos;autres publications locales. Les
                            mentions dog-friendly et terrasse couverte ne
                            figurent que lorsqu&apos;une source les confirme.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] text-muted leading-relaxed">
                            Terrasse Season is Montréal&apos;s most complete
                            terrace and patio directory, with over{" "}
                            {terraces.length} outdoor spots across 24
                            neighbourhoods for the 2026 season. Hotel rooftops
                            in Old Montréal, canal-side gardens along the
                            Lachine Canal in Saint-Henri, hidden courtyards in
                            Plateau-Mont-Royal, sidewalk tables in Verdun and
                            Mile End, and covered heated terraces for the cool
                            evenings of May and September.
                          </p>
                          <p className="text-[10px] text-muted leading-relaxed">
                            Among the most recognized spots: Terrasse William
                            Gray and Terrasse Nelligan in Old Montréal,
                            Réservoir and Café Santropol in the Plateau,
                            Terrasse Saint-Ambroise and Messorem Bracitorium on
                            the canal in Saint-Henri, Taverne Atlantic in
                            Mile-Ex, and Rose Orange on the 44th floor of Place
                            Ville Marie. Filter by type (rooftop, courtyard,
                            garden, sidewalk), features (dog-friendly, covered,
                            heated), and neighbourhood.
                          </p>
                          <p className="text-[10px] text-muted leading-relaxed">
                            Hours come from Google Places and are refreshed each
                            season, cross-referenced from Cult MTL, Tastet, Time
                            Out Montréal, Tourisme Montréal, Daily Hive,
                            Narcity, and other local publications. Dog-friendly
                            and covered are only marked when a source confirms
                            them.
                          </p>
                        </>
                      )}
                      <a
                        href="https://www.mtlblog.com/montreal-restaurants-terrasses-map"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-[10px] text-muted hover:text-accent transition-colors"
                      >
                        {lang === "fr"
                          ? "Vu sur MTL Blog ↗"
                          : "Featured in MTL Blog ↗"}
                      </a>
                    </div>
                  </>
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

      <FavoritesTray
        open={favOpen}
        onOpenChange={setFavOpen}
        hidden={!!selectedId}
        onSelect={openTerrace}
      />
    </main>
  );
}
