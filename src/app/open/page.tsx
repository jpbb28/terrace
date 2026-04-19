"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { terraces } from "@/data/terraces";
import { useLang } from "@/lib/LanguageContext";
import { isOpenNow } from "@/lib/utils";
import { Terrace } from "@/lib/types";

interface SeasonData {
  official: Record<
    string,
    { opening_date: string; closing_date: string | null; updated_at: string }
  >;
  today: string;
}

type SortKey = "opens_soonest" | "az" | "near_me";
type StatusKey = "open" | "soon" | "closed";

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

const STATUS_ORDER: Record<StatusKey, number> = {
  open: 0,
  soon: 1,
  closed: 2,
};

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

function getStatus(terraceId: string, data: SeasonData): StatusKey {
  const { opening_date, closing_date } = data.official[terraceId];
  const today = data.today;
  if (opening_date > today) return "soon";
  if (closing_date && closing_date < today) return "closed";
  return "open";
}

function formatDate(dateStr: string, lang: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    lang === "fr" ? "fr-CA" : "en-CA",
    { month: "short", day: "numeric" },
  );
}

export default function OpenPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [data, setData] = useState<SeasonData | null>(null);

  // Sort & filters
  const [sort, setSort] = useState<SortKey>("opens_soonest");
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    [],
  );
  const [dogFriendly, setDogFriendly] = useState(false);
  const [covered, setCovered] = useState(false);
  const [openForSeason, setOpenForSeason] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);

  // Submission form
  const [formSearch, setFormSearch] = useState("");
  const [formDropdownOpen, setFormDropdownOpen] = useState(false);
  const [formTerrace, setFormTerrace] = useState<Terrace | null>(null);
  const [dateMode, setDateMode] = useState<"today" | "date">("today");
  const [customDate, setCustomDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Undo — persisted across sessions in localStorage
  // undoable: terraceId → terraceName (controls button visibility)
  // undoTokens: terraceId → undo_token (required by DELETE API)
  const [undoable, setUndoable] = useState<Map<string, string>>(new Map());
  const [undoTokens, setUndoTokens] = useState<Map<string, string>>(new Map());
  const [undoing, setUndoing] = useState<Set<string>>(new Set());
  const [undoFailed, setUndoFailed] = useState<Set<string>>(new Set());

  const neighborhoodRef = useRef<HTMLDivElement>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore previous submissions for undo
    // localStorage format: { [terraceId]: token }
    try {
      const raw = localStorage.getItem("submitted_dates");
      const saved = JSON.parse(raw ?? "{}");
      // Discard old array format (no tokens, can't undo securely)
      if (Array.isArray(saved)) {
        localStorage.removeItem("submitted_dates");
      } else if (saved && typeof saved === "object") {
        const names = new Map<string, string>();
        const tokens = new Map<string, string>();
        for (const [id, token] of Object.entries(saved)) {
          const match = terraces.find((x) => x.id === id);
          if (match && typeof token === "string") {
            names.set(id, match.name);
            tokens.set(id, token);
          }
        }
        setUndoable(names);
        setUndoTokens(tokens);
      }
    } catch {}

    // Pre-fill form if ?report=<id>
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get("report");
    if (reportId) {
      const match = terraces.find((x) => x.id === reportId);
      if (match) {
        setFormTerrace(match);
        setTimeout(
          () => formSectionRef.current?.scrollIntoView({ behavior: "smooth" }),
          400,
        );
      }
      window.history.replaceState({}, "", "/open");
    }

    fetch("/api/open-reports")
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        neighborhoodRef.current &&
        !neighborhoodRef.current.contains(e.target as Node)
      ) {
        setNeighborhoodOpen(false);
      }
      if (
        filtersDropdownRef.current &&
        !filtersDropdownRef.current.contains(e.target as Node)
      ) {
        setFiltersDropdownOpen(false);
      }
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNearMe = useCallback(() => {
    if (sort === "near_me") {
      setSort("opens_soonest");
      return;
    }
    if (userLocation) {
      setSort("near_me");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSort("near_me");
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false },
    );
  }, [sort, userLocation]);

  const formResults = useMemo(() => {
    if (formSearch.trim().length < 2) return [];
    const q = formSearch.toLowerCase();
    return terraces.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [formSearch]);

  async function handleSubmit() {
    if (!formTerrace || submitting) return;
    const openingDate =
      dateMode === "today"
        ? (data?.today ?? new Date().toISOString().split("T")[0])
        : customDate;
    if (dateMode === "date" && !customDate) return;

    setSubmitting(true);
    const res = await fetch("/api/season-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terraceId: formTerrace.id, openingDate }),
    });

    if (res.ok) {
      const { token } = await res.json();
      const tid = formTerrace.id;
      const tname = formTerrace.name;

      setData((prev) =>
        prev
          ? {
              ...prev,
              official: {
                ...prev.official,
                [tid]: {
                  opening_date: openingDate,
                  closing_date: null,
                  updated_at: new Date().toISOString(),
                },
              },
            }
          : prev,
      );

      setUndoable((prev) => new Map(prev).set(tid, tname));
      if (token) {
        setUndoTokens((prev) => new Map(prev).set(tid, token));
        try {
          const saved = JSON.parse(
            localStorage.getItem("submitted_dates") ?? "{}",
          );
          const next = Array.isArray(saved) ? {} : saved;
          next[tid] = token;
          localStorage.setItem("submitted_dates", JSON.stringify(next));
        } catch {}
      }

      setFormTerrace(null);
      setFormSearch("");
      setDateMode("today");
      setCustomDate("");
    }

    setSubmitting(false);
  }

  async function handleUndo(terraceId: string) {
    if (undoing.has(terraceId)) return;
    setUndoing((s) => new Set(s).add(terraceId));
    setUndoFailed((s) => {
      const n = new Set(s);
      n.delete(terraceId);
      return n;
    });

    const token = undoTokens.get(terraceId);
    if (!token) {
      setUndoFailed((s) => new Set(s).add(terraceId));
      setUndoing((s) => {
        const n = new Set(s);
        n.delete(terraceId);
        return n;
      });
      return;
    }

    const res = await fetch(
      `/api/season-dates?terraceId=${encodeURIComponent(terraceId)}&token=${encodeURIComponent(token)}`,
      { method: "DELETE" },
    );

    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev.official };
        delete next[terraceId];
        return { ...prev, official: next };
      });
      setUndoable((prev) => {
        const next = new Map(prev);
        next.delete(terraceId);
        return next;
      });
      setUndoTokens((prev) => {
        const next = new Map(prev);
        next.delete(terraceId);
        return next;
      });
      try {
        const saved = JSON.parse(
          localStorage.getItem("submitted_dates") ?? "{}",
        );
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
          delete saved[terraceId];
          localStorage.setItem("submitted_dates", JSON.stringify(saved));
        }
      } catch {}
    } else {
      setUndoFailed((s) => new Set(s).add(terraceId));
    }

    setUndoing((s) => {
      const next = new Set(s);
      next.delete(terraceId);
      return next;
    });
  }

  const sortedList = useMemo(() => {
    if (!data) return [];

    let list = terraces.filter((t) => data.official[t.id]);

    if (selectedNeighborhoods.length > 0) {
      list = list.filter((t) => selectedNeighborhoods.includes(t.neighborhood));
    }
    if (openForSeason) list = list.filter((t) => isOpenNow(t) === true);
    if (dogFriendly) list = list.filter((t) => t.dogFriendly);
    if (covered) list = list.filter((t) => t.covered);

    if (sort === "opens_soonest") {
      list.sort((a, b) => {
        const sa = STATUS_ORDER[getStatus(a.id, data)];
        const sb = STATUS_ORDER[getStatus(b.id, data)];
        return sa !== sb ? sa - sb : a.name.localeCompare(b.name);
      });
    } else if (sort === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "near_me" && userLocation) {
      list.sort((a, b) => {
        const da = haversineKm(
          userLocation.lat,
          userLocation.lng,
          a.lat,
          a.lng,
        );
        const db = haversineKm(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng,
        );
        return da - db;
      });
    }

    return list;
  }, [
    data,
    selectedNeighborhoods,
    openForSeason,
    dogFriendly,
    covered,
    sort,
    userLocation,
  ]);

  const activeFilterCount =
    selectedNeighborhoods.length +
    (openForSeason ? 1 : 0) +
    (dogFriendly ? 1 : 0) +
    (covered ? 1 : 0);

  const today = data?.today ?? "";

  const LogoIcon = () => (
    <svg
      className="w-5 h-5 shrink-0"
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          {lang === "fr" ? "← Accueil" : "← Back home"}
        </Link>
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span className="font-display font-bold text-lg tracking-tight">
            Terrasse Season
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-3">
            {t.openPageTitle}
          </h1>
          <p className="text-muted text-sm max-w-lg">{t.openPageSubtitle}</p>
        </div>

        {/* Sort + filters */}
        <div className="space-y-3 mb-6">
          {/* Sort row */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs self-start w-fit">
            {(
              [
                [
                  "opens_soonest",
                  lang === "fr" ? "Ouvre en premier" : "Opens soonest",
                ],
                ["az", "A–Z"],
                [
                  "near_me",
                  locating
                    ? lang === "fr"
                      ? "Localisation…"
                      : "Locating…"
                    : lang === "fr"
                      ? "Près de moi"
                      : "Near me",
                ],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={key === "near_me" ? handleNearMe : () => setSort(key)}
                className={`px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${sort === key ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Neighborhood dropdown */}
            <div className="relative" ref={neighborhoodRef}>
              <button
                onClick={() => setNeighborhoodOpen((v) => !v)}
                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedNeighborhoods.length > 0
                    ? "bg-foreground text-white border-foreground"
                    : "border-border text-muted hover:border-border-strong hover:text-foreground"
                }`}
              >
                {selectedNeighborhoods.length === 0
                  ? lang === "fr"
                    ? "Tous les quartiers"
                    : "All neighborhoods"
                  : selectedNeighborhoods.length === 1
                    ? selectedNeighborhoods[0]
                    : `${selectedNeighborhoods.length} ${lang === "fr" ? "quartiers" : "neighborhoods"}`}
                <svg
                  className={`w-3 h-3 shrink-0 transition-transform ${neighborhoodOpen ? "rotate-180" : ""}`}
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
                <div className="absolute top-full mt-1.5 left-0 bg-white rounded-xl border border-border shadow-lg py-1.5 min-w-[200px] max-h-60 overflow-y-auto z-30">
                  {selectedNeighborhoods.length > 0 && (
                    <div className="px-3 py-1.5 border-b border-border">
                      <button
                        onClick={() => setSelectedNeighborhoods([])}
                        className="text-[11px] text-accent hover:underline cursor-pointer"
                      >
                        {lang === "fr" ? "Tout effacer" : "Clear all"}
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
                        checked={selectedNeighborhoods.includes(n)}
                        onChange={() =>
                          setSelectedNeighborhoods((prev) =>
                            prev.includes(n)
                              ? prev.filter((x) => x !== n)
                              : [...prev, n],
                          )
                        }
                        className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                      />
                      <span className="text-sm text-foreground">{n}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Filters dropdown: Open now · Dog-friendly · Covered */}
            <div className="relative" ref={filtersDropdownRef}>
              {(() => {
                const count =
                  (openForSeason ? 1 : 0) +
                  (dogFriendly ? 1 : 0) +
                  (covered ? 1 : 0);
                return (
                  <button
                    onClick={() => setFiltersDropdownOpen((v) => !v)}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
                      count > 0
                        ? "bg-foreground text-white border-foreground"
                        : "border-border text-muted hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    {lang === "fr" ? "Filtres" : "Filters"}
                    {count > 0 && ` (${count})`}
                    <svg
                      className={`w-3 h-3 shrink-0 transition-transform ${filtersDropdownOpen ? "rotate-180" : ""}`}
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
                );
              })()}
              {filtersDropdownOpen && (
                <div className="absolute top-full mt-1.5 left-0 bg-white rounded-xl border border-border shadow-lg py-1.5 min-w-[190px] z-30">
                  {[
                    {
                      label: lang === "fr" ? "Ouvert maintenant" : "Open now",
                      checked: openForSeason,
                      toggle: () => setOpenForSeason((v) => !v),
                    },
                    {
                      label: t.dogFriendly,
                      checked: dogFriendly,
                      toggle: () => setDogFriendly((v) => !v),
                    },
                    {
                      label: t.covered,
                      checked: covered,
                      toggle: () => setCovered((v) => !v),
                    },
                  ].map(({ label, checked, toggle }) => (
                    <label
                      key={label}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={toggle}
                        className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSelectedNeighborhoods([]);
                  setOpenForSeason(false);
                  setDogFriendly(false);
                  setCovered(false);
                }}
                className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                {lang === "fr" ? "Effacer les filtres" : "Clear filters"}
              </button>
            )}
          </div>
        </div>

        {/* Lists */}
        {(() => {
          const typeLabels: Record<string, string> = {
            sidewalk: t.sidewalk,
            rooftop: t.rooftop,
            backyard: t.backyard,
            courtyard: t.courtyard,
            balcony: t.balcony,
            garden: t.garden,
          };

          const renderCard = (terrace: (typeof sortedList)[0]) => {
            const status = getStatus(terrace.id, data!);
            const official = data!.official[terrace.id];
            const canUndo = undoable.has(terrace.id);
            const isUndoing = undoing.has(terrace.id);
            const undoError = undoFailed.has(terrace.id);
            const openNow = isOpenNow(terrace) === true;
            const types = terrace.terraceType ?? [];

            return (
              <div
                key={terrace.id}
                onClick={() => router.push(`/?terrace=${terrace.id}`)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer hover:opacity-80 ${
                  status === "open"
                    ? "border-green-500/25 bg-green-500/[0.03]"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-snug mb-1.5">
                    {terrace.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {openNow && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500 text-white">
                        {lang === "fr" ? "Ouvert" : "Open now"}
                      </span>
                    )}
                    {types.map((tt) => (
                      <span
                        key={tt}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/[0.06] text-muted"
                      >
                        {typeLabels[tt] ?? tt}
                      </span>
                    ))}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {terrace.neighborhood}
                    </span>
                    {official && official.opening_date > today && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
                        {lang === "fr" ? "Ouvre le" : "Opens"}{" "}
                        {formatDate(official.opening_date, lang)}
                      </span>
                    )}
                  </div>
                </div>
                {canUndo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUndo(terrace.id);
                    }}
                    disabled={isUndoing}
                    className={`shrink-0 text-xs transition-colors cursor-pointer disabled:opacity-50 mt-0.5 ${undoError ? "text-red-500" : "text-muted hover:text-red-500"}`}
                  >
                    {isUndoing
                      ? "…"
                      : undoError
                        ? lang === "fr"
                          ? "Échec"
                          : "Failed"
                        : lang === "fr"
                          ? "Annuler"
                          : "Undo"}
                  </button>
                )}
              </div>
            );
          };

          if (!data) {
            return (
              <div className="space-y-3 mb-12">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-card animate-pulse"
                  />
                ))}
              </div>
            );
          }

          const alreadyOpen = sortedList.filter((t) => {
            const s = getStatus(t.id, data);
            return s === "open";
          });
          const openingSoon = sortedList.filter(
            (t) => getStatus(t.id, data) === "soon",
          );

          if (alreadyOpen.length === 0 && openingSoon.length === 0) {
            return (
              <div className="py-10 text-center mb-12">
                <p className="text-3xl mb-2">☀️</p>
                <p className="text-sm text-muted">
                  {lang === "fr"
                    ? "Pas encore de terrasses signalées ouvertes. Soyez le premier!"
                    : "No terraces reported open yet. Be the first below!"}
                </p>
              </div>
            );
          }

          return (
            <div className="mb-12 space-y-8">
              {alreadyOpen.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    {lang === "fr" ? "Déjà ouvertes" : "Already open"} (
                    {alreadyOpen.length})
                  </h2>
                  <div className="space-y-2">{alreadyOpen.map(renderCard)}</div>
                </div>
              )}
              {openingSoon.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    {lang === "fr" ? "Ouverture prochaine" : "Opening soon"} (
                    {openingSoon.length})
                  </h2>
                  <div className="space-y-2">{openingSoon.map(renderCard)}</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Submit section */}
        <div ref={formSectionRef} className="pt-8 border-t-2 border-border">
          <h2 className="font-display text-lg font-bold mb-1">
            {lang === "fr" ? "Signalez une ouverture" : "Report an opening"}
          </h2>
          <p className="text-sm text-muted mb-6">
            {lang === "fr"
              ? "Propriétaire ou visiteur — signalez si une terrasse est déjà ouverte ou indiquez sa prochaine date d'ouverture."
              : "Owner or visitor — let us know if a place is already open or when it's opening."}
          </p>

          {/* Step 1: pick terrace */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-light uppercase tracking-wide block mb-1.5">
              {lang === "fr" ? "Quelle terrasse?" : "Which terrace?"}
            </label>
            <div ref={formRef} className="relative">
              {formTerrace ? (
                <div className="flex items-center justify-between bg-green-500/[0.06] border border-green-500/20 rounded-xl px-4 h-11">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      className="w-3.5 h-3.5 text-green-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm font-medium truncate">
                      {formTerrace.name}
                    </span>
                    <span className="text-xs text-muted shrink-0">
                      {formTerrace.neighborhood}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFormTerrace(null);
                      setFormSearch("");
                    }}
                    className="text-muted hover:text-foreground cursor-pointer text-xs shrink-0 ml-2"
                  >
                    {lang === "fr" ? "Changer" : "Change"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 h-11 focus-within:border-accent/50 transition-colors shadow-sm">
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
                      value={formSearch}
                      onChange={(e) => {
                        setFormSearch(e.target.value);
                        setFormDropdownOpen(true);
                      }}
                      onFocus={() =>
                        formSearch.trim().length >= 2 &&
                        setFormDropdownOpen(true)
                      }
                      placeholder={
                        lang === "fr"
                          ? "Chercher par nom..."
                          : "Search by name..."
                      }
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-light"
                      style={{ fontSize: "16px" }}
                    />
                    {formSearch && (
                      <button
                        onClick={() => {
                          setFormSearch("");
                          setFormDropdownOpen(false);
                        }}
                        className="text-muted hover:text-foreground cursor-pointer transition-colors"
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

                  {formDropdownOpen && formResults.length > 0 && (
                    <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl border border-border shadow-lg z-20 overflow-hidden">
                      {formResults.map((terrace) => {
                        const existing = data?.official[terrace.id];
                        return (
                          <button
                            key={terrace.id}
                            onClick={() => {
                              setFormTerrace(terrace);
                              setFormSearch("");
                              setFormDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/[0.04] transition-colors text-left cursor-pointer border-b border-border last:border-0"
                          >
                            <div>
                              <span className="text-sm font-medium block">
                                {terrace.name}
                              </span>
                              <span className="text-xs text-muted">
                                {terrace.neighborhood}
                              </span>
                            </div>
                            {existing && (
                              <span className="text-[10px] text-amber-600 shrink-0 ml-3 font-medium">
                                {lang === "fr"
                                  ? "Dates enregistrées"
                                  : "Has dates"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {formDropdownOpen &&
                    formSearch.trim().length >= 2 &&
                    formResults.length === 0 && (
                      <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl border border-border shadow-lg z-20 px-4 py-3">
                        <p className="text-sm text-muted">
                          {lang === "fr" ? "Aucun résultat" : "No results"}
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>

          {/* Step 2: date — shown after picking a terrace */}
          {formTerrace && (
            <>
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-light uppercase tracking-wide block mb-2">
                  {lang === "fr" ? "Date d'ouverture" : "Opening date"}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDateMode("today")}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                      dateMode === "today"
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {lang === "fr" ? "Ouverte maintenant" : "Open now"}
                  </button>
                  <button
                    onClick={() => setDateMode("date")}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                      dateMode === "date"
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {lang === "fr" ? "Choisir une date" : "Pick a date"}
                  </button>
                </div>

                {dateMode === "date" && (
                  <div className="mt-3">
                    <div className="relative inline-flex items-center">
                      <svg
                        className="absolute left-3 w-4 h-4 text-muted pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        min={today}
                        className="pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-foreground outline-none focus:border-accent/50 transition-colors cursor-pointer"
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                    {!customDate && (
                      <p className="text-xs text-muted mt-2">
                        {lang === "fr"
                          ? "Appuyez sur le champ pour ouvrir le calendrier"
                          : "Tap the field to open the calendar"}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || (dateMode === "date" && !customDate)}
                className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "…" : lang === "fr" ? "Soumettre" : "Submit"}
              </button>
            </>
          )}
        </div>

        {/* Not in list CTA */}
        <p className="text-sm text-muted mt-8 pb-10">
          {lang === "fr" ? (
            <>
              La terrasse n&apos;est pas dans la liste ?{" "}
              <Link href="/submit" className="text-accent hover:underline">
                Soumettez-la ici.
              </Link>
            </>
          ) : (
            <>
              Don&apos;t see a terrace in our list?{" "}
              <Link href="/submit" className="text-accent hover:underline">
                Submit it here.
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
