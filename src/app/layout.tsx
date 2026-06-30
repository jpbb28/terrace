import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/lib/LanguageContext";
import { FavoritesProvider } from "@/lib/favorites";
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

const lora = Lora({
  variable: "--font-lora",
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
    languages: {
      "en-CA": "https://terrasseseason.com",
      "fr-CA": "https://terrasseseason.com/fr",
      "x-default": "https://terrasseseason.com",
    },
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
        url: "/og.png",
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
    images: ["/og.png"],
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
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} ${lora.variable} antialiased`}
      >
        <ErrorBoundary>
          <LanguageProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </LanguageProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
