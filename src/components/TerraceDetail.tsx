"use client";

import Link from "next/link";
import { Terrace } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";

interface TerraceDetailProps {
  terrace: Terrace;
  onClose: () => void;
}

export default function TerraceDetail({ terrace, onClose }: TerraceDetailProps) {
  const { t } = useLang();

  const typeLabels: Record<string, string> = {
    sidewalk: t.sidewalk,
    rooftop: t.rooftop,
    backyard: t.backyard,
    courtyard: t.courtyard,
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header accent bar */}
      <div className="h-1 shrink-0 bg-gradient-to-r from-accent via-warm to-olive" />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Close */}
        <button
          onClick={onClose}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors cursor-pointer group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.backToList}
        </button>

        {/* Name + neighborhood */}
        <div className="mb-1">
          <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-1.5">
            {terrace.neighborhood}
          </p>
          <h2 className="font-display text-2xl font-bold leading-tight">
            {terrace.name}
          </h2>
        </div>

        <p className="text-sm text-muted mb-5 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {terrace.address}
        </p>

        {/* Description */}
        <p className="text-sm text-foreground/75 mb-6 leading-relaxed">
          {terrace.description}
        </p>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {terrace.terraceType && (
            <InfoItem label={t.type} value={typeLabels[terrace.terraceType]} />
          )}
          {terrace.cuisineType && (
            <InfoItem label={t.cuisine} value={terrace.cuisineType} />
          )}
          {terrace.capacity ? (
            <InfoItem label={t.capacity} value={t.seatsDetail(terrace.capacity)} />
          ) : null}
          {terrace.openingHours && (
            <InfoItem label={t.hours} value={terrace.openingHours} />
          )}
          {terrace.seasonalOpen && terrace.seasonalClose && (
            <InfoItem
              label={t.season}
              value={`${terrace.seasonalOpen} \u2013 ${terrace.seasonalClose}`}
            />
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {terrace.dogFriendly && <Tag label={t.dogFriendlyTag} />}
          {terrace.covered && <Tag label={t.coveredTagDetail} />}
          {terrace.heated && <Tag label={t.heatedTag} />}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 mb-6">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${terrace.name} ${terrace.address}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-foreground border border-border rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {t.googleMaps}
          </a>

          {terrace.website && (
            <a
              href={terrace.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors shadow-sm hover:shadow-md"
            >
              {t.visitWebsite}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}

          {terrace.phone && (
            <a
              href={`tel:${terrace.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-foreground border border-border rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.call}
            </a>
          )}
        </div>

        {/* Correction link */}
        <div className="pt-4 border-t border-border">
          <Link
            href={`/submit?edit=${terrace.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2a2 2 0 01.586-1.414z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.suggestEdit}
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border">
      <p className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="text-xs px-3 py-1.5 rounded-full bg-accent-soft text-accent font-medium border border-accent/15">
      {label}
    </span>
  );
}
