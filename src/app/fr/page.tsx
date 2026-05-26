import type { Metadata } from "next";
import Home from "@/app/page";

export const metadata: Metadata = {
  title:
    "Meilleures terrasses, patios et rooftops à Montréal | Terrasse Season",
  description:
    "Le répertoire le plus complet des terrasses et patios à Montréal. Des centaines d'adresses dans 24 quartiers — filtrez par rooftop, chien accepté, couvert, ouvert maintenant et plus.",
  alternates: {
    canonical: "https://terrasseseason.com/fr",
    languages: {
      "en-CA": "https://terrasseseason.com",
      "fr-CA": "https://terrasseseason.com/fr",
      "x-default": "https://terrasseseason.com",
    },
  },
  openGraph: {
    url: "https://terrasseseason.com/fr",
    siteName: "Terrasse Season",
    type: "website",
    title: "Terrasse Season – Le guide des terrasses de Montréal",
    description:
      "Le répertoire le plus complet des terrasses et patios à Montréal — filtrez par rooftop, chien accepté, couvert, ouvert maintenant et plus.",
    locale: "fr_CA",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Terrasse Season – Le guide des terrasses de Montréal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrasse Season – Le guide des terrasses de Montréal",
    description:
      "Le répertoire le plus complet des terrasses et patios à Montréal.",
    images: ["/og.png"],
  },
};

// Renders the same interactive home app; the /fr layout's French provider makes
// every child component render in French.
export default function FrenchHome() {
  return <Home />;
}
