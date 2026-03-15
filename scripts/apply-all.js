// Applies instagram handles and website URLs to terraces.ts
// Run with: node scripts/apply-all.js

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, "../src/data/terraces.ts");

// name -> { instagram?, website? }
const data = {
  // Batch A
  "Terrasse Nelligan": { instagram: "@terrassenelligan" },
  "Terrasse sur l'Auberge": { instagram: "@terrassesurlauberge", website: "https://aubergeduvieuxport.com/terrasse-sur-lauberge/" },
  "Terrasse William Gray": { instagram: "@terrassewilliamgray", website: "https://terrassewilliamgray.com" },
  "Perché": { instagram: "@perchemtl", website: "https://perchemtl.com" },
  "Terrasse Place d'Armes": { instagram: "@terrasseplacedarmes", website: "https://hotelplacedarmes.com/food/terrasse-place-darmes/" },
  "Jardin Nelson": { instagram: "@jardin_nelson", website: "https://jardinnelson.com" },
  "Romies": { instagram: "@romiesmtl", website: "https://romies.ca" },
  "L'Auberge Saint-Gabriel": { instagram: "@aubergesaintgab", website: "https://aubergesaint-gabriel.com" },
  "Jacopo": { instagram: "@jacopo_mtl", website: "https://jacopomtl.com" },
  "Café Il Cortile": { instagram: "@ilcortilemtl", website: "https://cafeilcortile.com" },
  "Gaspar French Brasserie": { instagram: "@gasparmtl", website: "https://gasparmtl.com" },
  "Terrasse Carla": { instagram: "@terrassecarla", website: "https://terrassecarla.com" },
  "Pubjelly": { instagram: "@pubjelly" },
  "Vieux-Port Steakhouse": { instagram: "@vieuxportsteakhouse", website: "https://vieuxportsteakhouse.com" },
  "Wolf & Workman": { instagram: "@wolfandworkman", website: "https://wolfandworkman.com" },
  "Le Polisson": { instagram: "@lepolisson.mtl", website: "https://restolepolisson.com" },
  "Cour Arrière": { instagram: "@courarriere.mtl", website: "https://cour-arriere.com" },
  "Bevo Bar + Pizzeria": { instagram: "@bevopizza", website: "https://bevopizza.com" },
  "Buvette Pastek": { instagram: "@buvettepastek", website: "https://buvettepastek.com" },
  "La Cave à Manger": { instagram: "@lacaveamanger.ca", website: "https://lacaveamanger.ca" },
  "Horizon Rooftop": { instagram: "@pubcartierarms", website: "https://cartierarms.com" },
  "Le Sainte-Élisabeth": { instagram: "@pubsteelisabeth", website: "https://pubsteeli.com" },
  "Maison Boulud": { instagram: "@maisonboulud", website: "https://maisonboulud.com" },
  "Rose Orange": { instagram: "@roseorangemontreal", website: "https://roseorange.ca" },
  "Terrasse Alizé": { instagram: "@terrassealize", website: "https://terrassealize.ca" },
  "Jatoba": { instagram: "@jatobamontreal", website: "https://jatobamontreal.com" },
  "Renoir": { instagram: "@renoirmontreal", website: "https://restaurant-renoir.com" },
  "MARCUS Restaurant + Lounge": { instagram: "@marcus_montreal", website: "https://marcusrestaurant.ca" },
  "Bar Furco": { instagram: "@barfurco", website: "https://barfurco.com" },
  "Ferreira Café": { instagram: "@ferreirarestaurant", website: "https://ferreiracafe.com" },
  // Batch B
  "Escondite": { instagram: "@escondite_mtl", website: "https://escondite.ca" },
  "Papito": { instagram: "@papitorestaurant", website: "https://papitorestaurant.com" },
  "Les Enfants Terribles (Place Ville Marie)": { instagram: "@jesuisunenfantterrible_", website: "https://www.jesuisunenfantterrible.com" },
  "Bivouac": { instagram: "@restaurantbivouac", website: "https://restaurantbivouac.com" },
  "Muze Lounge & Terrasse": { instagram: "@muzemontreal", website: "https://www.muzemontreal.com" },
  "Biiru": { instagram: "@biiru_mtl", website: "https://biiru.ca" },
  "Nacarat": { instagram: "@nacaratmtl", website: "https://www.barnacarat.com" },
  "Belvu": { instagram: "@terrasse.belvu", website: "https://www.terrassebelvu.com" },
  "Café Parvis": { instagram: "@cafe_parvis", website: "https://www.cafeparvis.com" },
  "Pavillon Social Club (SAT)": { instagram: "@pavillon_clubsocial", website: "https://sat.qc.ca/en/pavillon" },
  "Bar George": { instagram: "@bargeorgemtl", website: "https://www.bargeorge.ca" },
  "Sir Winston Churchill Pub": { instagram: "@sirwinstonchurchillpub", website: "https://swcpc.com" },
  "Poincaré Chinatown": { instagram: "@poincarechinatown", website: "https://poincarechinatown.com" },
  "Le Majestique": { instagram: "@lemajestique", website: "https://restobarmajestique.com" },
  "Le Filet": { instagram: "@restaurantlefilet", website: "https://www.lefilet.ca" },
  "Café Santropol": { instagram: "@cafesantropol", website: "https://www.santropol.com" },
  "Khyber Pass": { instagram: "@restaurantkhyberpass" },
  "Le Jardin de Panos": { instagram: "@lejardindepanos", website: "https://www.lejardindepanos.com" },
  "Réservoir": { instagram: "@brasserie_reservoir", website: "https://brasseriereservoir.com" },
  "La Buvette Chez Simone": { instagram: "@buvettechezsimone", website: "https://labuvettechezsimone.com" },
  "Icehouse": { instagram: "@icehousemontreal" },
  "Bistrot La Fabrique": { instagram: "@fabriquemtl", website: "https://www.bistrotlafabrique.com" },
  "Le Rouge Gorge": { instagram: "@rougegorge_mtl", website: "https://www.rougegorge.ca" },
  "Azalea": { instagram: "@azalea.buvette.caviste", website: "https://www.azalearesto.com" },
  "Le Bar Darling": { instagram: "@bar.darling", website: "https://bardarling.com" },
  "Grenade": { instagram: "@bargrenade", website: "https://www.grenadebar.ca" },
  "Plan B": { instagram: "@barplanbmtl", website: "https://www.barplanb.ca" },
  "Casa Del Popolo": { instagram: "@casadelpopolo2", website: "https://casadelpopolo.com" },
  "Café Melbourne": { instagram: "@lecafemelbourne", website: "https://melbournecafemtl.com" },
  // Batch C
  "Turbo Haüs": { instagram: "@turbo_haus", website: "https://www.turbohaus.ca" },
  "Café Olimpico": { instagram: "@cafeolimpico", website: "https://cafe-olimpico-1970.myshopify.com" },
  "Pub Bishop & Bagg": { instagram: "@bishopandbagg", website: "https://www.bishopandbagg.com" },
  "Café Club Social": { website: "https://www.cafeclubsocial.ca" },
  "Vices & Versa": { instagram: "@vicesetversa", website: "https://vicesetversa.com" },
  "Taverne Atlantic": { instagram: "@taverneatlantic", website: "https://www.taverneatlantic.com" },
  "Anemone": { instagram: "@anemone_mtl", website: "https://anemonemtl.com" },
  "Bar Cicchetti": { instagram: "@bar_cicchetti", website: "https://barcicchetti.club" },
  "Dépanneur Le Pick Up": { instagram: "@deplepickup", website: "https://lepickupmtl.com" },
  "WILLS": { instagram: "@wills.beer", website: "https://www.wills.beer" },
  "Pumpui": { instagram: "@pumpuimontreal", website: "https://pumpui.ca" },
  "Damas": { instagram: "@damasrestaurant", website: "https://www.damas.ca" },
  "Leméac": { instagram: "@lemeac", website: "https://www.restaurantlemeac.com" },
  "La Croissanterie Figaro": { instagram: "@lacroissanteriefigaro", website: "https://www.lacroissanteriefigaro.com" },
  "Brasserie Bernard": { instagram: "@brasseriebernard", website: "https://brasseriebernard.com" },
  "Fiorellino Laurier": { instagram: "@fiorellinosnackbar", website: "https://fiorellino.ca" },
  "Provisions Bar à Vin": { instagram: "@provisions.bar.a.vin", website: "https://www.boucherieprovisions.ca" },
  "ALMA": { instagram: "@alma.mtl", website: "https://www.almamontreal.com" },
  "Bar Henrietta": { instagram: "@barhenriettamtl", website: "https://barhenrietta.com" },
  "Rumi": { instagram: "@restaurantrumi", website: "https://www.restaurantrumi.com" },
  "Le Petit Alep Bistro": { instagram: "@le.petit.alep", website: "https://www.restaurantalep.com" },
  "Pizzeria Napoletana": { instagram: "@pizzerianapoletanamtl", website: "https://www.napoletana.com" },
  "Luciano Trattoria": { instagram: "@lucianotrattoriamtl", website: "https://www.lucianotrattoria.com" },
  "Mon Lapin": { instagram: "@vinmonlapin", website: "https://vinmonlapin.com" },
  "Isle de Garde": { instagram: "@isledegarde", website: "https://www.isledegarde.com" },
  "vinvinvin": { instagram: "@barvinvinvin", website: "https://vinvinvin.ca" },
  "Snowbird Tiki Bar": { instagram: "@snowbirdtikibar", website: "https://www.snowbirdtikibar.com" },
  "Marci": { instagram: "@marcisurlaplaza", website: "https://www.marcimtl.ca" },
  "Terrasse Saint-Ambroise": { instagram: "@terrasse_stambroise", website: "https://mcauslan.com/en/terrasse" },
  "Messorem Bracitorium": { instagram: "@messorembracitorium", website: "https://messorem.co" },
  // Batch D (website only)
  "Joe Beef": { website: "https://joebeef.com" },
  "Le Vin Papillon": { website: "https://vinpapillon.com" },
  "Tuck Shop": { website: "https://tuckshop.ca" },
  "Riverside Saint-Henri": { website: "https://www.riversidemtl.com" },
  "Arthurs Nosh Bar": { website: "https://www.arthursmtl.com" },
  "BarBara": { website: "https://www.barbaravin.com" },
  "Stem Bar": { website: "https://www.stem-bar.com" },
  "Candide": { website: "https://www.restaurantcandide.com" },
  "Restaurant Mélisse": { website: "https://www.restaurantmelisse.com" },
  "Mano Cornuto": { website: "https://www.manocornuto.com" },
  "SHAY": { website: "https://shaymtl.com" },
  "Mauvais Garçons": { website: "https://www.restomauvaisgarcons.ca" },
  "Bazart": { website: "https://bazart.ca" },
  "Le Richmond": { website: "https://lerichmond.com" },
  "Canal Lounge": { website: "https://www.canallounge.com" },
  "Hoogan & Beaufort": { website: "https://www.hooganetbeaufort.com" },
  "Verdun Beach": { website: "https://barverdunbeach.com" },
  "Monkland Taverne": { website: "https://monklandtavern.ca" },
  "Terroirs Restaurant": { website: "https://terroirsrestaurant.ca" },
  "June Buvette": { website: "https://www.junebuvette.ca" },
  "Le Butterblume": { website: "https://www.lebutterblume.com" },
  "Moccione Pizza": { website: "https://www.moccionepizza.com" },
  "Les Cavistes": { website: "https://restaurantlescavistes.com" },
  "Bar Renard": { website: "https://bar-renard.com" },
  "Denise": { website: "https://www.restaurantdenise.com" },
  "Marché des Éclusiers": { website: "https://www.marchedeseclusiers.com" },
  "Pub BreWskey": { website: "https://www.brewskey.ca" },
  "Boqueria": { website: "https://restaurantboqueria.ca" },
  "Maggie Oakes": { website: "https://maggieoakes.com" },
  // Batch E (website only)
  "Pincette": { website: "https://pincettemtl.com/en/" },
  "Maison Saint-Paul": { website: "https://maisonsaintpaul.ca/" },
  "Modavie": { website: "https://modavie.com/en/" },
  "Kyo Bar Japonais": { website: "https://kyobar.com/en/" },
  "Pangea": { website: "https://pangeamtl.com/" },
  "La Catrina": { website: "https://restaurantlacatrina.ca/en/" },
  "Terrasse R": { website: "https://rterrasse.com/home/" },
  "Emmanuelle": { website: "https://www.emmanuellelounge.com/home-en" },
  "Le Pois Penché": { website: "https://lepoispenche.com/" },
  "OSMO x MARUSAN": { website: "https://www.marusan.ca/" },
  "Le Balcon": { website: "https://en.lebalcon.ca/" },
  "Brasseurs du Monde": { website: "https://brasseursdumonde.com/en" },
  "Le Saint-Bock": { website: "https://www.saintbock.com/" },
  "Oncle Lee": { website: "https://www.restaurantonclelee.com/" },
  "Café Miracolo": { website: "https://www.cafemiracolo.com/" },
  "La Prunelle": { website: "https://www.restaurantlaprunelle.com/" },
  "Les Rites Berbères": { website: "https://www.ritesberberes.com/" },
  "Rhumerie Barraca": { website: "https://www.barraca.ca/" },
  "Aux Quartiers Belle Gueule": { website: "https://brasseursrj.com/en/quartiers-belle-gueule/" },
  "Café In Gamba (Saint-Viateur)": { website: "https://cafeingamba.com/" },
  "Bar Mamie": { website: "https://www.mamiemamiemamie.com" },
  "Buvette Beaubien": { website: "https://www.buvettebeaubien.com/" },
  "Bar le Vestiaire": { website: "https://www.barlevestiaire.com/" },
  "Café des Habitudes": { website: "https://cafedeshabitudes.co/en" },
  "Café Pista": { website: "https://cafepista.com/en" },
  "Bar Bello": { website: "https://www.barbellomtl.com/" },
  "Café San Gennaro": { website: "https://sangennaro.ca/" },
  "Le Relais Boréale": { website: "https://www.boreale.com/en/relais-boreale-montreal" },
  // Batch F (website only)
  "SAE LOW": { website: "https://saelowmtl.ca" },
  "Buvette Pompette": { website: "https://www.buvettepompette.com" },
  "SUPERNAT": { website: "https://www.supernatmtl.com" },
  "Labarake": { website: "https://labarake.com" },
  "Mignon": { website: "https://www.mignonsteak.com" },
  "Club Social P.S. / Elena Pizza": { website: "https://coffeepizzawine.com" },
  "Brasseur de Montréal": { website: "https://brasseurdemontreal.com/en" },
  "September Surf Café": { website: "https://septembersurf.com" },
  "Memento": { website: "https://brasseriememento.com" },
  "BENELUX (Verdun)": { website: "https://brasseriebenelux.com" },
  "Maison de thé Cha Noir": { website: "https://cha-noir.com/en" },
  "Nikkei": { website: "https://nikkeimtl.com/en" },
  "Arte & Farina": { website: "https://www.artefarina.ca" },
  "Le Boating Club": { website: "https://leboatingclub.com" },
  "Amato": { website: "https://www.restaurantamato.com" },
  "Les Insulaires Microbrasseurs": { website: "https://www.lesinsulaires.ca" },
  "Le Mitoyen": { website: "https://lemitoyen.com" },
  "Chez Vincent": { website: "https://www.chezvincent.ca" },
  "Bravi": { website: "https://www.restaurantbravi.com" },
  "Dirty D": { website: "https://dirtydivebar.com" },
  "Siam Dix30": { website: "https://restaurantsiam.com/en" },
  "Delos Resto-Bar": { website: "https://delosrestobar.com" },
  "Restaurant Le Gourmand": { website: "https://www.restaurantlegourmand.ca" },
  "Jellyfish": { website: "https://www.jellyfishmontreal.com" },
};

let content = readFileSync(filePath, "utf8");
let igApplied = 0, igSkipped = 0, webApplied = 0, webSkipped = 0;

for (const [name, fields] of Object.entries(data)) {
  const namePattern = `name: "${name}"`;
  const nameIdx = content.indexOf(namePattern);
  if (nameIdx === -1) {
    console.warn(`⚠️  Not found: ${name}`);
    continue;
  }

  const blockEnd = content.indexOf("\n  },", nameIdx);
  const blockSlice = () => content.slice(nameIdx, content.indexOf("\n  },", nameIdx));

  // Insert website (before instagram: if present, else before photos:)
  if (fields.website) {
    if (blockSlice().includes("website:")) {
      webSkipped++;
    } else {
      // Insert before instagram: or photos:
      const igIdx = content.indexOf("    instagram:", nameIdx);
      const photosIdx = content.indexOf("    photos:", nameIdx);
      const insertBefore = (igIdx !== -1 && igIdx < blockEnd) ? igIdx : photosIdx;
      content = content.slice(0, insertBefore) + `    website: "${fields.website}",\n` + content.slice(insertBefore);
      console.log(`🌐  ${name} → ${fields.website}`);
      webApplied++;
    }
  }

  // Re-find block after possible website insertion
  const nameIdx2 = content.indexOf(namePattern);
  const blockEnd2 = content.indexOf("\n  },", nameIdx2);

  // Insert instagram (before photos:)
  if (fields.instagram) {
    if (content.slice(nameIdx2, blockEnd2).includes("instagram:")) {
      igSkipped++;
    } else {
      const photosIdx2 = content.indexOf("    photos:", nameIdx2);
      content = content.slice(0, photosIdx2) + `    instagram: "${fields.instagram}",\n` + content.slice(photosIdx2);
      console.log(`📸  ${name} → ${fields.instagram}`);
      igApplied++;
    }
  }
}

writeFileSync(filePath, content, "utf8");
console.log(`\nDone: ${igApplied} instagram added (${igSkipped} already set), ${webApplied} websites added (${webSkipped} already set).`);
