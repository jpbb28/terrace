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
  title: "Terrace Season – Discover Montréal's Best Terraces & Patios",
  description: `The most complete guide to terraces and patios in Montréal. ${count} spots across 24 neighborhoods — filter by rooftop, dog-friendly, covered, open now, and more.`,
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
    siteName: "Terrace Season",
    type: "website",
    title: "Terrace Season – Montréal's Terrace & Patio Guide",
    description: `${count} terraces and patios across 24 Montréal neighborhoods. Filter by type, features, and open now.`,
    locale: "en_CA",
    alternateLocale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrace Season – Montréal's Terrace & Patio Guide",
    description: `${count} terraces and patios across 24 Montréal neighborhoods. Filter by type, features, and open now.`,
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
        name: "Terrace Season",
        url: "https://terrasseseason.com",
        description:
          `The most complete directory of terraces and patios in Montréal, Québec. ${count} outdoor dining spots across 24 neighborhoods, filterable by type, features, and hours.`,
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
