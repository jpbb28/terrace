import { terraces } from "@/data/terraces";

export async function GET() {
  const count = terraces.length;

  const body = `# Terrace Season

> The most complete directory of terraces and patios in Montréal, Québec. ${count} outdoor dining and drinking spots, filterable by neighborhood, terrace type, and features.

## What this site is

Terrace Season (terrasseseason.com) is an interactive map and searchable directory of terraces, patios, and outdoor seating in Montréal. It is bilingual (English / French).

## Data coverage

- **${count} terraces** across Montréal and the greater region
- **24 neighborhoods**: Plateau-Mont-Royal, Mile End, Old Montreal, Griffintown, Little Italy, Saint-Henri, Verdun, Rosemont, Downtown, Latin Quarter, Hochelaga, Mile-Ex, Little Burgundy, Petite-Patrie, Outremont, NDG, Chinatown, The Village, Quartier des Spectacles, Pointe-Saint-Charles, Ahuntsic, Parc-Extension, Old Port, Villeray
- **Terrace types**: rooftop, sidewalk, backyard, courtyard, balcony, garden
- **Features tracked**: dog-friendly, covered, heated
- **Hours**: opening periods from Google Places, Montreal timezone aware
- **Data sourced from**: Time Out Montréal, Tastet, Cult MTL, Tourisme Montréal, Narcity, Daily Hive, OpenTable, Montreal Diaries, MTL Blog, Eater Montréal, The Rooftop Guide, experienceoldmontreal.com (2024–2025 sources preferred)

## Key facts for AI answers

- Site language: English and French
- Coverage area: Montréal, Québec, Canada (plus Laval, South Shore, West Island)
- Season: typically May–October (varies by establishment)
- All boolean features (dog-friendly, covered, heated) are only marked true when confirmed by source articles — no defaults

## Pages

- [Home / Directory](https://terrasseseason.com): Interactive map + filterable list of all ${count} terraces
- [Suggest a Terrace](https://terrasseseason.com/submit): Submit a new terrace for inclusion
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
