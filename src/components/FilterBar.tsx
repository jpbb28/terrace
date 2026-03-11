"use client";

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

  const terraceTypes: { value: TerraceType; label: string; icon: string }[] = [
    { value: "sidewalk", label: t.sidewalk, icon: "\u{1F6B6}" },
    { value: "rooftop", label: t.rooftop, icon: "\u{1F307}" },
    { value: "backyard", label: t.backyard, icon: "\u{1F333}" },
    { value: "courtyard", label: t.courtyard, icon: "\u{1F3DB}" },
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

      {/* Toggle pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDogFriendlyChange(!dogFriendly)}
          className={`filter-pill text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            dogFriendly
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          }`}
        >
          &#128054; {t.dogFriendly}
        </button>
        <button
          onClick={() => onCoveredChange(!covered)}
          className={`filter-pill text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            covered
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          }`}
        >
          &#9748; {t.covered}
        </button>
        <button
          onClick={() => onOpenNowChange(!openNow)}
          className={`filter-pill text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
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
          className={`filter-pill text-[11px] font-medium px-3 py-1.5 rounded-full border cursor-pointer ${
            sortByDistance
              ? "active"
              : "border-border bg-white/40 text-muted hover:text-foreground"
          } disabled:opacity-50 disabled:cursor-default`}
        >
          {locating ? t.locating : t.nearMe}
        </button>
        <span className="ml-auto text-[11px] font-medium text-muted tabular-nums">
          {t.spots(resultCount)}
        </span>
      </div>
    </div>
  );
}
