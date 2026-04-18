"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { terraces } from "@/data/terraces";
import { useLang } from "@/lib/LanguageContext";
import { Terrace } from "@/lib/types";

interface SeasonData {
  official: Record<
    string,
    { opening_date: string; closing_date: string | null; updated_at: string }
  >;
  crowdsource: Record<string, number>;
  today: string;
}

type SortKey = "opens_soonest" | "az" | "near_me";
type StatusKey = "open" | "soon" | "reported" | "closed";

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
  reported: 1,
  soon: 2,
  closed: 3,
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

// Only called for terraces that are in the filtered list (have some signal)
function getStatus(terraceId: string, data: SeasonData): StatusKey {
  const official = data.official[terraceId];
  if (official) {
    const { opening_date, closing_date } = official;
    const today = data.today;
    if (opening_date > today) return "soon";
    if (closing_date && closing_date < today) return "closed";
    return "open";
  }
  return "reported";
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
  const [undoable, setUndoable] = useState<Map<string, string>>(new Map());
  const [undoing, setUndoing] = useState<Set<string>>(new Set());

  const neighborhoodRef = useRef<HTMLDivElement>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore previous submissions for undo
    try {
      const saved = JSON.parse(
        localStorage.getItem("submitted_dates") ?? "[]",
      ) as string[];
      const map = new Map<string, string>();
      for (const id of saved) {
        const match = terraces.find((x) => x.id === id);
        if (match) map.set(id, match.name);
      }
      setUndoable(map);
    } catch {}

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
      try {
        const saved: string[] = JSON.parse(
          localStorage.getItem("submitted_dates") ?? "[]",
        );
        if (!saved.includes(tid)) {
          localStorage.setItem(
            "submitted_dates",
            JSON.stringify([...saved, tid]),
          );
        }
      } catch {}

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

    const res = await fetch(
      `/api/season-dates?terraceId=${encodeURIComponent(terraceId)}`,
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
      try {
        const remaining: string[] = (
          JSON.parse(
            localStorage.getItem("submitted_dates") ?? "[]",
          ) as string[]
        ).filter((id) => id !== terraceId);
        localStorage.setItem("submitted_dates", JSON.stringify(remaining));
      } catch {}
    }

    setUndoing((s) => {
      const next = new Set(s);
      next.delete(terraceId);
      return next;
    });
  }

  const sortedList = useMemo(() => {
    if (!data) return [];

    let list = terraces.filter(
      (t) => data.official[t.id] || (data.crowdsource[t.id] ?? 0) > 0,
    );

    if (selectedNeighborhoods.length > 0) {
      list = list.filter((t) => selectedNeighborhoods.includes(t.neighborhood));
    }
    if (openForSeason)
      list = list.filter((t) => getStatus(t.id, data) === "open");
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
          <span className="font-bold">Terrasse Season</span>
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
                      label:
                        lang === "fr"
                          ? "Ouvert pour la saison"
                          : "Open for the season",
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

        {/* List */}
        {!data ? (
          <div className="space-y-3 mb-12">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : sortedList.length === 0 ? (
          <div className="py-10 text-center mb-12">
            <p className="text-3xl mb-2">☀️</p>
            <p className="text-sm text-muted">
              {lang === "fr"
                ? "Pas encore de terrasses signalées ouvertes. Soyez le premier!"
                : "No terraces reported open yet. Be the first below!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-12">
            {sortedList.map((terrace) => {
              const status = getStatus(terrace.id, data);
              const official = data.official[terrace.id];
              const csCount = data.crowdsource[terrace.id] ?? 0;
              const canUndo = undoable.has(terrace.id);
              const isUndoing = undoing.has(terrace.id);

              return (
                <div
                  key={terrace.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    status === "open"
                      ? "border-green-500/25 bg-green-500/[0.03]"
                      : status === "reported"
                        ? "border-green-500/15 bg-green-500/[0.02]"
                        : "border-border bg-card"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {terrace.name}
                      </span>
                      {status === "open" && (
                        <span className="shrink-0 text-[10px] bg-green-500/15 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {t.openNowBadge}
                        </span>
                      )}
                      {status === "reported" && (
                        <span className="shrink-0 text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">
                          {lang === "fr" ? "Signalé ouvert" : "Reported open"}
                        </span>
                      )}
                      {status === "soon" && (
                        <span className="shrink-0 text-[10px] bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {t.openingSoonBadge(
                            formatDate(official.opening_date, lang),
                          )}
                        </span>
                      )}
                      {status === "closed" && (
                        <span className="shrink-0 text-[10px] bg-foreground/8 text-muted px-2 py-0.5 rounded-full font-medium">
                          {t.closedBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-accent font-medium">
                        {terrace.neighborhood}
                      </span>
                      {official && (
                        <span className="text-[11px] text-muted">
                          · {formatDate(official.opening_date, lang)}
                          {official.closing_date &&
                            ` – ${formatDate(official.closing_date, lang)}`}
                        </span>
                      )}
                      {!official && csCount > 0 && (
                        <span className="text-[11px] text-muted">
                          · {t.crowdsourceCount(csCount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {canUndo && (
                    <button
                      onClick={() => handleUndo(terrace.id)}
                      disabled={isUndoing}
                      className="shrink-0 text-xs text-muted hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUndoing ? "…" : lang === "fr" ? "Annuler" : "Undo"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Submit section */}
        <div className="pt-8 border-t-2 border-border">
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
      </div>
    </div>
  );
}
