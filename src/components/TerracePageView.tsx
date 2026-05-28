import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatHours } from "@/lib/utils";
import type { Terrace } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { translations, cuisineTypeFR, neighborhoodFR } from "@/lib/i18n";
import SiteNav from "@/components/SiteNav";

const BASE = "https://terrasseseason.com";

export const terraceUrl = (slug: string, lang: Lang) =>
  lang === "fr" ? `${BASE}/fr/terraces/${slug}` : `${BASE}/terraces/${slug}`;

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TYPE_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    sidewalk: "Sidewalk",
    rooftop: "Rooftop",
    backyard: "Backyard",
    courtyard: "Courtyard",
    balcony: "Balcony",
    garden: "Garden",
    plaza: "Plaza",
  },
  fr: {
    sidewalk: "Trottoir",
    rooftop: "Rooftop",
    backyard: "Arrière-cour",
    courtyard: "Cour intérieure",
    balcony: "Balcon",
    garden: "Jardin",
    plaza: "Esplanade",
  },
};

const UI = {
  en: {
    cuisine: "Cuisine",
    type: "Type",
    capacity: "Capacity",
    seats: "seats",
    terraceHours: "Terrace Hours",
    hours: "Hours",
    googleMaps: "Google Maps",
    visitWebsite: "Visit website",
    call: "Call",
    viewOnMap: "View on map",
    terraceWord: "terrace",
    back: "All terraces",
    dog: "Dog-friendly",
    covered: "Covered",
    heated: "Heated",
    inLang: "in",
    typeJoin: " and ",
  },
  fr: {
    cuisine: "Cuisine",
    type: "Type",
    capacity: "Capacité",
    seats: "places",
    terraceHours: "Heures de la terrasse",
    hours: "Horaires",
    googleMaps: "Google Maps",
    visitWebsite: "Visiter le site",
    call: "Appeler",
    viewOnMap: "Voir sur la carte",
    terraceWord: "terrasse",
    back: "Toutes les terrasses",
    dog: "Chien accepté",
    covered: "Couvert",
    heated: "Chauffée",
    inLang: "à",
    typeJoin: " et ",
  },
} as const;

function typeLabels(terrace: Terrace, lang: Lang): string[] {
  return terrace.terraceType?.map((tt) => TYPE_LABELS[lang][tt] ?? tt) ?? [];
}

function cuisineLabel(terrace: Terrace, lang: Lang): string {
  if (lang === "fr")
    return cuisineTypeFR[terrace.cuisineType] ?? terrace.cuisineType;
  return terrace.cuisineType;
}

function neighborhoodLabel(terrace: Terrace, lang: Lang): string {
  if (lang === "fr")
    return neighborhoodFR[terrace.neighborhood] ?? terrace.neighborhood;
  return terrace.neighborhood;
}

// Primary-language description (falls back to EN when no FR copy exists), plus
// the opposite-language description shown as a muted secondary paragraph.
function descriptions(terrace: Terrace, lang: Lang) {
  if (lang === "fr") {
    return {
      primary: terrace.descriptionFr ?? terrace.description,
      secondary: terrace.descriptionFr ? terrace.description : undefined,
    };
  }
  return { primary: terrace.description, secondary: terrace.descriptionFr };
}

export function buildTerraceMetadata(
  terrace: Terrace,
  slug: string,
  lang: Lang,
): Metadata {
  const ui = UI[lang];
  const typeStr = typeLabels(terrace, lang).join(ui.typeJoin) || ui.terraceWord;
  const nb = neighborhoodLabel(terrace, lang);
  const { primary } = descriptions(terrace, lang);
  const intro =
    lang === "fr"
      ? `${terrace.name} est une terrasse ${typeStr} à ${nb}, Montréal. ${primary}`
      : `${terrace.name} is a ${typeStr} terrace in ${nb}, Montréal. ${primary}`;
  const desc = intro.slice(0, 160);
  const title =
    lang === "fr"
      ? `${terrace.name} – Terrasse & Patio à ${nb}, Montréal`
      : `${terrace.name} – Terrasse & Patio in ${nb}, Montréal`;
  const canonical = terraceUrl(slug, lang);

  return {
    title,
    description: desc,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        "en-CA": terraceUrl(slug, "en"),
        "fr-CA": terraceUrl(slug, "fr"),
        "x-default": terraceUrl(slug, "en"),
      },
    },
    openGraph: {
      title: `${terrace.name} | Terrasse Season`,
      description: desc,
      url: canonical,
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      ...(terrace.photos[0] && {
        images: [{ url: `${BASE}${terrace.photos[0]}`, alt: terrace.name }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${terrace.name} | Terrasse Season`,
      description: desc,
      ...(terrace.photos[0] && { images: [terrace.photos[0]] }),
    },
  };
}

export function buildTerraceJsonLd(terrace: Terrace, slug: string, lang: Lang) {
  const canonical = terraceUrl(slug, lang);
  const { primary } = descriptions(terrace, lang);

  const openingHoursSpecification = terrace.openingPeriods?.length
    ? terrace.openingPeriods.map((p) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${SCHEMA_DAYS[p.day]}`,
        opens: p.open,
        closes: p.close,
      }))
    : undefined;

  const establishment = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: terrace.name,
    description: primary,
    inLanguage: lang === "fr" ? "fr-CA" : "en-CA",
    address: {
      "@type": "PostalAddress",
      streetAddress: terrace.address,
      addressLocality: "Montréal",
      addressRegion: "QC",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: terrace.lat,
      longitude: terrace.lng,
    },
    url: canonical,
    ...(terrace.cuisineType && { servesCuisine: terrace.cuisineType }),
    ...(terrace.website && { sameAs: terrace.website }),
    ...(terrace.phone && { telephone: terrace.phone }),
    ...(terrace.photos[0] && {
      image: `${BASE}${terrace.photos[0]}`,
    }),
    ...(openingHoursSpecification && { openingHoursSpecification }),
    ...(terrace.googleRating &&
      terrace.googleReviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: terrace.googleRating,
          reviewCount: terrace.googleReviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        // The homepage is a single bilingual page (client-side language
        // toggle), so both locales point at the site root — there is no
        // separate /fr homepage.
        "@type": "ListItem",
        position: 1,
        name: "Terrasse Season",
        item: BASE,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: neighborhoodLabel(terrace, lang),
        item: `${BASE}/?neighborhood=${encodeURIComponent(terrace.neighborhood)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: terrace.name,
        item: canonical,
      },
    ],
  };

  return [establishment, breadcrumb];
}

export default function TerracePageView({
  terrace,
  slug,
  lang,
}: {
  terrace: Terrace;
  slug: string;
  lang: Lang;
}) {
  const ui = UI[lang];
  const t = translations[lang];
  const jsonLd = buildTerraceJsonLd(terrace, slug, lang);
  const hoursLines = formatHours(terrace.openingPeriods, lang);
  const { primary, secondary } = descriptions(terrace, lang);

  const features = [
    terrace.dogFriendly && ui.dog,
    terrace.covered && ui.covered,
    terrace.heated && ui.heated,
  ].filter(Boolean) as string[];

  const nb = neighborhoodLabel(terrace, lang);
  const typeStr = typeLabels(terrace, lang).join(" & ");
  const subtitle = [
    typeStr
      ? lang === "fr"
        ? `Terrasse ${typeStr}`
        : `${typeStr} terrace`
      : lang === "fr"
        ? "Terrasse"
        : "Terrace",
    cuisineLabel(terrace, lang),
    `${nb}, Montréal`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div lang={lang === "fr" ? "fr-CA" : "en-CA"}>
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="min-h-screen bg-background">
        <SiteNav
          pageLang={lang}
          altHref={lang === "fr" ? `/terraces/${slug}` : `/fr/terraces/${slug}`}
          backLabel={ui.back}
          backLabelFr={ui.back}
        />

        {/* Hero photo */}
        {terrace.photos[0] ? (
          <div className="relative w-full h-64 md:h-[420px]">
            <Image
              src={terrace.photos[0]}
              alt={
                lang === "fr"
                  ? `${terrace.name} – terrasse extérieure à ${nb}, Montréal`
                  : `${terrace.name} – outdoor terrace in ${nb}, Montréal`
              }
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-warm-soft via-accent-soft to-olive-soft" />
        )}

        {/* Content */}
        <div className="max-w-2xl mx-auto px-5 py-8">
          <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
            {nb} · Montréal
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-1">
            {terrace.name}
          </h1>
          <p className="text-sm text-foreground/50 mb-3">{subtitle}</p>
          <p className="text-sm text-muted mb-6 flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {terrace.address}, Montréal, QC
          </p>

          <p className="font-reading text-base text-foreground/80 leading-relaxed mb-4">
            {primary}
          </p>

          {secondary && (
            <p className="font-reading text-sm text-foreground/50 leading-relaxed mb-8 italic">
              {secondary}
            </p>
          )}

          {!secondary && <div className="mb-8" />}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {terrace.cuisineType && (
              <InfoItem
                label={ui.cuisine}
                value={cuisineLabel(terrace, lang)}
              />
            )}
            {terrace.terraceType?.length ? (
              <InfoItem
                label={ui.type}
                value={typeLabels(terrace, lang).join(", ")}
              />
            ) : null}
            {terrace.capacity ? (
              <InfoItem
                label={ui.capacity}
                value={`${terrace.capacity} ${ui.seats}`}
              />
            ) : null}
          </div>

          {/* Hours */}
          {hoursLines.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-foreground/[0.03] border border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted mb-2.5 font-medium">
                {ui.terraceHours}
              </p>
              <div className="space-y-1">
                {hoursLines.map((line) => (
                  <p key={line} className="text-sm text-foreground/80">
                    {line}
                  </p>
                ))}
              </div>
              <p className="text-[11px] text-muted italic mt-3 pt-3 border-t border-border">
                {t.terraceHoursNote}
              </p>
            </div>
          )}
          {!hoursLines.length && terrace.openingHours && (
            <div className="mb-6 p-4 rounded-xl bg-foreground/[0.03] border border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                {ui.hours}
              </p>
              <p className="text-sm text-foreground/80">
                {terrace.openingHours}
              </p>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {features.map((f) => (
                <span
                  key={f}
                  className="text-xs px-3 py-1.5 rounded-full bg-accent-soft text-accent font-medium border border-accent/15"
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pb-8 border-b border-border mb-6">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${terrace.name} ${terrace.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-foreground border border-border rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {ui.googleMaps}
            </a>
            {terrace.website && (
              <a
                href={terrace.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors shadow-sm"
              >
                {ui.visitWebsite}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
            {terrace.phone && (
              <a
                href={`tel:${terrace.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-foreground border border-border rounded-xl transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {ui.call}
              </a>
            )}
          </div>

          <Link
            href={`/?terrace=${terrace.id}`}
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-medium"
          >
            {ui.viewOnMap}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M9 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
