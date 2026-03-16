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
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const neighborhoodRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(e.target as Node)) {
        setNeighborhoodOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
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
      : selectedNeighborhoods.length === 1
      ? selectedNeighborhoods[0]
      : `${selectedNeighborhoods.length} ${t.neighborhoods}`;

  const typeLabel =
    selectedTypes.length === 0
      ? t.allTypes
      : selectedTypes.length === 1
      ? (terraceTypes.find((tt) => tt.value === selectedTypes[0])?.label ?? selectedTypes[0])
      : `${selectedTypes.length} ${t.types}`;

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
          className={`w-full pl-9 py-2.5 bg-white/60 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:border-accent focus:bg-white/80 focus:shadow-sm transition-all ${search ? "pr-8" : "pr-3"}`}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3.5 h-3.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Neighborhood dropdown — always visible */}
      {/* On mobile: sits beside type dropdown. On desktop: full row with result count */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1" ref={neighborhoodRef}>
          <button
            onClick={() => { setNeighborhoodOpen(!neighborhoodOpen); setTypeOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 bg-white/60 border rounded-xl text-xs cursor-pointer transition-all ${
              selectedNeighborhoods.length > 0
                ? "border-accent text-foreground font-medium"
                : "border-border text-muted hover:border-border-strong"
            }`}
          >
            <span className="truncate">{neighborhoodLabel}</span>
            <svg className={`w-3 h-3 shrink-0 ml-1 transition-transform duration-150 ${neighborhoodOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {neighborhoodOpen && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
              {selectedNeighborhoods.length > 0 && (
                <div className="px-3 py-2 border-b border-border">
                  <button onClick={() => onNeighborhoodsChange([])} className="text-[11px] text-accent hover:underline cursor-pointer">
                    {t.clearAll}
                  </button>
                </div>
              )}
              {neighborhoods.map((n) => (
                <label key={n} className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedNeighborhoods.includes(n)} onChange={() => toggleNeighborhood(n)} className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs text-foreground">{n}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Type dropdown — mobile only */}
        <div className="relative flex-1 md:hidden" ref={typeRef}>
          <button
            onClick={() => { setTypeOpen(!typeOpen); setNeighborhoodOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 bg-white/60 border rounded-xl text-xs cursor-pointer transition-all ${
              selectedTypes.length > 0
                ? "border-accent text-foreground font-medium"
                : "border-border text-muted hover:border-border-strong"
            }`}
          >
            <span className="truncate">{typeLabel}</span>
            <svg className={`w-3 h-3 shrink-0 ml-1 transition-transform duration-150 ${typeOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {typeOpen && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              {selectedTypes.length > 0 && (
                <div className="px-3 py-2 border-b border-border">
                  <button onClick={() => onTypesChange([])} className="text-[11px] text-accent hover:underline cursor-pointer">
                    {t.clearAll}
                  </button>
                </div>
              )}
              {terraceTypes.map((tt) => (
                <label key={tt.value} className="flex items-center gap-2.5 px-3 py-2 hover:bg-foreground/[0.04] cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedTypes.includes(tt.value)} onChange={() => toggleType(tt.value)} className="accent-[#c45d3e] w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs text-foreground">{tt.label}</span>
                </label>
              ))}
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

      {/* Attribute filter pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { label: locating ? t.locating : t.nearMe, active: sortByDistance, onClick: onSortByDistanceChange, disabled: locating },
            { label: t.openNow, active: openNow, onClick: () => onOpenNowChange(!openNow), disabled: false },
            { label: t.dogFriendly, active: dogFriendly, onClick: () => onDogFriendlyChange(!dogFriendly), disabled: false },
            { label: t.covered, active: covered, onClick: () => onCoveredChange(!covered), disabled: false },
          ].map(({ label, active, onClick, disabled }) => (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled}
              className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                active ? "active" : "border-border bg-white/40 text-muted hover:text-foreground hover:border-border-strong"
              } disabled:opacity-50 disabled:cursor-default`}
            >
              {label}
            </button>
          ))}
      </div>
    </div>
  );
}
