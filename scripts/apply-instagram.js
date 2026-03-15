// Script to inject instagram handles into terraces.ts
// Run with: node scripts/apply-instagram.js

import { readFileSync, writeFileSync } from "fs";

const handles = {
  "Joe Beef": "@joebeef",
  "Le Vin Papillon": "@vinpapillon",
  "Tuck Shop": "@tuckshopmtl",
  "Riverside Saint-Henri": "@riversidemtl",
  "Arthurs Nosh Bar": "@arthursmtl",
  "BarBara": "@barbaravin_",
  "Stem Bar": "@stem_bar",
  "Candide": "@restaurant_candide",
  "Restaurant Mélisse": "@restaurant.melisse",
  "Mano Cornuto": "@manocornuto.mtl",
  "SHAY": "@shaygriffintown",
  "Mauvais Garçons": "@restomauvaisgarcons",
  "Bazart": "@bazartmontreal",
  "Le Richmond": "@restaurantlerichmond",
  "Canal Lounge": "@canallounge",
  "Hoogan & Beaufort": "@hooganetbeaufort",
  "Verdun Beach": "@barverdunbeach",
  "Monkland Taverne": "@monklandtaverne",
  "Terroirs Restaurant": "@terroirs.restaurant",
  "June Buvette": "@junebuvette",
  "Le Butterblume": "@lebutterblume_mtl",
  "Moccione Pizza": "@moccione.pizza",
  "Les Cavistes": "@lescavistes",
  "Moqueur": "@moqueur.mtl",
  "Bar Renard": "@bar.renard",
  "Denise": "@cafedenise",
  "Marché des Éclusiers": "@marcheeclusiers",
  "Pub BreWskey": "@pubbrewskey",
  "Boqueria": "@boqueria_mtl",
  "Maggie Oakes": "@maggieoakesmtl",
  "Pincette": "@pincettemtl",
  "Maison Saint-Paul": "@maisonsaintpaul",
  "Modavie": "@modaviemtl",
  "Kyo Bar Japonais": "@kyobarjaponais",
  "Pangea": "@pangea.mtl",
  "La Catrina": "@lacatrina_mtl",
  "Terrasse R": "@terrassermontreal",
  "Emmanuelle": "@emmanuelleloungemtl",
  "Ciel Rose": "@terrassecielrose",
  "Le Pois Penché": "@lepoispenche",
  "OSMO x MARUSAN": "@osmo_x_marusan",
  "Le Balcon": "@lebalconcabaret",
  "Brasseurs du Monde": "@brasseursdumonde",
  "Le Saint-Bock": "@lesaintbock",
  "Oncle Lee": "@oncleleemtl",
  "Café Miracolo": "@cafe_miracolo",
  "La Prunelle": "@restaurant_la_prunelle",
  "Rhumerie Barraca": "@barracarhum",
  "Aux Quartiers Belle Gueule": "@auxquartiersbellegueule",
  "Café In Gamba (Saint-Viateur)": "@cafeingamba",
  "Bar Mamie": "@barmamie",
  "Buvette Beaubien": "@buvette_beaubien",
  "Bar le Vestiaire": "@bar_le_vestiaire_bar_a_bieres",
  "Café des Habitudes": "@cafedeshabitudes",
  "Café Pista": "@cafepista",
  "Fleurimont Café & Vin": "@cafefleurimont",
  "Bar Bello": "@barbellomtl",
  "Café San Gennaro": "@sangennaromtl",
  "Le Relais Boréale": "@relaisboreale.mtl",
  "SAE LOW": "@saelow_mtl",
  "Buvette Pompette": "@buvettepompette",
  "Pub Arya": "@pub_arya",
  "SUPERNAT": "@supernatmtl",
  "Labarake": "@labarake",
  "Mignon": "@mignonsteak",
  "Club Social P.S. / Elena Pizza": "@elenamontreal",
  "Brasseur de Montréal": "@brasseurmtl",
  "September Surf Café": "@september_surf",
  "Pub Burgundy Lion": "@burgundylion",
  "Memento": "@memento_mtl",
  "BENELUX (Verdun)": "@benelux_brasserieartisanale",
  "Maison de thé Cha Noir": "@maisondethe.chanoir",
  "Nikkei": "@nikkei_mtl",
  "Arte & Farina": "@artefarina",
  "Le Boating Club": "@leboatingclub",
  "Amato": "@restaurant_amato",
  "Les Insulaires Microbrasseurs": "@lesinsulairesmicrobrasseurs",
  "Le Mitoyen": "@restaurant.le.mitoyen",
  "Chez Vincent": "@chezvincent06",
  "Bravi": "@restaurantbravi",
  "Dirty D": "@dirtydivebar",
  "Siam Dix30": "@siamrestothai",
  "Annie's Sur-le-Lac": "@annies_sur_le_lac",
  "Olé Tapas": "@oletapasmtl",
  "Delos Resto-Bar": "@restaurant.delos",
  "Ye Olde Orchard Pub & Grill": "@yoopub",
  "Lou's Pointe-Claire": "@louspointeclaire",
  "Bernies Pizza Martini Bar": "@berniespizzamartinibar",
  "Restaurant Le Gourmand": "@restaurantlegourmand",
  "Seasalt": "@seasaltmtl",
  "Enoteca Monza Pizzeria Moderna – Downtown": "@enotecamonza",
  "Enoteca Monza Pizzeria Moderna – Sherbrooke Est": "@enotecamonza",
  "Enoteca Monza Pizzeria Moderna – Brossard": "@enotecamonza",
  "Jellyfish": "@jellyfishmontreal",
};

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, "../src/data/terraces.ts");
let content = readFileSync(filePath, "utf8");

let applied = 0;
let skipped = 0;

for (const [name, handle] of Object.entries(handles)) {
  // Find the terrace block by name and insert instagram before photos:
  // We look for: name: "X", ... photos: (possibly with website/phone in between)
  // Strategy: find `name: "X"` then find the next `photos:` in that block and insert before it
  const namePattern = `name: "${name}"`;
  const nameIdx = content.indexOf(namePattern);
  if (nameIdx === -1) {
    console.warn(`⚠️  Not found: ${name}`);
    skipped++;
    continue;
  }

  // Check if instagram already set for this entry
  const blockEnd = content.indexOf("\n  },", nameIdx);
  const blockSlice = content.slice(nameIdx, blockEnd);
  if (blockSlice.includes("instagram:")) {
    console.log(`✓  Already set: ${name}`);
    skipped++;
    continue;
  }

  // Find `photos:` within this block and insert instagram line before it
  const photosIdx = content.indexOf("    photos:", nameIdx);
  if (photosIdx === -1 || photosIdx > blockEnd) {
    console.warn(`⚠️  No photos field found for: ${name}`);
    skipped++;
    continue;
  }

  const insertLine = `    instagram: "${handle}",\n`;
  content = content.slice(0, photosIdx) + insertLine + content.slice(photosIdx);
  console.log(`✅  ${name} → ${handle}`);
  applied++;
}

writeFileSync(filePath, content, "utf8");
console.log(`\nDone: ${applied} applied, ${skipped} skipped.`);
