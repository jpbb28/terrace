import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { LanguageProvider } from "@/lib/LanguageContext";
import { terraces } from "@/data/terraces";
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

const count = terraces.length;

export const metadata: Metadata = {
  metadataBase: new URL("https://terrasseseason.com"),
  title: "Terrasse Season – Discover Montréal's Best Terraces & Patios",
  description: "The most complete guide to terraces and patios in Montréal. Hundreds of spots across 24 neighborhoods — filter by rooftop, dog-friendly, covered, open now, and more.",
  keywords: [
    "Montreal terraces",
    "Montreal patios",
    "terrasse Montréal",
    "rooftop bar Montreal",
    "patio restaurant Montreal",
    "outdoor dining Montreal",
    "dog friendly patio Montreal",
    "terrace season Montreal",
  ],
  alternates: {
    canonical: "https://terrasseseason.com",
  },
  openGraph: {
    url: "https://terrasseseason.com",
    siteName: "Terrasse Season",
    type: "website",
    title: "Terrasse Season – Montréal's Essential Terrace Guide",
    description: "The most complete guide to terraces and patios in Montréal — filter by rooftop, dog-friendly, covered, open now, and more.",
    locale: "en_CA",
    alternateLocale: "fr_CA",
    images: [
      {
        url: "/og-v2.png",
        width: 1536,
        height: 1024,
        alt: "Terrasse Season – Montréal's Essential Terrace Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrasse Season – Montréal's Essential Terrace Guide",
    description: "The most complete guide to terraces and patios in Montréal — filter by rooftop, dog-friendly, covered, open now, and more.",
    images: ["/og-v2.png"],
  },
};

function buildJsonLd() {
  const itemListElement = terraces.map((terrace, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "FoodEstablishment",
      name: terrace.name,
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
      ...(terrace.cuisineType && { servesCuisine: terrace.cuisineType }),
      ...(terrace.website && { url: terrace.website }),
      description: terrace.description,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://terrasseseason.com/#website",
        name: "Terrasse Season",
        url: "https://terrasseseason.com",
        description:
          "The most complete directory of terraces and patios in Montréal, Québec. Hundreds of outdoor dining spots across 24 neighborhoods, filterable by type, features, and hours.",
        inLanguage: ["en", "fr"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://terrasseseason.com/?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "CollectionPage",
        "@id": "https://terrasseseason.com/#collection",
        name: "All Montréal Terraces and Patios",
        url: "https://terrasseseason.com",
        description: `Directory of ${terraces.length} terraces and patios in Montréal, Québec, covering neighborhoods including Plateau-Mont-Royal, Old Montreal, Mile End, Griffintown, Little Italy, Saint-Henri, Verdun, Rosemont, Downtown, and more.`,
        mainEntity: {
          "@type": "ItemList",
          name: "Montréal Terraces and Patios",
          numberOfItems: terraces.length,
          itemListElement,
        },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
        />
      </head>
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
