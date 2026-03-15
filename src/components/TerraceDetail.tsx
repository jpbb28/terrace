"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Terrace } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";
import { cuisineTypeFR } from "@/lib/i18n";
import { getHoursStatus, getDaysSchedule, slugify } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import ReviewSection from "@/components/ReviewSection";

interface TerraceDetailProps {
  terrace: Terrace;
  onClose: () => void;
}

export default function TerraceDetail({ terrace, onClose }: TerraceDetailProps) {
  const { t, lang } = useLang();
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    setActivePhoto(0);
    trackEvent(terrace.id, "view");
  }, [terrace.id]);

  const typeLabels: Record<string, string> = {
    sidewalk: t.sidewalk,
    rooftop: t.rooftop,
    backyard: t.backyard,
    courtyard: t.courtyard,
    balcony: t.balcony,
    garden: t.garden,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      {/* Header accent bar */}
      <div className="h-1 shrink-0 bg-gradient-to-r from-accent via-warm to-olive" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
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

        {/* Photo gallery */}
        {terrace.photos.length > 0 && (
          <div className="mb-5">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <Image
                src={terrace.photos[activePhoto]}
                alt={terrace.name}
                fill
                className="object-cover"
                sizes="380px"
                priority
              />
            </div>
            {terrace.photos.length > 1 && (
              <div className="flex gap-1.5 pt-2 overflow-x-auto">
                {terrace.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activePhoto ? "border-accent" : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <Image src={photo} alt="" fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
          {lang === "fr" && terrace.descriptionFr ? terrace.descriptionFr : terrace.description}
        </p>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {terrace.terraceType?.length ? (
            <InfoItem label={t.type} value={terrace.terraceType.map((tt) => typeLabels[tt]).join(", ")} />
          ) : null}
          {terrace.cuisineType && (
            <InfoItem label={t.cuisine} value={lang === "fr" ? (cuisineTypeFR[terrace.cuisineType] ?? terrace.cuisineType) : terrace.cuisineType} />
          )}
          {terrace.capacity ? (
            <InfoItem label={t.capacity} value={t.seatsDetail(terrace.capacity)} />
          ) : null}
          {terrace.openingPeriods?.length ? (
            <HoursItem terrace={terrace} />
          ) : terrace.openingHours ? (
            <InfoItem label={t.hours} value={terrace.openingHours} />
          ) : null}
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
            onClick={() => trackEvent(terrace.id, "directions")}
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
              onClick={() => trackEvent(terrace.id, "website_click")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors shadow-sm hover:shadow-md"
            >
              {t.visitWebsite}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}

          {terrace.instagram && (
            <a
              href={`https://instagram.com/${terrace.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-foreground border border-border rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              {terrace.instagram}
            </a>
          )}

          {terrace.phone && (
            <a
              href={`tel:${terrace.phone}`}
              onClick={() => trackEvent(terrace.id, "phone_click")}
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
        <div className="pb-4 border-b border-border flex items-center justify-between mb-6">
          <Link
            href={`/submit?edit=${terrace.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2a2 2 0 01.586-1.414z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.suggestEdit}
          </Link>
          <Link
            href={`/terraces/${slugify(terrace.name)}`}
            className="text-border hover:text-muted transition-colors"
            aria-label="Permalink"
            title="View full page"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Reviews */}
        <ReviewSection terraceId={terrace.id} placeId={terrace.placeId} googleRating={terrace.googleRating} googleReviewCount={terrace.googleReviewCount} />
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

function HoursItem({ terrace }: { terrace: Terrace }) {
  const [expanded, setExpanded] = useState(false);
  const { t, lang } = useLang();
  const status = getHoursStatus(terrace, lang);
  const schedule = getDaysSchedule(terrace.openingPeriods, lang);

  if (!status) return null;

  return (
    <div className="col-span-2 rounded-xl bg-foreground/[0.03] border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-foreground/[0.03] transition-colors cursor-pointer"
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            status.open ? "bg-green-500" : "bg-foreground/25"
          }`}
        />
        <span
          className={`text-sm font-semibold ${
            status.open ? "text-green-700" : "text-foreground"
          }`}
        >
          {status.open ? t.openLabel : t.closedLabel}
        </span>
        {status.qualifier && (
          <>
            <span className="text-foreground/25 text-sm">·</span>
            <span className="text-sm text-foreground/60">{status.qualifier}</span>
          </>
        )}
        <svg
          className={`w-4 h-4 text-muted ml-auto shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border space-y-1.5 pt-2.5">
          {schedule.map(({ dayName, hours, isToday, isClosed }) => (
            <div
              key={dayName}
              className={`flex justify-between gap-4 text-xs ${
                isToday ? "font-semibold text-foreground" : "text-foreground/55"
              }`}
            >
              <span className="shrink-0">{dayName}</span>
              <span className={`text-right ${isClosed ? "text-muted" : ""}`}>
                {hours}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
