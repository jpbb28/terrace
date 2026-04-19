import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/lib/LanguageContext";
import { terraces } from "@/data/terraces";
import { slugify } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://terrasseseason.com"),
  title: "Best Terraces, Patios & Rooftops in Montréal | Terrasse Season",
  description:
    "The most complete guide to terraces and patios in Montréal. Hundreds of spots across 24 neighborhoods — filter by rooftop, dog-friendly, covered, open now, and more.",
  keywords: [
    // terrace / terrasse
    "Montreal terraces",
    "terraces Montreal",
    "Montreal terrace",
    "terrace Montreal",
    "terrasse Montréal",
    "terrasses Montréal",
    "Montréal terrasse",
    "Montréal terrasses",
    // patio
    "Montreal patios",
    "patios Montreal",
    "Montreal patio",
    "patio Montreal",
    // rooftop
    "rooftop bar Montreal",
    "rooftop bars Montreal",
    "Montreal rooftop bar",
    "Montreal rooftop bars",
    "rooftop terrace Montreal",
    "rooftop terraces Montreal",
    "rooftop terrasse Montreal",
    "rooftop terrasses Montreal",
    // patio restaurant
    "patio restaurant Montreal",
    "restaurant patio Montreal",
    "Montreal restaurant patio",
    "Montreal patio restaurant",
    // outdoor dining
    "outdoor dining Montreal",
    "Montreal outdoor dining",
    "outdoor terrace Montreal",
    "outdoor terrasse Montreal",
    "outdoor restaurant Montreal",
    // dog friendly
    "dog friendly patio Montreal",
    "dog friendly terrace Montreal",
    "dog friendly terrasse Montreal",
    "Montreal dog friendly patio",
    "pet friendly patio Montreal",
    "pet friendly terrace Montreal",
    "chien terrasse Montréal",
    // terrace season
    "terrace season Montreal",
    "Montreal terrace season",
    "terrasse season Montreal",
    "Montreal terrasse season",
    "saison terrasse Montréal",
  ],
  alternates: {
    canonical: "https://terrasseseason.com",
  },
  openGraph: {
    url: "https://terrasseseason.com",
    siteName: "Terrasse Season",
    type: "website",
    title: "Terrasse Season – Montréal's Essential Terrace Guide",
    description:
      "The most complete guide to terraces and patios in Montréal — filter by rooftop, dog-friendly, covered, open now, and more.",
    locale: "en_CA",
    images: [
      {
        url: "/og-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Terrasse Season – Montréal's Essential Terrace Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrasse Season – Montréal's Essential Terrace Guide",
    description:
      "The most complete guide to terraces and patios in Montréal — filter by rooftop, dog-friendly, covered, open now, and more.",
    images: ["/og-v2.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    title: "Terrasse Season",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#c45d3e",
};

function buildJsonLd() {
  const BASE = "https://terrasseseason.com";

  const itemListElement = terraces.map((terrace, index) => {
    const terraceId = `${BASE}/#terrace-${terrace.id}`;
    const terraceUrl = `${BASE}/terraces/${slugify(terrace.name)}`;

    const item: Record<string, unknown> = {
      "@type": "FoodEstablishment",
      "@id": terraceId,
      name: terrace.name,
      url: terraceUrl,
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
    };

    if (terrace.photos.length > 0) {
      item.image = `${BASE}${terrace.photos[0]}`;
    }
    if (terrace.cuisineType) {
      item.servesCuisine = terrace.cuisineType;
    }
    if (terrace.googleRating && terrace.googleReviewCount) {
      item.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: terrace.googleRating,
        reviewCount: terrace.googleReviewCount,
        bestRating: 5,
        worstRating: 1,
      };
    }
    if (terrace.website) {
      item.sameAs = terrace.website;
    }

    return {
      "@type": "ListItem",
      position: index + 1,
      url: terraceUrl,
      item,
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE}/#organization`,
        name: "Terrasse Season",
        url: BASE,
        logo: {
          "@type": "ImageObject",
          url: `${BASE}/icon-192x192.png`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        name: "Terrasse Season",
        url: BASE,
        description:
          "The most complete directory of terraces and patios in Montréal, Québec. Hundreds of outdoor dining spots across 24 neighborhoods, filterable by type, features, and hours.",
        inLanguage: ["en", "fr"],
        publisher: { "@id": `${BASE}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE}/#collection`,
        name: "Best Terraces, Patios & Rooftops in Montréal",
        url: BASE,
        description: `The most complete guide to all ${terraces.length} terraces, rooftops, and patios in Montréal, Québec — covering Plateau-Mont-Royal, Old Montréal, Mile End, Griffintown, Little Italy, Saint-Henri, Verdun, Rosemont, Downtown, and more.`,
        dateModified: new Date().toISOString(),
        isPartOf: { "@id": `${BASE}/#website` },
        publisher: { "@id": `${BASE}/#organization` },
        inLanguage: ["en", "fr"],
      },
      {
        "@type": "ItemList",
        "@id": `${BASE}/#terrace-list`,
        name: "Best Terraces, Rooftops, and Patios in Montréal",
        description: `A curated directory of ${terraces.length} outdoor dining and drinking spots across Montréal — rooftops, sidewalk terraces, courtyards, and patios.`,
        url: BASE,
        numberOfItems: terraces.length,
        itemListOrder: "https://schema.org/ItemListUnordered",
        itemListElement,
      },
    ],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://mnrpyixjrjoqiecfsibg.supabase.co"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
        />
      </head>
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        <ErrorBoundary>
          <LanguageProvider>{children}</LanguageProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
