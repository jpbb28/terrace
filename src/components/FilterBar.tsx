"use client";

import { useState, useRef, useEffect } from "react";
import { Neighborhood, TerraceType } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";

const neighborhoods: Neighborhood[] = [
  "Ahuntsic", "Chinatown", "Downtown", "Griffintown", "Hochelaga",
  "Latin Quarter", "Laval", "Little Burgundy", "Little Italy", "Mile End",
  "Mile-Ex", "NDG", "Old Montreal", "Old Port", "Outremont", "Parc-Extension",
  "Petite-Patrie", "Plateau-Mont-Royal", "Pointe-Saint-Charles",
  "Quartier des Spectacles", "Rosemont", "Saint-Henri", "South Shore",
  "The Village", "Verdun", "Villeray", "West Island",
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
}

export default function FilterBar({
  search, onSearchChange,
  selectedNeighborhoods, onNeighborhoodsChange,
  selectedTypes, onTypesChange,
  dogFriendly, onDogFriendlyChange,
  covered, onCoveredChange,
  openNow, onOpenNowChange,
  sortByDistance, onSortByDistanceChange,
  locating,
  resultCount,
}: FilterBarProps) {
  const { t } = useLang();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const neighborhoodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(e.target as Node)) {
        setNeighborhoodOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNeighborhood = (n: string) => {
    onNeighborhoodsChange(
      selectedNeighborhoods.includes(n)
        ? selectedNeighborhoods.filter((x) => x !== n)
        : [...selectedNeighborhoods, n]
    );
  };

  const toggleType = (v: string) => {
    onTypesChange(
      selectedTypes.includes(v)
        ? selectedTypes.filter((x) => x !== v)
        : [...selectedTypes, v]
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
      : selectedNeighborhoods.join(", ");

  const activeFilterCount = [dogFriendly, covered, openNow, sortByDistance].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
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
          className="w-full pl-9 pr-3 py-2.5 bg-white/60 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:border-accent focus:bg-white/80 focus:shadow-sm transition-all"
        />
      </div>

      {/* Neighborhood multi-select */}
      <div className="relative" ref={neighborhoodRef}>
        <button
          onClick={() => setNeighborhoodOpen(!neighborhoodOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 bg-white/60 border rounded-xl text-xs cursor-pointer transition-all ${
            selectedNeighborhoods.length > 0
              ? "border-accent text-foreground font-medium"
              : "border-border text-muted hover:border-border-strong"
          }`}
        >
          <span className={`truncate ${selectedNeighborhoods.length > 0 ? "text-foreground" : ""}`}>
            {neighborhoodLabel}
          </span>
          <svg className={`w-3 h-3 shrink-0 ml-1 transition-transform duration-150 ${neighborhoodOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {neighborhoodOpen && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
            {selectedNeighborhoods.length > 0 && (
              <div className="px-3 py-2 border-b border-border">
                <button
                  onClick={() => onNeighborhoodsChange([])}
                  className="text-[11px] text-accent hover:underline cursor-pointer"
                >
                  Clear all
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
          </div>
        )}
      </div>

      {/* Type toggle pills */}
      <div className="flex flex-wrap gap-1.5">
        {terraceTypes.map((tt) => (
          <button
            key={tt.value}
            onClick={() => toggleType(tt.value)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
              selectedTypes.includes(tt.value)
                ? "bg-accent text-white border-accent"
                : "border-border bg-white/40 text-muted hover:text-foreground hover:border-border-strong"
            }`}
          >
            {tt.label}
          </button>
        ))}
      </div>

      {/* Desktop: Toggle pills — hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => onDogFriendlyChange(!dogFriendly)}
          className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            dogFriendly
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          }`}
        >
          {t.dogFriendly}
        </button>
        <button
          onClick={() => onCoveredChange(!covered)}
          className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            covered
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          }`}
        >
          {t.covered}
        </button>
        <button
          onClick={() => onOpenNowChange(!openNow)}
          className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            openNow
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          }`}
        >
          Open now
        </button>
        <button
          onClick={onSortByDistanceChange}
          disabled={locating}
          className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            sortByDistance
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          } disabled:opacity-50 disabled:cursor-default`}
        >
          {locating ? t.locating : t.nearMe}
        </button>
        <span className="ml-auto text-[11px] font-medium text-muted tabular-nums shrink-0">
          {t.spots(resultCount)}
        </span>
      </div>

      {/* Mobile: Filters dropdown toggle */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`shrink-0 whitespace-nowrap text-xs font-medium px-4 py-2 rounded-xl border cursor-pointer flex items-center gap-2 transition-colors ${
            activeFilterCount > 0
              ? "bg-accent text-white border-accent"
              : "border-border bg-white/60 text-foreground hover:border-border-strong"
          }`}
        >
          &#x25BC; Filters
          {activeFilterCount > 0 && (
            <span className="bg-white/30 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
        <span className="ml-auto text-[11px] font-medium text-muted tabular-nums shrink-0">
          {t.spots(resultCount)}
        </span>
      </div>

      {/* Mobile: Filters dropdown panel */}
      {filtersOpen && (
        <div className="flex md:hidden flex-col gap-0 rounded-xl border border-border bg-white/80 overflow-hidden">
          {[
            { label: t.dogFriendly, checked: dogFriendly, onChange: () => onDogFriendlyChange(!dogFriendly) },
            { label: t.covered, checked: covered, onChange: () => onCoveredChange(!covered) },
            { label: "Open now", checked: openNow, onChange: () => onOpenNowChange(!openNow) },
            { label: locating ? t.locating : t.nearMe, checked: sortByDistance, onChange: onSortByDistanceChange },
          ].map(({ label, checked, onChange }, i) => (
            <label
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/60 transition-colors border-b border-border last:border-b-0"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="accent-[#c45d3e] w-4 h-4 shrink-0"
              />
              <span className="text-[13px] text-foreground">{label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
