"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Terrace, TerraceType } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";
import { cuisineTypeFR } from "@/lib/i18n";
import { slugify } from "@/lib/utils";

interface TerraceCardProps {
  terrace: Terrace;
  selected: boolean;
  onClick: () => void;
  distance?: number;
  priority?: boolean;
  compact?: boolean;
}

export default function TerraceCard({
  terrace,
  selected,
  onClick,
  distance,
  priority = false,
  compact = false,
}: TerraceCardProps) {
  const { t, lang } = useLang();

  const typeConfig: Record<TerraceType, { label: string; color: string }> = {
    sidewalk: { label: t.sidewalk, color: "bg-olive-soft text-olive" },
    rooftop: { label: t.rooftop, color: "bg-warm-soft text-warm" },
    backyard: { label: t.backyard, color: "bg-olive-soft text-olive" },
    courtyard: { label: t.courtyard, color: "bg-accent-soft text-accent" },
    balcony: { label: t.balcony, color: "bg-warm-soft text-warm" },
    garden: { label: t.garden, color: "bg-olive-soft text-olive" },
    plaza: { label: t.plaza, color: "bg-accent-soft text-accent" },
  };

  const typeInfos =
    terrace.terraceType?.map((tt) => typeConfig[tt]).filter(Boolean) ?? [];

  const [activePhoto, setActivePhoto] = useState(0);
  const touchStartX = useRef(0);
  const didSwipe = useRef(false);

  if (compact) {
    return (
      <>
        <a
          href={`/terraces/${slugify(terrace.name)}`}
          className="sr-only"
          tabIndex={-1}
          aria-label={`View ${terrace.name}`}
        >
          {terrace.name}
        </a>
        <button
          onClick={onClick}
          className={`w-full text-left rounded-xl border transition-all duration-200 cursor-pointer group overflow-hidden ${
            selected
              ? "border-accent bg-white shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.06)_0px_2px_8px,rgba(196,93,62,0.12)_0px_0px_0px_2px]"
              : "border-transparent bg-white shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] hover:shadow-[rgba(0,0,0,0.08)_0px_4px_12px] hover:-translate-y-0.5"
          }`}
        >
          {/* Photo */}
          {terrace.photos.length > 0 ? (
            <div
              className="relative w-full overflow-hidden"
              style={{ paddingTop: "62.5%" /* 16:10 */ }}
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
                didSwipe.current = false;
              }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(dx) > 40 && terrace.photos.length > 1) {
                  didSwipe.current = true;
                  e.stopPropagation();
                  setActivePhoto((p) =>
                    dx < 0
                      ? Math.min(p + 1, terrace.photos.length - 1)
                      : Math.max(p - 1, 0),
                  );
                }
              }}
              onClick={(e) => {
                if (didSwipe.current) {
                  e.stopPropagation();
                  didSwipe.current = false;
                }
              }}
            >
              <Image
                src={terrace.photos[activePhoto]}
                alt={terrace.name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 768px) 240px, calc(100vw - 24px)"
                priority={priority && activePhoto === 0}
              />
              {/* Type badge overlay */}
              {typeInfos.length > 0 && (
                <div className="absolute bottom-1.5 left-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm bg-white/80 text-foreground/70`}
                  >
                    {typeInfos[0].label}
                  </span>
                </div>
              )}
              {/* Dot indicators */}
              {terrace.photos.length > 1 && (
                <div className="absolute bottom-1.5 right-0 left-0 flex justify-center gap-1 pointer-events-none">
                  {terrace.photos.slice(0, 5).map((_, i) => (
                    <span
                      key={i}
                      className={`block rounded-full transition-all duration-200 ${
                        i === activePhoto
                          ? "w-3 h-1 bg-white"
                          : "w-1 h-1 bg-white/55"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-full bg-gradient-to-br from-warm-soft via-accent-soft to-olive-soft flex flex-col items-center justify-center gap-1.5"
              style={{ paddingTop: "62.5%", position: "relative" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3">
                <p className="text-[10px] text-muted text-center leading-snug">
                  {t.noPhotoYet}
                </p>
                <Link
                  href={`/submit?edit=${terrace.id}#photos`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-accent hover:underline font-medium"
                >
                  {t.submitPhoto}
                </Link>
              </div>
            </div>
          )}

          {/* Card body */}
          <div className="p-2.5">
            {/* Name + rating */}
            <div className="flex items-start justify-between gap-1 mb-0.5">
              <h2 className="font-display font-semibold text-[13px] leading-snug group-hover:text-accent transition-colors line-clamp-1">
                {terrace.name}
              </h2>
              {terrace.googleRating && (
                <span className="text-[11px] font-semibold text-foreground/70 shrink-0 flex items-center gap-0.5">
                  <span className="text-accent text-[10px]">★</span>
                  {terrace.googleRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Distance */}
            {distance !== undefined && (
              <p className="text-[11px] text-accent font-medium leading-tight mb-1">
                {distance < 1
                  ? `${Math.round(distance * 1000)} m`
                  : `${distance.toFixed(1)} km`}
              </p>
            )}

            {/* Description */}
            <p className="text-[11px] text-foreground/55 leading-snug line-clamp-2 mb-1.5">
              {lang === "fr" && terrace.descriptionFr
                ? terrace.descriptionFr
                : terrace.description}
            </p>

            {/* Attribute tags */}
            <div className="flex flex-wrap gap-1">
              {terrace.capacity ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted">
                  {t.seats(terrace.capacity)}
                </span>
              ) : null}
              {terrace.dogFriendly && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted">
                  {t.dogsOk}
                </span>
              )}
              {terrace.covered && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted">
                  {t.coveredTag}
                </span>
              )}
              {terrace.heated && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warm-soft text-warm">
                  {t.heated}
                </span>
              )}
            </div>
          </div>
        </button>
      </>
    );
  }

  // ── Full card (mobile list view) ──
  return (
    <>
      <a
        href={`/terraces/${slugify(terrace.name)}`}
        className="sr-only"
        tabIndex={-1}
        aria-label={`View ${terrace.name}`}
      >
        {terrace.name}
      </a>
      <button
        onClick={onClick}
        className={`w-full text-left rounded-xl border transition-all duration-200 cursor-pointer group overflow-hidden ${
          selected
            ? "border-accent bg-white shadow-md shadow-accent/10"
            : "border-border/60 bg-white shadow-sm hover:shadow-md hover:border-border"
        }`}
      >
        {terrace.photos.length > 0 ? (
          <div
            className="relative w-full h-44 overflow-hidden"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              didSwipe.current = false;
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 40 && terrace.photos.length > 1) {
                didSwipe.current = true;
                e.stopPropagation();
                setActivePhoto((p) =>
                  dx < 0
                    ? Math.min(p + 1, terrace.photos.length - 1)
                    : Math.max(p - 1, 0),
                );
              }
            }}
            onClick={(e) => {
              if (didSwipe.current) {
                e.stopPropagation();
                didSwipe.current = false;
              }
            }}
          >
            <Image
              src={terrace.photos[activePhoto]}
              alt={terrace.name}
              fill
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(min-width: 768px) 468px, calc(100vw - 24px)"
              priority={priority && activePhoto === 0}
            />
            {terrace.photos.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
                {terrace.photos.map((_, i) => (
                  <span
                    key={i}
                    className={`block rounded-full transition-all duration-200 ${
                      i === activePhoto
                        ? "w-4 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-warm-soft via-accent-soft to-olive-soft flex flex-col items-center justify-center gap-1.5">
            <p className="text-xs text-muted text-center">{t.noPhotoYet}</p>
            <Link
              href={`/submit?edit=${terrace.id}#photos`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-accent hover:underline font-medium"
            >
              {t.submitPhoto}
            </Link>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h2 className="font-display font-semibold text-[15px] leading-snug group-hover:text-accent transition-colors">
              {terrace.name}
            </h2>
            {typeInfos.length > 0 && (
              <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                {typeInfos.map((info) => (
                  <span
                    key={info.label}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${info.color}`}
                  >
                    {info.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">{terrace.neighborhood}</p>
            {distance !== undefined && (
              <span className="text-[10px] font-medium text-accent shrink-0 ml-2">
                {distance < 1
                  ? `${Math.round(distance * 1000)} m`
                  : `${distance.toFixed(1)} km`}
              </span>
            )}
          </div>

          <p className="text-xs text-foreground/60 mb-3 line-clamp-2 leading-relaxed">
            {lang === "fr" && terrace.descriptionFr
              ? terrace.descriptionFr
              : terrace.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
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
    </>
  );
}
