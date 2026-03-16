export type Block =
  | { t: "p"; text: string }
  | { t: "labeled"; name: string; text: string }
  | { t: "divider" };

export type Post = {
  slug: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  date: string;
  dateFr: string;
  dateIso: string;
  content: Block[];
  contentFr: Block[];
};

export const posts: Post[] = [
  {
    slug: "when-do-montreal-terrasses-open",
    title: "When Do Montréal Terraces Open?",
    titleFr: "Quand ouvrent les terrasses à Montréal?",
    description: "Most terraces start opening in May, some earlier if the weather plays along. Here's what the season actually looks like, month by month, and why September deserves more attention than it gets.",
    descriptionFr: "La plupart des terrasses ouvrent en mai, certaines avant si la météo coopère. Voici à quoi ressemble vraiment la saison, mois par mois, et pourquoi septembre mérite plus d'attention qu'on lui en donne.",
    date: "March 15, 2026",
    dateFr: "15 mars 2026",
    dateIso: "2026-03-15",
    content: [
      { t: "p", text: "Sometime in May. Most places aim for the Victoria Day long weekend, the third Monday of the month, but it's not a hard rule. Some open earlier if the weather cooperates. Some drag their feet into June." },
      { t: "p", text: "But there's a day when it tips. Café owners drag out tables at 7am. Soon enough, every sidewalk on Saint-Laurent has people sitting on it, still wearing jackets, ordering wine at noon. The season has started." },
      { t: "p", text: "The thing about Montréal terrace season that people from warmer places don't understand: it means something here. You've earned it. Every February morning when you scraped ice off your windshield at -25, every March when you thought spring was coming and got another foot of snow. That's the bill. The terrace is how you collect." },
      { t: "p", text: "The season runs longer than you'd think. Heated covered places push well into October. Some technically never close. But the real season is June through September. The season of lingering. Of staying for another drink because why would you go inside." },
      { t: "divider" },
      { t: "labeled", name: "May", text: "The first wave. Most places open sometime this month, with hours that start conservative. Lunch before dinner, dinner before late night. Bring a layer in the evening. The sun drops and the temperature follows, faster than you expect." },
      { t: "labeled", name: "June", text: "This is the good one. Still cool enough to be comfortable, warm enough to stay. The tourists haven't arrived in force yet. You can get a seat somewhere popular without planning your entire evening around it. The city is in that brief collective exhale after winter. Go now, before everyone else figures it out." },
      { t: "labeled", name: "July–August", text: "Peak. You know it the moment you arrive anywhere near a popular rooftop on a Friday at 7pm. Show up by 5 or go late. Things thin out after 9. Make a reservation like an adult or accept the consequences. The food is good, the drinks are cold, the wait is real." },
      { t: "labeled", name: "September", text: "If you're only going to have one perfect terrace month in Montréal, this is it. Warm enough during the day, cool in the evenings, and suddenly you can hear yourself think again. The August crowds vanish. The regulars come back. This is when the city stops performing and starts living again." },
      { t: "labeled", name: "October", text: "Wind-down. Heated and covered spots hold on; most sidewalk and rooftop terraces close somewhere between Thanksgiving and Halloween. Call ahead if you're going somewhere specific. Don't just show up." },
    ],
    contentFr: [
      { t: "p", text: "Quelque part en mai. La plupart des terrasses visent la Fête de la Reine, le troisième lundi du mois, mais c'est pas une règle absolue. Certains ouvrent avant si la météo coopère. D'autres traînent jusqu'en juin." },
      { t: "p", text: "Mais il y a un jour où ça bascule. Les proprios traînent leurs tables à 7h du matin. Et bientôt, les trottoirs de Saint-Laurent sont pleins de monde encore en manteau, qui commandent du vin à midi. On s'en fout. La saison a commencé." },
      { t: "p", text: "Ce que les gens des villes chaudes saisissent pas, c'est ce que ça représente. On l'a gagné. Chaque matin de février à gratter le char à -25, chaque mars où on pensait que c'était fini et on a pris une autre tempête dans la face. C'est la facture. La terrasse, c'est le remboursement." },
      { t: "p", text: "Ça dure plus longtemps qu'on pense. Les endroits couverts et chauffés tiennent jusqu'en octobre. Certains ferment techniquement jamais. Mais la vraie saison, c'est juin à septembre. La saison où on reste pour un autre verre juste parce que rentrer, ça a pas de bon sens." },
      { t: "divider" },
      { t: "labeled", name: "Mai", text: "La première vague. La plupart des endroits ouvrent quelque part dans le mois, avec des heures conservatrices au départ. Dîner avant le souper, souper avant le soir. Prends une veste. Le soleil tombe vite et la température suit." },
      { t: "labeled", name: "Juin", text: "Le bon mois. Assez frais pour être confortable, assez chaud pour rester. Les touristes sont pas encore arrivés en masse. On peut trouver une table quelque part de bien sans planifier toute sa soirée autour. Vas-y maintenant." },
      { t: "labeled", name: "Juillet-août", text: "Le plein été. Tu le sais dès que t'arrives près d'un bon rooftop un vendredi à 19h. Arrive à 17h ou reviens après 21h. Fais une réservation ou assume les conséquences. C'est bon, c'est froid, et l'attente est réelle." },
      { t: "labeled", name: "Septembre", text: "Si t'as le choix d'un seul mois parfait en terrasse à Montréal, c'est celui-là. Chaud le jour, frais le soir, et on peut enfin s'entendre parler. Les foules d'août disparaissent. Les habitués reviennent. La ville recommence à vivre." },
      { t: "labeled", name: "Octobre", text: "La descente. Les spots chauffés et couverts tiennent bon, mais la plupart des terrasses de trottoir et de rooftop ferment quelque part entre l'Action de grâce et l'Halloween. Appelle avant de te déplacer." },
    ],
  },
  {
    slug: "best-rooftop-terrasses-montreal",
    title: "The Best Rooftop Terraces in Montréal",
    titleFr: "Les meilleures terrasses sur les toits à Montréal",
    description: "People from Miami don't understand why Montréalers make such a thing about rooftops. They've never survived a February here.",
    descriptionFr: "Les gens de Miami comprennent pas pourquoi les Montréalais font tout un plat des rooftops. Ils ont jamais survécu à un février ici.",
    date: "March 15, 2026",
    dateFr: "15 mars 2026",
    dateIso: "2026-03-15",
    content: [
      { t: "p", text: "People from Miami or Barcelona don't understand why Montréalers make such a thing about rooftop terraces. They have outdoor drinking 365 days a year. They've been desensitized." },
      { t: "p", text: "We haven't." },
      { t: "p", text: "Six months of winter will do that. You come back to a rooftop in May or June and it hits you in a way that's genuinely difficult to explain to anyone who spent the winter somewhere reasonable. The St. Lawrence out there. The city below you. A cold beer. The feeling that you made it." },
      { t: "p", text: "The rooftop scene here is smaller than the city's overall terrace culture. Most outdoor drinking in Montréal happens at street level, which is actually how it should be, which is actually better. But there are good options if you know what you're looking for." },
      { t: "divider" },
      { t: "labeled", name: "The hotel rooftops", text: "Old Montréal has a cluster of these attached to boutique hotels. Cocktails, good views, polished service. They tend toward the upscale end, which makes them a great call for a special occasion, out-of-town guests, or when someone else is paying." },
      { t: "labeled", name: "The converted rooftops", text: "Bars and restaurants that took a building top and turned it into something real, with no particular effort to make it look designed. String lights, mismatched furniture, a bar that works. These places tend to have better prices and crowds that actually live here." },
      { t: "labeled", name: "The ones you have to find", text: "A terrace above a Plateau restaurant that doesn't advertise itself. A rooftop in the Latin Quarter that fits maybe forty people and has been there for years without a PR campaign. These are the ones worth the effort." },
      { t: "divider" },
      { t: "p", text: "Practical things: arrive earlier than you think necessary. By 7pm on a Friday in July, most good rooftops have a wait. Get there at 5, or make a reservation. Some places take them, some don't. Worth a call." },
      { t: "p", text: "One more thing. It's windier up there than it looks from the street. Every time. Bring something for your shoulders or spend the evening cold and annoyed at yourself. Your choice." },
    ],
    contentFr: [
      { t: "p", text: "Les gens de Miami ou Barcelone comprennent pas pourquoi on fait tout un plat des rooftops. Eux, ils boivent dehors à l'année. Ils ont développé une indifférence." },
      { t: "p", text: "Pas nous." },
      { t: "p", text: "Six mois d'hiver, ça change quelque chose. Tu reviens sur un rooftop en mai et ça te rentre dedans d'une façon impossible à expliquer à quelqu'un qui a passé son hiver quelque part de raisonnable. Le Saint-Laurent au loin. La ville en dessous. Une bière froide. Le sentiment que t'as passé à travers." },
      { t: "p", text: "Les rooftops, c'est une partie plus petite de la scène de terrasse à Montréal. La plupart du boire dehors se passe au niveau de la rue, ce qui est en fait mieux comme ça. Mais il y a de bonnes options si tu sais quoi chercher." },
      { t: "divider" },
      { t: "labeled", name: "Les rooftops d'hôtel", text: "Le Vieux-Montréal en a une grappe, attachés à des hôtels boutique. Cocktails, belles vues, service soigné. Haut de gamme, donc parfait pour une occasion spéciale, des invités de l'extérieur, ou quand quelqu'un d'autre règle l'addition." },
      { t: "labeled", name: "Les rooftops convertis", text: "Des bars et restos qui ont pris un toit ordinaire et en ont fait quelque chose de réel, sans chercher à faire designé. Lumières string, mobilier dépareillé, un bar qui fonctionne. Meilleurs prix, monde qui vit ici." },
      { t: "labeled", name: "Ceux qu'il faut trouver", text: "Une terrasse au-dessus d'un resto du Plateau qui se publicise pas. Un rooftop dans le Quartier latin pour quarante personnes, là depuis des années sans relations publiques. Ceux-là valent l'effort." },
      { t: "divider" },
      { t: "p", text: "Arrive plus tôt que tu penses nécessaire. À 19h un vendredi de juillet, les bons rooftops ont une file. Arrive à 17h ou fais une réservation. Certains en prennent, d'autres pas. Ça vaut un coup de fil." },
      { t: "p", text: "Dernière chose. C'est toujours plus venteux en haut que ça en a l'air depuis la rue. Apporte quelque chose pour les épaules ou passe ta soirée à geler et à te blâmer." },
    ],
  },
  {
    slug: "dog-friendly-terrasses-montreal",
    title: "Dog-Friendly Terraces in Montréal",
    titleFr: "Les terrasses dog-friendly à Montréal",
    description: "Montréal has always been a dog city. The terrace culture has caught up. A practical guide to where you can actually go.",
    descriptionFr: "Montréal a toujours été une ville de chiens. La culture de terrasse a rattrapé. Guide pratique pour savoir où aller vraiment.",
    date: "March 15, 2026",
    dateFr: "15 mars 2026",
    dateIso: "2026-03-15",
    content: [
      { t: "p", text: "Montréal has always been a dog city. Walk any street in the Plateau on a Saturday morning and count. The density is remarkable. People here have dogs the way other cities have cars. A fundamental part of how they move through the world." },
      { t: "p", text: "The terrace culture has caught up. More places now treat dogs as actual guests rather than things to be managed until someone complains. Water bowl at the door. Staff who stop to say hello before taking your order. You can tell the difference between a place that has a dogs-allowed policy and a place that actually likes dogs." },
      { t: "p", text: "The rule in Québec: dogs can't go inside food establishments. Health regulation, not negotiable. Terrace spaces are outside, and establishments can allow dogs there as long as they stay out. Most places that welcome dogs have figured out what this looks like in practice. The dog stays outside. That's the deal." },
      { t: "divider" },
      { t: "p", text: "A water bowl near the entrance is a real signal. It means they've thought about this. Low or no barriers are better than high-walled patios where your dog can't see anything and starts climbing the furniture. In July and August, find shade. Pavement heats up fast and dogs overheat faster than you'd think." },
      { t: "p", text: "For neighbourhoods: the Plateau and Mile End are the obvious circuit. Dense, walkable, generally relaxed about dogs. Saint-Henri and Little Burgundy have gotten better as their restaurant scenes have matured. Old Montréal is inconsistent. Some places are genuinely welcoming, others don't want the complication on a busy tourist afternoon. I don't blame them. But I also don't go back." },
      { t: "p", text: "The dog-friendly filter on this site exists, but the data is thin. Most restaurants don't publish their dog policy anywhere, which means we're largely dependent on people who've actually been. If you know a spot that welcomes dogs, use the Edit button on that terrace's page to mark it. That's how this becomes useful." },
    ],
    contentFr: [
      { t: "p", text: "Montréal est une ville de chiens. Prends n'importe quelle rue dans le Plateau un samedi matin et compte. La densité est frappante. Le monde ici a des chiens comme d'autres villes ont des voitures." },
      { t: "p", text: "Ça commence à se sentir dans les terrasses aussi. Plus d'endroits traitent les chiens comme de vrais clients plutôt que comme un problème à gérer avant que quelqu'un se plaigne. Bol d'eau à l'entrée. Personnel qui dit bonjour au chien en premier. On fait vite la différence entre un endroit qui tolère les chiens et un endroit qui les aime." },
      { t: "p", text: "Au Québec, les chiens peuvent pas entrer dans les établissements alimentaires. C'est réglementaire, pas négociable. Les terrasses sont dehors, et les restos peuvent les y accueillir tant qu'ils restent à l'extérieur. La plupart des endroits dog-friendly ont compris comment ça marche. Le chien reste dehors. C'est le deal." },
      { t: "divider" },
      { t: "p", text: "Un bol d'eau près de l'entrée, c'est un signe. Ça veut dire qu'on y a pensé. Les barrières basses marchent mieux que les patios fermés où le chien voit rien et commence à grimper. En plein été, cherche de l'ombre. L'asphalte chauffe vite et les chiens surchauffent plus rapidement qu'on pense." },
      { t: "p", text: "Pour les quartiers : le Plateau et le Mile End sont le circuit de base. Dense, marchable, généralement cool avec les chiens. Saint-Henri et Petite-Bourgogne se sont améliorés. Le Vieux est inégal. Certains endroits sont vraiment accueillants, d'autres veulent pas la complication en pleine terrasse de touristes. On les comprend. On y retourne pas." },
      { t: "p", text: "Le filtre dog-friendly sur ce site existe, mais les données sont minces. La plupart des restos publient pas leur politique nulle part. On dépend des gens qui y vont. Si tu sais qu'un endroit est dog-friendly, utilise le bouton Modifier sur la page de cette terrasse. C'est comme ça que ça devient utile." },
    ],
  },
  {
    slug: "montreal-terrasses-by-neighbourhood",
    title: "Montréal Terraces by Neighbourhood",
    titleFr: "Les terrasses de Montréal par quartier",
    description: "Where the terrace culture actually lives, neighbourhood by neighbourhood. Including the honest version of what each one is like.",
    descriptionFr: "Là où la culture de terrasse vit vraiment, quartier par quartier. La version honnête.",
    date: "March 15, 2026",
    dateFr: "15 mars 2026",
    dateIso: "2026-03-15",
    content: [
      { t: "p", text: "Montréal's terrace culture is concentrated. It stacks up in a few places and disperses quickly beyond them. You can waste a lot of time looking for a good terrace in the wrong neighbourhood. Here's the honest version." },
      { t: "divider" },
      { t: "labeled", name: "Plateau-Mont-Royal", text: "The baseline. More terraces per block than anywhere else in the city, ranging from classic bistro sidewalk tables to backyard spaces with fire pits. Saint-Laurent, Mont-Royal, Rachel. This is where you take people when they're visiting and want to understand what Montréal outdoor drinking actually looks like. It's also the most crowded, and you can feel it. Both things are true." },
      { t: "labeled", name: "Mile End", text: "A different energy than the Plateau. The terrace scene here is younger and less concerned with what things look like. Natural wine on a wooden bench is more common than tablecloths and a printed menu. Bernard and Saint-Viateur. If you want the density of the Plateau but with more room to breathe, this is closer to what you're after." },
      { t: "labeled", name: "Old Montréal", text: "Some of the best terrace views in the city. Hotel rooftops, canal-side spots, cobblestone terraces with the architecture right there. The quieter streets away from Place Jacques-Cartier have the best options. The river is close. Worth it if you pick carefully." },
      { t: "labeled", name: "Griffintown", text: "Grown up fast. The canal corridor now has a real run of solid spots, and the neighbourhood has enough density to make a proper evening out of it. Good option if you want something a bit different from the Plateau circuit." },
      { t: "labeled", name: "Saint-Henri and Little Burgundy", text: "Both have developed real restaurant scenes over the past decade, which is recent and worth acknowledging. Less crowded than the Plateau, more neighbourhood feel. The stretch of Notre-Dame Ouest from Atwater heading west is worth walking on a summer evening. Don't tell too many people." },
      { t: "labeled", name: "Downtown", text: "More spread out than the other neighbourhoods, which changes how it feels. The best spots are hotel rooftops with views of the mountain, and a handful of solid terraces around Peel and the quieter streets near McGill. Crescent Street exists and is what it is. Worth it if you know where you're going." },
      { t: "labeled", name: "Verdun", text: "Consistently underrated. Wellington Street has a run of genuinely good terraces. Honest prices, local crowd, seats available without a fight. The river is close. Go to Verdun." },
    ],
    contentFr: [
      { t: "p", text: "La terrasse à Montréal, c'est concentré. Ça s'empile dans quelques quartiers et se disperse vite en dehors. On peut perdre beaucoup de temps à chercher dans le mauvais coin. Voici ce que c'est vraiment." },
      { t: "divider" },
      { t: "labeled", name: "Plateau-Mont-Royal", text: "C'est le point de référence. Plus de terrasses par bloc que n'importe où en ville, des tables de trottoir de bistro aux cours arrière avec foyers. Saint-Laurent, Mont-Royal, Rachel. C'est là qu'on amène les visiteurs qui veulent comprendre ce que boire dehors à Montréal veut vraiment dire. C'est aussi le plus achalandé, et ça se ressent. Les deux sont vrais en même temps." },
      { t: "labeled", name: "Mile End", text: "Autre chose que le Plateau. La scène est plus jeune, moins préoccupée par l'image. Du vin naturel sur un banc en bois, c'est plus courant que des nappes et un menu imprimé. Bernard et Saint-Viateur. Si tu veux la densité du Plateau mais avec plus d'air, c'est par là." },
      { t: "labeled", name: "Vieux-Montréal", text: "Certaines des meilleures vues de la ville. Rooftops d'hôtel, terrasses sur les pavés avec l'architecture juste là, spots en bord d'eau. Les rues plus calmes, loin de la Place Jacques-Cartier, ont les meilleures options. Le fleuve est proche. Ça vaut la peine si on choisit bien." },
      { t: "labeled", name: "Griffintown", text: "Le quartier a grandi vite. Le corridor du canal a maintenant une vraie suite de bons endroits, et il y a assez de densité pour en faire une vraie soirée. Bonne option si tu veux sortir du circuit habituel." },
      { t: "labeled", name: "Saint-Henri et Petite-Bourgogne", text: "Les deux ont développé de vraies scènes de restos sur la dernière décennie. Moins achalandé que le Plateau, plus de feeling de quartier. Le tronçon de Notre-Dame Ouest entre Atwater et plus à l'ouest vaut la peine d'être marché un soir d'été. On garde ça pour soi." },
      { t: "labeled", name: "Centre-Ville", text: "Pas un quartier de terrasses au sens naturel du terme, mais il y a des bons coups. Les rooftops d'hôtel donnent sur la montagne et ça change tout. Quelques adresses solides autour de Peel et dans les rues calmes près de McGill. La rue Crescent, c'est autre chose. Venir avec une idée précise en tête." },
      { t: "labeled", name: "Verdun", text: "Sous-estimé depuis toujours. La rue Wellington a une vraie suite de bonnes terrasses. Prix honnêtes, clientèle locale, des places disponibles sans se battre. Le fleuve est à deux pas. Allez à Verdun." },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
