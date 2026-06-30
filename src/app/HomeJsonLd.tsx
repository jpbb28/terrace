import { terraces } from "@/data/terraces";
import { slugify } from "@/lib/utils";

// Homepage-only structured data: the full directory graph (Organization,
// WebSite, CollectionPage, and the ItemList of every terrace). This must NOT
// be rendered site-wide — each terrace already emits its own FoodEstablishment
// + AggregateRating on /terraces/[slug], so injecting the ItemList there too
// makes Google see two aggregate ratings for the same place ("Review has
// multiple aggregate ratings"). Keep it scoped to the homepage routes.
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

export default function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
    />
  );
}
