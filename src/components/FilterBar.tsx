"use client";

import { useState, useRef, useEffect } from "react";
import { Neighborhood, TerraceType } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";

const neighborhoods: Neighborhood[] = [
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

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  selectedNeighborhoods: string[];
  onNeighborhoodsChange: (v: string[]) => void;
  selectedTypes: string[];
  onTypesChange: (v: string[]) => void;
  dogFriendly: boolean;
  onDogFriendlyChange: (v: boolean) => void;
  covered: boolean;
  onCoveredChange: (v: boolean) => void;
  openNow: boolean;
  onOpenNowChange: (v: boolean) => void;
  sortByDistance: boolean;
  onSortByDistanceChange: () => void;
  locating: boolean;
  resultCount: number;
  mobileView?: "map" | "list";
  onLocateOnMap?: () => void;
  mapLocating?: boolean;
}

export default function FilterBar({
  search,
  onSearchChange,
  selectedNeighborhoods,
  onNeighborhoodsChange,
  selectedTypes,
  onTypesChange,
  dogFriendly,
  onDogFriendlyChange,
  covered,
  onCoveredChange,
  openNow,
  onOpenNowChange,
  sortByDistance,
  onSortByDistanceChange,
  locating,
  resultCount,
  mobileView,
  onLocateOnMap,
  mapLocating,
}: FilterBarProps) {
  const { t } = useLang();
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Desktop neighborhood ref
  const neighborhoodRef = useRef<HTMLDivElement>(null);
  // Mobile neighborhood ref (same state, different DOM position)
  const neighborhoodMobileRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        neighborhoodRef.current &&
        !neighborhoodRef.current.contains(e.target as Node) &&
        neighborhoodMobileRef.current &&
        !neighborhoodMobileRef.current.contains(e.target as Node)
      ) {
        setNeighborhoodOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
      if (
        filtersRef.current &&
        !filtersRef.current.contains(e.target as Node)
      ) {
        setFiltersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNeighborhood = (n: string) => {
    onNeighborhoodsChange(
      selectedNeighborhoods.includes(n)
        ? selectedNeighborhoods.filter((x) => x !== n)
        : [...selectedNeighborhoods, n],
    );
  };

  const toggleType = (v: string) => {
    onTypesChange(
      selectedTypes.includes(v)
        ? selectedTypes.filter((x) => x !== v)
        : [...selectedTypes, v],
    );
  };

  const terraceTypes: { value: TerraceType; label: string }[] = [
    { value: "sidewalk", label: t.sidewalk },
    { value: "rooftop", label: t.rooftop },
    { value: "backyard", label: t.backyard },
    { value: "courtyard", label: t.courtyard },
    { value: "balcony", label: t.balcony },
    { value: "garden", label: t.garden },
  ];

  const neighborhoodLabel =
    selectedNeighborhoods.length === 0
      ? t.allNeighborhoods
      : selectedNeighborhoods.length === 1
        ? selectedNeighborhoods[0]
        : `${selectedNeighborhoods.length} ${t.neighborhoods}`;

  const typeLabel =
    selectedTypes.length === 0
      ? t.allTypes
      : selectedTypes.length === 1
        ? (terraceTypes.find((tt) => tt.value === selectedTypes[0])?.label ??
          selectedTypes[0])
        : `${selectedTypes.length} ${t.types}`;

  const activeFilterCount = [
    openNow,
    dogFriendly,
    covered,
    mobileView !== "map" && sortByDistance,
  ].filter(Boolean).length;

  const filtersLabel =
    activeFilterCount > 0 ? `${t.filters} (${activeFilterCount})` : t.filters;

  // Shared neighborhood dropdown content
  const neighborhoodDropdown = (
    <>
      {selectedNeighborhoods.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <button
            onClick={() => onNeighborhoodsChange([])}
            className="text-[11px] text-accent hover:underline cursor-pointer"
          >
            {t.clearAll}
          </button>
        </div>
      )}
      {neighborhoods.map((n) => (
        <label
          key={n}
          className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={selectedNeighborhoods.includes(n)}
            onChange={() => toggleNeighborhood(n)}
            className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
          />
          <span className="text-xs text-foreground">{n}</span>
        </label>
      ))}
    </>
  );

  const neighborhoodButton = (
    <button
      onClick={() => {
        setNeighborhoodOpen(!neighborhoodOpen);
        setTypeOpen(false);
        setFiltersOpen(false);
      }}
      className={`w-full flex items-center justify-between px-3 py-2 bg-white/60 border rounded-xl text-xs cursor-pointer transition-all ${
        selectedNeighborhoods.length > 0
          ? "border-accent text-foreground font-medium"
          : "border-border text-muted hover:border-border-strong"
      }`}
    >
      <span className="truncate">{neighborhoodLabel}</span>
      <svg
        className={`w-3 h-3 shrink-0 ml-1 transition-transform duration-150 ${neighborhoodOpen ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Row 1 — mobile list: unified search + neighborhood in one box */}
      {mobileView !== "map" && (
        <div className="md:hidden flex items-center bg-white/60 border border-border rounded-xl focus-within:border-accent focus-within:bg-white/80 focus-within:shadow-sm transition-all">
          <div className="relative flex-1 min-w-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
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
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-9 py-2.5 bg-transparent text-[16px] text-foreground placeholder:text-muted-light focus:outline-none transition-all ${search ? "pr-8" : "pr-3"}`}
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
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
          <div className="w-px self-stretch my-2 bg-border shrink-0" />
          <div className="relative shrink-0" ref={neighborhoodMobileRef}>
            <button
              onClick={() => {
                setNeighborhoodOpen(!neighborhoodOpen);
                setTypeOpen(false);
                setFiltersOpen(false);
              }}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs cursor-pointer transition-colors ${
                selectedNeighborhoods.length > 0
                  ? "text-foreground font-medium"
                  : "text-muted"
              }`}
            >
              <span className="truncate max-w-[80px]">{neighborhoodLabel}</span>
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
              <div className="absolute z-50 top-full mt-1 right-0 w-48 bg-white border border-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {neighborhoodDropdown}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 1 — desktop always + mobile map view: standalone search */}
      <div
        className={`relative ${mobileView !== "map" ? "hidden md:block" : ""}`}
      >
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
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
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-9 py-2.5 bg-white/60 border border-border rounded-xl text-[16px] md:text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:border-accent focus:bg-white/80 focus:shadow-sm transition-all ${search ? "pr-8" : "pr-3"}`}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
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

      {/* Row 2 */}
      <div className="flex items-center gap-2">
        {/* Neighborhood — desktop only (row 2) */}
        {mobileView !== "map" && (
          <div
            className="relative flex-1 hidden md:block"
            ref={neighborhoodRef}
          >
            {neighborhoodButton}
            {neighborhoodOpen && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {neighborhoodDropdown}
              </div>
            )}
          </div>
        )}

        {/* Type dropdown — mobile only */}
        <div className="relative flex-1 md:hidden" ref={typeRef}>
          <button
            onClick={() => {
              setTypeOpen(!typeOpen);
              setNeighborhoodOpen(false);
              setFiltersOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 bg-white/60 border rounded-xl text-xs cursor-pointer transition-all ${
              selectedTypes.length > 0
                ? "border-accent text-foreground font-medium"
                : "border-border text-muted hover:border-border-strong"
            }`}
          >
            <span className="truncate">{typeLabel}</span>
            <svg
              className={`w-3 h-3 shrink-0 ml-1 transition-transform duration-150 ${typeOpen ? "rotate-180" : ""}`}
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
          {typeOpen && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              {selectedTypes.length > 0 && (
                <div className="px-3 py-2 border-b border-border">
                  <button
                    onClick={() => onTypesChange([])}
                    className="text-[11px] text-accent hover:underline cursor-pointer"
                  >
                    {t.clearAll}
                  </button>
                </div>
              )}
              {terraceTypes.map((tt) => (
                <label
                  key={tt.value}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(tt.value)}
                    onChange={() => toggleType(tt.value)}
                    className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                  />
                  <span className="text-xs text-foreground">{tt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Filters dropdown — mobile only */}
        <div className="relative flex-1 md:hidden" ref={filtersRef}>
          <button
            onClick={() => {
              setFiltersOpen(!filtersOpen);
              setTypeOpen(false);
              setNeighborhoodOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 bg-white/60 border rounded-xl text-xs cursor-pointer transition-all ${
              activeFilterCount > 0
                ? "border-accent text-foreground font-medium"
                : "border-border text-muted hover:border-border-strong"
            }`}
          >
            <span className="truncate">{filtersLabel}</span>
            <svg
              className={`w-3 h-3 shrink-0 ml-1 transition-transform duration-150 ${filtersOpen ? "rotate-180" : ""}`}
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
          {filtersOpen && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              {activeFilterCount > 0 && (
                <div className="px-3 py-2 border-b border-border">
                  <button
                    onClick={() => {
                      if (openNow) onOpenNowChange(false);
                      if (dogFriendly) onDogFriendlyChange(false);
                      if (covered) onCoveredChange(false);
                      if (sortByDistance) onSortByDistanceChange();
                    }}
                    className="text-[11px] text-accent hover:underline cursor-pointer"
                  >
                    {t.clearAll}
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={openNow}
                  onChange={() => onOpenNowChange(!openNow)}
                  className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                />
                <span className="text-xs text-foreground">{t.openNow}</span>
              </label>
              <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={dogFriendly}
                  onChange={() => onDogFriendlyChange(!dogFriendly)}
                  className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                />
                <span className="text-xs text-foreground">{t.dogFriendly}</span>
              </label>
              <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={covered}
                  onChange={() => onCoveredChange(!covered)}
                  className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                />
                <span className="text-xs text-foreground">{t.covered}</span>
              </label>
              <label
                className={`flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors ${(mobileView === "map" ? (mapLocating ?? false) : locating) ? "opacity-50 cursor-default pointer-events-none" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={mobileView !== "map" && sortByDistance}
                  onChange={() => {
                    if (mobileView === "map") {
                      onLocateOnMap?.();
                    } else {
                      onSortByDistanceChange();
                    }
                  }}
                  className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0"
                />
                <span className="text-xs text-foreground">
                  {(mobileView === "map" ? (mapLocating ?? false) : locating)
                    ? t.locating
                    : t.nearMe}
                </span>
              </label>
            </div>
          )}
        </div>

        <span className="text-[11px] font-medium text-muted tabular-nums shrink-0">
          {t.spots(resultCount)}
        </span>
      </div>

      {/* Type toggle pills — desktop only */}
      <div className="hidden md:flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        {terraceTypes.map((tt) => (
          <button
            key={tt.value}
            onClick={() => toggleType(tt.value)}
            className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
              selectedTypes.includes(tt.value)
                ? "bg-accent text-white border-accent"
                : "border-border bg-white/40 text-muted hover:text-foreground hover:border-border-strong"
            }`}
          >
            {tt.label}
          </button>
        ))}
      </div>

      {/* Attribute filter pills — desktop only */}
      <div className="hidden md:flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        {[
          {
            label: locating ? t.locating : t.nearMe,
            active: sortByDistance,
            onClick: onSortByDistanceChange,
            disabled: locating,
          },
          {
            label: t.openNow,
            active: openNow,
            onClick: () => onOpenNowChange(!openNow),
            disabled: false,
          },
          {
            label: t.dogFriendly,
            active: dogFriendly,
            onClick: () => onDogFriendlyChange(!dogFriendly),
            disabled: false,
          },
          {
            label: t.covered,
            active: covered,
            onClick: () => onCoveredChange(!covered),
            disabled: false,
          },
        ].map(({ label, active, onClick, disabled }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
              active
                ? "active"
                : "border-border bg-white/40 text-muted hover:text-foreground hover:border-border-strong"
            } disabled:opacity-50 disabled:cursor-default`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
