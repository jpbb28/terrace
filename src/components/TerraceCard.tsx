"use client";

import { Terrace } from "@/lib/types";

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  sidewalk: { label: "Sidewalk", color: "bg-olive-soft text-olive", icon: "\u{1F6B6}" },
  rooftop: { label: "Rooftop", color: "bg-warm-soft text-warm", icon: "\u{1F307}" },
  backyard: { label: "Backyard", color: "bg-olive-soft text-olive", icon: "\u{1F333}" },
  courtyard: { label: "Courtyard", color: "bg-accent-soft text-accent", icon: "\u{1F3DB}" },
};

interface TerraceCardProps {
  terrace: Terrace;
  selected: boolean;
  onClick: () => void;
}

export default function TerraceCard({ terrace, selected, onClick }: TerraceCardProps) {
  const typeInfo = terrace.terraceType ? typeConfig[terrace.terraceType] : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
        selected
          ? "border-accent bg-white/90 shadow-md shadow-accent/10"
          : "border-transparent bg-white/50 hover:bg-white/80 hover:border-border hover:shadow-sm"
      }`}
    >
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

      <p className="text-xs text-muted mb-2 flex items-center gap-1">
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {terrace.address}
      </p>

      <p className="text-xs text-foreground/60 mb-3 line-clamp-2 leading-relaxed">
        {terrace.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted font-medium">
          {terrace.cuisineType}
        </span>
        {terrace.capacity ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted">
            ~{terrace.capacity} seats
          </span>
        ) : null}
        {terrace.dogFriendly && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted">
            &#128054; Dogs OK
          </span>
        )}
        {terrace.covered && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted">
            &#9748; Covered
          </span>
        )}
        {terrace.heated && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-soft text-warm">
            &#128293; Heated
          </span>
        )}
      </div>
    </button>
  );
}
