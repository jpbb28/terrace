"use client";

import Image from "next/image";
import { Terrace } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";
import { cuisineTypeFR } from "@/lib/i18n";

interface TerraceCardProps {
  terrace: Terrace;
  selected: boolean;
  onClick: () => void;
  distance?: number;
}

export default function TerraceCard({ terrace, selected, onClick, distance }: TerraceCardProps) {
  const { t, lang } = useLang();

  const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
    sidewalk: { label: t.sidewalk, color: "bg-olive-soft text-olive", icon: "\u{1F6B6}" },
    rooftop: { label: t.rooftop, color: "bg-warm-soft text-warm", icon: "\u{1F307}" },
    backyard: { label: t.backyard, color: "bg-olive-soft text-olive", icon: "\u{1F333}" },
    courtyard: { label: t.courtyard, color: "bg-accent-soft text-accent", icon: "\u{1F3DB}" },
    balcony: { label: t.balcony, color: "bg-warm-soft text-warm", icon: "\u{1FA9F}" },
    garden: { label: t.garden, color: "bg-olive-soft text-olive", icon: "\u{1F33F}" },
  };

  const typeInfo = terrace.terraceType ? typeConfig[terrace.terraceType] : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 cursor-pointer group overflow-hidden ${
        selected
          ? "border-accent bg-white/90 shadow-md shadow-accent/10"
          : "border-transparent bg-white/50 hover:bg-white/80 hover:border-border hover:shadow-sm"
      }`}
    >
      {terrace.photos.length > 0 ? (
        <div className="relative w-full h-36 overflow-hidden">
          <Image
            src={terrace.photos[0]}
            alt={terrace.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="500px"
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-warm-soft via-accent-soft to-olive-soft flex items-center justify-center">
          <span className="text-xs text-accent/40 font-medium">No photo yet</span>
        </div>
      )}
      <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-display font-semibold text-[15px] leading-snug group-hover:text-accent transition-colors">
          {terrace.name}
        </h3>
        {typeInfo && (
          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
            {typeInfo.icon} {typeInfo.label}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {terrace.address}
        </p>
        {distance !== undefined && (
          <span className="text-[10px] font-medium text-accent shrink-0 ml-2">
            {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
          </span>
        )}
      </div>

      <p className="text-xs text-foreground/60 mb-3 line-clamp-2 leading-relaxed">
        {lang === "fr" && terrace.descriptionFr ? terrace.descriptionFr : terrace.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted font-medium">
          {lang === "fr" ? (cuisineTypeFR[terrace.cuisineType] ?? terrace.cuisineType) : terrace.cuisineType}
        </span>
        {terrace.capacity ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted">
            {t.seats(terrace.capacity)}
          </span>
        ) : null}
        {terrace.dogFriendly && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted">
            {t.dogsOk}
          </span>
        )}
        {terrace.covered && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted">
            {t.coveredTag}
          </span>
        )}
        {terrace.heated && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-soft text-warm">
            {t.heated}
          </span>
        )}
      </div>
      </div>
    </button>
  );
}
