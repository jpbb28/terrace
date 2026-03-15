import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { terraces } from "@/data/terraces";
import { slugify, formatHours } from "@/lib/utils";
import type { Terrace } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

const TYPE_LABELS: Record<string, string> = {
  sidewalk: "Sidewalk",
  rooftop: "Rooftop",
  backyard: "Backyard",
  courtyard: "Courtyard",
  balcony: "Balcony",
  garden: "Garden",
};

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function generateStaticParams() {
  return terraces.map((t) => ({ slug: slugify(t.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const terrace = terraces.find((t) => slugify(t.name) === slug);
  if (!terrace) return {};

  const typeStr = terrace.terraceType?.map((tt) => TYPE_LABELS[tt] ?? tt).join(" and ") ?? "terrace";
  const desc = `${terrace.name} is a ${typeStr} terrace in ${terrace.neighborhood}, Montréal. ${terrace.description}`.slice(0, 160);

  return {
    title: `${terrace.name} – Terrasse & Patio in ${terrace.neighborhood}, Montréal`,
    description: desc,
    alternates: {
      canonical: `https://terrasseseason.com/terraces/${slug}`,
    },
    openGraph: {
      title: `${terrace.name} | Terrasse Season`,
      description: desc,
      ...(terrace.photos[0] && {
        images: [{ url: terrace.photos[0], alt: terrace.name }],
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

function buildJsonLd(terrace: Terrace, slug: string) {
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
    description: terrace.description,
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
    url: `https://terrasseseason.com/terraces/${slug}`,
    ...(terrace.cuisineType && { servesCuisine: terrace.cuisineType }),
    ...(terrace.website && { sameAs: terrace.website }),
    ...(terrace.phone && { telephone: terrace.phone }),
    ...(terrace.photos[0] && { image: terrace.photos[0] }),
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
        "@type": "ListItem",
        position: 1,
        name: "Terrasse Season",
        item: "https://terrasseseason.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: terrace.neighborhood,
        item: `https://terrasseseason.com/?neighborhood=${encodeURIComponent(terrace.neighborhood)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: terrace.name,
        item: `https://terrasseseason.com/terraces/${slug}`,
      },
    ],
  };

  return [establishment, breadcrumb];
}

export default async function TerracePage({ params }: Props) {
  const { slug } = await params;
  const terrace = terraces.find((t) => slugify(t.name) === slug);
  if (!terrace) notFound();

  const jsonLd = buildJsonLd(terrace, slug);
  const hoursLines = formatHours(terrace.openingPeriods);

  const features = [
    terrace.dogFriendly && "Dog-friendly",
    terrace.covered && "Covered",
    terrace.heated && "Heated",
  ].filter(Boolean) as string[];

  const typeStr = terrace.terraceType?.map((tt) => TYPE_LABELS[tt] ?? tt).join(" & ");
  const subtitle = [typeStr ? `${typeStr} terrace` : "Terrace", terrace.cuisineType, `${terrace.neighborhood}, Montréal`]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="min-h-screen bg-background">
        {/* Nav */}
        <nav className="border-b border-border px-5 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All terraces
          </Link>
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none">
              <polygon points="16,1 14,8 18,8" fill="#c45d3e"/>
              <polygon points="16,31 14,24 18,24" fill="#c45d3e"/>
              <polygon points="1,16 8,14 8,18" fill="#c45d3e"/>
              <polygon points="31,16 24,14 24,18" fill="#c45d3e"/>
              <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e"/>
              <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e"/>
              <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e"/>
              <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e"/>
              <circle cx="16" cy="16" r="6" fill="#c45d3e"/>
            </svg>
            <span className="font-display text-sm font-bold tracking-tight group-hover:text-accent transition-colors">
              Terrasse Season
            </span>
          </Link>
        </nav>

        {/* Hero photo */}
        {terrace.photos[0] ? (
          <div className="relative w-full h-64 md:h-[420px]">
            <Image
              src={terrace.photos[0]}
              alt={`${terrace.name} – outdoor terrace in ${terrace.neighborhood}, Montréal`}
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
            {terrace.neighborhood} · Montréal
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-1">
            {terrace.name}
          </h1>
          <p className="text-sm text-foreground/50 mb-3">{subtitle}</p>
          <p className="text-sm text-muted mb-6 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {terrace.address}, Montréal, QC
          </p>

          <p className="text-base text-foreground/80 leading-relaxed mb-4">
            {terrace.description}
          </p>

          {terrace.descriptionFr && (
            <p className="text-sm text-foreground/50 leading-relaxed mb-8 italic">
              {terrace.descriptionFr}
            </p>
          )}

          {!terrace.descriptionFr && <div className="mb-8" />}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {terrace.cuisineType && (
              <InfoItem label="Cuisine" value={terrace.cuisineType} />
            )}
            {terrace.terraceType?.length ? (
              <InfoItem
                label="Type"
                value={terrace.terraceType.map((tt) => TYPE_LABELS[tt] ?? tt).join(", ")}
              />
            ) : null}
            {terrace.capacity ? (
              <InfoItem label="Capacity" value={`${terrace.capacity} seats`} />
            ) : null}
            {terrace.seasonalOpen && (
              <InfoItem label="Season" value={`${terrace.seasonalOpen}${terrace.seasonalClose ? ` – ${terrace.seasonalClose}` : ""}`} />
            )}
          </div>

          {/* Hours */}
          {hoursLines.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-foreground/[0.03] border border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted mb-2.5 font-medium">Hours</p>
              <div className="space-y-1">
                {hoursLines.map((line) => (
                  <p key={line} className="text-sm text-foreground/80">{line}</p>
                ))}
              </div>
            </div>
          )}
          {!hoursLines.length && terrace.openingHours && (
            <div className="mb-6 p-4 rounded-xl bg-foreground/[0.03] border border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">Hours</p>
              <p className="text-sm text-foreground/80">{terrace.openingHours}</p>
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
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Google Maps
            </a>
            {terrace.website && (
              <a
                href={terrace.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors shadow-sm"
              >
                Visit website
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
                Call
              </a>
            )}
          </div>

          <Link
            href={`/?terrace=${terrace.id}`}
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-medium"
          >
            View on map
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border">
      <p className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
