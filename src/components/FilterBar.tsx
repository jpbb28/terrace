"use client";

import { useState } from "react";
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
  selectedNeighborhood: string;
  onNeighborhoodChange: (v: string) => void;
  selectedType: string;
  onTypeChange: (v: string) => void;
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
  selectedNeighborhood, onNeighborhoodChange,
  selectedType, onTypeChange,
  dogFriendly, onDogFriendlyChange,
  covered, onCoveredChange,
  openNow, onOpenNowChange,
  sortByDistance, onSortByDistanceChange,
  locating,
  resultCount,
}: FilterBarProps) {
  const { t } = useLang();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [dogFriendly, covered, openNow, sortByDistance].filter(Boolean).length;

  const terraceTypes: { value: TerraceType; label: string; icon: string }[] = [
    { value: "sidewalk", label: t.sidewalk, icon: "\u{1F6B6}" },
    { value: "rooftop", label: t.rooftop, icon: "\u{1F307}" },
    { value: "backyard", label: t.backyard, icon: "\u{1F333}" },
    { value: "courtyard", label: t.courtyard, icon: "\u{1F3DB}" },
    { value: "balcony", label: t.balcony, icon: "\u{1FA9F}" },
    { value: "garden", label: t.garden, icon: "\u{1F33F}" },
  ];

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

      {/* Dropdowns */}
      <div className="flex gap-2">
        <select
          value={selectedNeighborhood}
          onChange={(e) => onNeighborhoodChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-white/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
        >
          <option value="">{t.allNeighborhoods}</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-white/60 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
        >
          <option value="">{t.allTypes}</option>
          {terraceTypes.map((tt) => (
            <option key={tt.value} value={tt.value}>{tt.icon} {tt.label}</option>
          ))}
        </select>
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
          &#128054; {t.dogFriendly}
        </button>
        <button
          onClick={() => onCoveredChange(!covered)}
          className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            covered
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          }`}
        >
          &#9748; {t.covered}
        </button>
        <button
          onClick={() => onOpenNowChange(!openNow)}
          className={`filter-pill shrink-0 whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            openNow
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          }`}
        >
          &#128994; Open now
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
            { label: `🐕 ${t.dogFriendly}`, checked: dogFriendly, onChange: () => onDogFriendlyChange(!dogFriendly) },
            { label: `⛅ ${t.covered}`, checked: covered, onChange: () => onCoveredChange(!covered) },
            { label: "🟢 Open now", checked: openNow, onChange: () => onOpenNowChange(!openNow) },
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
