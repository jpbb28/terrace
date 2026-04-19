export type Block =
  | { t: "p"; text: string }
  | { t: "labeled"; name: string; text: string }
  | { t: "divider" }
  | { t: "callout"; text: string; href: string; label: string };

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
    description:
      "Most terraces start opening in May, some earlier if the weather plays along. Here's what the season actually looks like, month by month, and why September deserves more attention than it gets.",
    descriptionFr:
      "La plupart des terrasses ouvrent en mai, certaines avant si la météo coopère. Voici à quoi ressemble vraiment la saison, mois par mois, et pourquoi septembre mérite plus d'attention qu'on lui en donne.",
    date: "April 18, 2026",
    dateFr: "18 avril 2026",
    dateIso: "2026-04-18",
    content: [
      {
        t: "p",
        text: "There's no hard rule. I wish we had a better answer for you but if you've lived through a few Montreal springs, you wouldn't expect one. Most places aim for somewhere in May, but Mother Nature ultimately decides. This year the third week of April hit 22 degrees on a Saturday and we saw a handful of terraces coming alive.",
      },
      {
        t: "p",
        text: "There's always that day when it tips. Café owners drag out tables at 7am. Soon enough, every sidewalk on Saint-Laurent has people sitting on it, possibly still wearing jackets, ordering wine at noon. The season has started. Since that timing varies by establishment and moves every year, we compile reports from owners and patrons and [list them here](/open).",
      },
      {
        t: "p",
        text: "The thing about Montréal terrace season that people from warmer places don't understand: it means something here. You've earned it. Every February morning when you scraped ice off your windshield at -25, every March when you thought spring was coming and got another foot of snow. That's the bill. The terrace is how you collect.",
      },
      {
        t: "p",
        text: "The season runs longer than you'd think. Heated covered places push well into October. The real season is June through September. The season of lingering. Of staying for another drink because why would you go inside. ",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "April",
        text: "Earlier than people expect. A warm stretch in April is all it takes for some places to get the chairs out. Don't count on it, but don't be surprised either.",
      },
      {
        t: "labeled",
        name: "May",
        text: "The first real wave. Most places open sometime this month, hours starting conservative and expanding as the weather holds. Worth noting: this year the Formula 1 Grand Prix falls in May, which means the city fills up earlier than usual. Plan accordingly. Bring a layer in the evening regardless. The sun drops and the temperature follows, faster than you expect.",
      },
      {
        t: "labeled",
        name: "June",
        text: "The season is properly underway and the city knows it. Tourists are here, in numbers. The terraces are full on weekends. You can still get a seat at a good place if you show up early or go on a weeknight. It's worth it. The light in June in Montréal is something.",
      },
      {
        t: "labeled",
        name: "July–August",
        text: "Peak. You know it the moment you arrive anywhere near a popular rooftop on a Friday at 7pm. Show up by 5 or go late. Things thin out after 9. Make a reservation like an adult or accept the consequences. The food is good, the drinks are cold, the wait is real.",
      },
      {
        t: "labeled",
        name: "September",
        text: "If you're only going to have one perfect terrace month in Montréal, this is it. Warm enough during the day, cool in the evenings, and suddenly you can hear yourself think again. The August crowds vanish. The regulars come back. This is when the city stops performing and starts living again.",
      },
      {
        t: "labeled",
        name: "October",
        text: "Wind-down. Heated and covered spots hold on. Most sidewalk and rooftop terraces close somewhere between Thanksgiving and Halloween. Call ahead if you're going somewhere specific. Don't just show up.",
      },
    ],
    contentFr: [
      {
        t: "p",
        text: "Y'a pas de règle fixe. Si t'as vécu quelques printemps montréalais, tu t'en doutais déjà. La plupart des endroits visent quelque part en mai, mais c'est la météo qui a le dernier mot. Cette année, la troisième semaine d'avril a frappé à 22 degrés un samedi, et on a vu une poignée de terrasses se réveiller.",
      },
      {
        t: "p",
        text: "Il y a toujours ce jour où ça bascule. Les proprios sortent leurs tables à 7h du matin. Bientôt les trottoirs de Saint-Laurent sont pleins de monde encore en manteau, qui commandent du vin à midi. La saison est commencée. Comme les dates varient d'un endroit à l'autre et bougent chaque année, on compile ce que les propriétaires et les clients nous rapportent et on [les liste ici](/open).",
      },
      {
        t: "p",
        text: "Ce que les gens des villes chaudes comprennent pas, c'est ce que ça représente. On l'a mérité. Chaque matin de février à gratter le char à -25, chaque mars où on croyait que c'était fini et on a pris une autre tempête dans la face. C'est la facture. La terrasse, c'est le remboursement.",
      },
      {
        t: "p",
        text: "Ça dure plus longtemps qu'on pense. Les endroits couverts et chauffés tiennent jusqu'en octobre. La vraie saison, c'est juin à septembre. Celle où on reste parce que la nuit est bonne et que rentrer, ça a juste pas de sens.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Avril",
        text: "Plus tôt que les gens pensent. Une belle semaine en avril suffit pour que certains sortent les chaises. Compte pas dessus, mais sois pas surpris non plus.",
      },
      {
        t: "labeled",
        name: "Mai",
        text: "La première vraie vague. La plupart des endroits ouvrent quelque part dans le mois, avec des heures qui s'élargissent à mesure que la météo tient. À noter cette année: le Grand Prix de Formule 1 tombe en mai, ce qui veut dire que la ville se remplit plus tôt que d'habitude. Planifie en conséquence. Et prends une veste le soir de toute façon. Le soleil tombe vite et la température suit.",
      },
      {
        t: "labeled",
        name: "Juin",
        text: "La saison est lancée pour vrai, et la ville le sait. Les touristes sont là, en nombre. Les terrasses sont pleines les fins de semaine. On peut encore trouver une table quelque part de bien si on arrive tôt ou si on sort en semaine. Ça vaut le coup. La lumière de juin à Montréal, c'est quelque chose.",
      },
      {
        t: "labeled",
        name: "Juillet-août",
        text: "Le plein été. Tu le sais dès que t'arrives près d'un bon rooftop un vendredi à 19h. Arrive à 17h ou reviens après 21h. Fais une réservation ou assume les conséquences. C'est bon, c'est froid, et l'attente est réelle.",
      },
      {
        t: "labeled",
        name: "Septembre",
        text: "Si t'as le choix d'un seul mois parfait en terrasse à Montréal, c'est celui-là. Chaud le jour, frais le soir, et on peut enfin s'entendre parler. Les foules d'août disparaissent. Les habitués reviennent. La ville arrête de performer et recommence à vivre.",
      },
      {
        t: "labeled",
        name: "Octobre",
        text: "La descente. Les spots chauffés et couverts tiennent bon. La plupart des terrasses de trottoir et de rooftop ferment quelque part entre l'Action de grâce et l'Halloween. Appelle avant de te déplacer. Débarque pas là sans savoir.",
      },
    ],
  },
  {
    slug: "best-rooftop-terrasses-montreal",
    title: "The Best Rooftop Terraces in Montréal",
    titleFr: "Les meilleures terrasses sur les toits à Montréal",
    description:
      "People from Miami don't understand why Montréalers make such a thing about rooftops. They've never survived a February here.",
    descriptionFr:
      "Les gens de Miami comprennent pas pourquoi les Montréalais font tout un plat des rooftops. Ils ont jamais survécu à un février ici.",
    date: "March 15, 2026",
    dateFr: "15 mars 2026",
    dateIso: "2026-03-15",
    content: [
      {
        t: "p",
        text: "People from Miami or Barcelona don't understand why Montréalers make such a thing about rooftop terraces. They have outdoor drinking 365 days a year. They've been desensitized.",
      },
      { t: "p", text: "We haven't." },
      {
        t: "p",
        text: "Six months of winter will do that. You come back to a rooftop in May or June and it hits you in a way that's genuinely difficult to explain to anyone who spent the winter somewhere reasonable. The St. Lawrence out there. The city below you. A cold beer. The feeling that you made it.",
      },
      {
        t: "p",
        text: "The rooftop scene here is smaller than the city's overall terrace culture. Most outdoor drinking in Montréal happens at street level, which is actually how it should be, which is actually better. But there are good options if you know what you're looking for.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "The hotel rooftops",
        text: "Old Montréal has a cluster of these attached to boutique hotels. Cocktails, good views, polished service. They tend toward the upscale end, which makes them a great call for a special occasion, out-of-town guests, or when someone else is paying.",
      },
      {
        t: "labeled",
        name: "The converted rooftops",
        text: "Bars and restaurants that took a building top and turned it into something real, with no particular effort to make it look designed. String lights, mismatched furniture, a bar that works. These places tend to have better prices and crowds that actually live here.",
      },
      {
        t: "labeled",
        name: "The ones you have to find",
        text: "A terrace above a Plateau restaurant that doesn't advertise itself. A rooftop in the Latin Quarter that fits maybe forty people and has been there for years without a PR campaign. These are the ones worth the effort.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Terrasse William Gray",
        text: "Eight floors up on Hotel William Gray. The Old Port, the Saint-Lawrence, the Ferris wheel, the whole mess of the old city below you. Firepits when it cools. Cult MTL's 2025 reader pick. When someone visiting asks you to name a rooftop, this is the name that comes out. Usually the obvious answer is wrong. Not here.",
      },
      {
        t: "labeled",
        name: "Terrasse Nelligan",
        text: "Hotel Nelligan, Rue Saint-Paul Ouest. Old enough to have regulars who've been coming for years. The mimosa brunches became an institution somewhere along the way. Views across the old city. Retractable awnings if the weather moves. Saturday mornings, show up early or call ahead.",
      },
      {
        t: "labeled",
        name: "Terrasse sur l'Auberge",
        text: "Fifth floor of the Auberge du Vieux-Port, facing the river. The 2025 menu: bison tartare, grilled octopus, tuna tataki. The view doesn't need the food to justify the trip. The food is just what keeps you there past the second drink.",
      },
      {
        t: "labeled",
        name: "Terrasse Carla",
        text: "Sixth floor of the Hampton Inn, Rue Saint-Laurent. Tropical vegetation, 7,000 square feet of it, the whole concept lifted from Vietnam's French colonial period. French-Vietnamese food. You expect something smaller. You get something else.",
      },
      {
        t: "labeled",
        name: "Rose Orange",
        text: "44th floor of Place Ville Marie. Highest terrace in the city. Go before sunset. That's the whole instruction.",
      },
      {
        t: "labeled",
        name: "Réservoir",
        text: "Craft brewery on Avenue Duluth in the Plateau. Yellow picnic tables on the roof. Nobody's trying to impress you. After enough hotel bars that all look the same, this is a relief.",
      },
      {
        t: "labeled",
        name: "Taverne Atlantic",
        text: "Art Deco bar on Avenue du Parc in Mile-Ex. City views, pizza, cocktails. Cult MTL 2025 reader pick. The neighbourhood is still real in a way that most of Old Montreal gave up on years ago.",
      },
      {
        t: "labeled",
        name: "Snowbird Tiki Bar",
        text: "Inside Bar Idole on Plaza Saint-Hubert, Petite-Patrie. You won't find it by accident. Tropical cocktails, pineapple glasses, decor that commits to the bit. Open until 3am on weekends. Small place. Go once and you'll understand.",
      },
      { t: "divider" },
      {
        t: "p",
        text: "Practical things: arrive earlier than you think necessary. By 7pm on a Friday in July, most good rooftops have a wait. Get there at 5, or make a reservation. Some places take them, some don't. Worth a call.",
      },
      {
        t: "p",
        text: "One more thing. It's windier up there than it looks from the street. Every time. Bring something for your shoulders or spend the evening cold and annoyed at yourself. Your choice.",
      },
    ],
    contentFr: [
      {
        t: "p",
        text: "Les gens de Miami ou Barcelone comprennent pas pourquoi on fait tout un plat des rooftops. Eux, ils boivent dehors à l'année. Ils ont développé une indifférence.",
      },
      { t: "p", text: "Pas nous." },
      {
        t: "p",
        text: "Six mois d'hiver, ça change quelque chose. Tu reviens sur un rooftop en mai et ça te rentre dedans d'une façon impossible à expliquer à quelqu'un qui a passé son hiver quelque part de raisonnable. Le Saint-Laurent au loin. La ville en dessous. Une bière froide. Le sentiment que t'as passé à travers.",
      },
      {
        t: "p",
        text: "Les rooftops, c'est une partie plus petite de la scène de terrasse à Montréal. La plupart du boire dehors se passe au niveau de la rue, ce qui est en fait mieux comme ça. Mais il y a de bonnes options si tu sais quoi chercher.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Les rooftops d'hôtel",
        text: "Le Vieux-Montréal en a une grappe, attachés à des hôtels boutique. Cocktails, belles vues, service soigné. Haut de gamme, donc parfait pour une occasion spéciale, des invités de l'extérieur, ou quand quelqu'un d'autre règle l'addition.",
      },
      {
        t: "labeled",
        name: "Les rooftops convertis",
        text: "Des bars et restos qui ont pris un toit ordinaire et en ont fait quelque chose de réel, sans chercher à faire designé. Lumières string, mobilier dépareillé, un bar qui fonctionne. Meilleurs prix, monde qui vit ici.",
      },
      {
        t: "labeled",
        name: "Ceux qu'il faut trouver",
        text: "Une terrasse au-dessus d'un resto du Plateau qui se publicise pas. Un rooftop dans le Quartier latin pour quarante personnes, là depuis des années sans relations publiques. Ceux-là valent l'effort.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Terrasse William Gray",
        text: "Huitième étage de l'Hôtel William Gray. Le Vieux-Port, le Saint-Laurent, la grande roue, tout le bordel du vieux quartier en dessous. Des foyers quand ça refroidit. Choix des lecteurs Cult MTL 2025. Quand quelqu'un de passage te demande un rooftop, c'est ce nom qui sort. D'habitude, la réponse évidente déçoit. Pas celle-là.",
      },
      {
        t: "labeled",
        name: "Terrasse Nelligan",
        text: "Hôtel Nelligan, rue Saint-Paul Ouest. Assez établi pour avoir de vrais habitués qui reviennent depuis des années. Les brunchs aux mimosas sont devenus une institution sans qu'on s'en rende vraiment compte. Vue sur le vieux quartier. Auvents rétractables si le ciel change d'idée. Le samedi matin, arrive tôt ou appelle avant.",
      },
      {
        t: "labeled",
        name: "Terrasse sur l'Auberge",
        text: "Cinquième étage de l'Auberge du Vieux-Port, côté fleuve. Menu 2025 : tartare de bison, poulpe grillé, tataki de thon. La vue justifie le déplacement sans avoir besoin de la bouffe. La bouffe, c'est ce qui te retient après le deuxième verre.",
      },
      {
        t: "labeled",
        name: "Terrasse Carla",
        text: "Sixième étage du Hampton Inn, rue Saint-Laurent. 650 mètres carrés de végétation tropicale, le tout inspiré de l'architecture coloniale française du Vietnam. Cuisine franco-vietnamienne. T'arrives en t'attendant à quelque chose de plus petit. T'avais tort.",
      },
      {
        t: "labeled",
        name: "Rose Orange",
        text: "44e étage de la Place Ville Marie. La terrasse la plus haute en ville. Vas-y avant le coucher du soleil. C'est toute la consigne.",
      },
      {
        t: "labeled",
        name: "Réservoir",
        text: "Brasserie artisanale sur l'avenue Duluth, dans le Plateau. Tables à pique-nique jaunes sur le toit. Ça cherche pas à impressionner personne. Après assez de bars d'hôtel qui se ressemblent tous, c'est un vrai soulagement.",
      },
      {
        t: "labeled",
        name: "Taverne Atlantic",
        text: "Bar Art déco sur l'avenue du Parc, Mile-Ex. Vues sur la ville, pizza, cocktails. Choix des lecteurs Cult MTL 2025. Le quartier a encore quelque chose de réel, ce que la plupart des rooftops du Vieux ont perdu depuis longtemps.",
      },
      {
        t: "labeled",
        name: "Snowbird Tiki Bar",
        text: "Caché à l'intérieur du Bar Idole, Plaza Saint-Hubert, Petite-Patrie. Tu trouves pas ça par hasard. Cocktails tropicaux dans des verres ananas sculptés, décor qui assume le kitch jusqu'au bout. Ouvert jusqu'à 3h les fins de semaine. C'est petit. Vas-y une fois.",
      },
      { t: "divider" },
      {
        t: "p",
        text: "Arrive plus tôt que tu penses nécessaire. À 19h un vendredi de juillet, les bons rooftops ont une file. Arrive à 17h ou fais une réservation. Certains en prennent, d'autres pas. Ça vaut un coup de fil.",
      },
      {
        t: "p",
        text: "Dernière chose. C'est toujours plus venteux en haut que ça en a l'air depuis la rue. Apporte quelque chose pour les épaules ou passe ta soirée à geler et à te blâmer.",
      },
    ],
  },
  {
    slug: "dog-friendly-terrasses-montreal",
    title: "Dog-Friendly Terraces in Montréal",
    titleFr: "Les terrasses dog-friendly à Montréal",
    description:
      "Montréal has always been a dog city. The terrace culture has caught up. A practical guide to where you can actually go.",
    descriptionFr:
      "Montréal a toujours été une ville de chiens. La culture de terrasse a rattrapé. Guide pratique pour savoir où aller vraiment.",
    date: "March 15, 2026",
    dateFr: "15 mars 2026",
    dateIso: "2026-03-15",
    content: [
      {
        t: "p",
        text: "Montréal has always been a dog city. Walk any street in the Plateau on a Saturday morning and count. The density is remarkable. People here have dogs the way other cities have cars. A fundamental part of how they move through the world.",
      },
      {
        t: "p",
        text: "The terrace culture has caught up. More places now treat dogs as actual guests rather than things to be managed until someone complains. Water bowl at the door. Staff who stop to say hello before taking your order. You can tell the difference between a place that has a dogs-allowed policy and a place that actually likes dogs.",
      },
      {
        t: "p",
        text: "The rule in Québec: dogs can't go inside food establishments. Health regulation, not negotiable. Terrace spaces are outside, and establishments can allow dogs there as long as they stay out. Most places that welcome dogs have figured out what this looks like in practice. The dog stays outside. That's the deal.",
      },
      { t: "divider" },
      {
        t: "p",
        text: "A water bowl near the entrance is a real signal. It means they've thought about this. Low or no barriers are better than high-walled patios where your dog can't see anything and starts climbing the furniture. In July and August, find shade. Pavement heats up fast and dogs overheat faster than you'd think.",
      },
      {
        t: "p",
        text: "For neighbourhoods: the Plateau and Mile End are the obvious circuit. Dense, walkable, generally relaxed about dogs. Saint-Henri and Little Burgundy have gotten better as their restaurant scenes have matured. Old Montréal is inconsistent. Some places are genuinely welcoming, others don't want the complication on a busy tourist afternoon. I don't blame them. But I also don't go back.",
      },
      {
        t: "p",
        text: "The dog-friendly filter on this site exists, but the data is thin. Most restaurants don't publish their dog policy anywhere, which means we're largely dependent on people who've actually been. If you know a spot that welcomes dogs, use the Edit button on that terrace's page to mark it. That's how this becomes useful.",
      },
      {
        t: "p",
        text: "The confirmed ones: Terrasse Saint-Ambroise at McAuslan Brewery in Saint-Henri. Canal-side with picnic tables, wood-fired pizza on weekends. Dogs are welcomed, not managed. Cult MTL's 2025 reader pick. Messorem Bracitorium, also on the Lachine Canal and one of the bigger terraces in the city. Rotating beers, food trucks, a genuine crowd. Riverside, the green patio at the end of Rue Saint-Ambroise, facing the water. Quieter than the other two, which already aren't loud. All three are in Saint-Henri. There's a reason for that.",
      },
    ],
    contentFr: [
      {
        t: "p",
        text: "Montréal est une ville de chiens. Prends n'importe quelle rue dans le Plateau un samedi matin et compte. La densité est frappante. Le monde ici a des chiens comme d'autres villes ont des voitures.",
      },
      {
        t: "p",
        text: "Ça commence à se sentir dans les terrasses aussi. Plus d'endroits traitent les chiens comme de vrais clients plutôt que comme un problème à gérer avant que quelqu'un se plaigne. Bol d'eau à l'entrée. Personnel qui dit bonjour au chien en premier. On fait vite la différence entre un endroit qui tolère les chiens et un endroit qui les aime.",
      },
      {
        t: "p",
        text: "Au Québec, les chiens peuvent pas entrer dans les établissements alimentaires. C'est réglementaire, pas négociable. Les terrasses sont dehors, et les restos peuvent les y accueillir tant qu'ils restent à l'extérieur. La plupart des endroits dog-friendly ont compris comment ça marche. Le chien reste dehors. C'est le deal.",
      },
      { t: "divider" },
      {
        t: "p",
        text: "Un bol d'eau près de l'entrée, c'est un signe. Ça veut dire qu'on y a pensé. Les barrières basses marchent mieux que les patios fermés où le chien voit rien et commence à grimper. En plein été, cherche de l'ombre. L'asphalte chauffe vite et les chiens surchauffent plus rapidement qu'on pense.",
      },
      {
        t: "p",
        text: "Pour les quartiers : le Plateau et le Mile End sont le circuit de base. Dense, marchable, généralement cool avec les chiens. Saint-Henri et Petite-Bourgogne se sont améliorés. Le Vieux est inégal. Certains endroits sont vraiment accueillants, d'autres veulent pas la complication en pleine terrasse de touristes. On les comprend. On y retourne pas.",
      },
      {
        t: "p",
        text: "Le filtre dog-friendly sur ce site existe, mais les données sont minces. La plupart des restos publient pas leur politique nulle part. On dépend des gens qui y vont. Si tu sais qu'un endroit est dog-friendly, utilise le bouton Modifier sur la page de cette terrasse. C'est comme ça que ça devient utile.",
      },
      {
        t: "p",
        text: "Les confirmés : la Terrasse Saint-Ambroise à la brasserie McAuslan, Saint-Henri. Canal, tables à pique-nique, pizza au four à bois les fins de semaine. Les chiens sont accueillis, pas juste tolérés. Choix des lecteurs Cult MTL 2025. Messorem Bracitorium, aussi sur le canal Lachine, une des plus grandes terrasses en ville. Bières en rotation, camions de bouffe, vrai monde. Riverside, le patio vert au bout de la rue Saint-Ambroise face à l'eau. Plus calme que les deux autres, ce qui veut déjà dire quelque chose. Les trois sont à Saint-Henri. C'est pas un hasard.",
      },
    ],
  },
  {
    slug: "montreal-terrasses-by-neighbourhood",
    title: "Montréal Terraces by Neighbourhood",
    titleFr: "Les terrasses de Montréal par quartier",
    description:
      "Where the terrace culture actually lives, neighbourhood by neighbourhood. Including the honest version of what each one is like.",
    descriptionFr:
      "Là où la culture de terrasse vit vraiment, quartier par quartier. La version honnête.",
    date: "March 15, 2026",
    dateFr: "15 mars 2026",
    dateIso: "2026-03-15",
    content: [
      {
        t: "p",
        text: "Montréal's terrace culture is concentrated. It stacks up in a few places and disperses quickly beyond them. You can waste a lot of time looking for a good terrace in the wrong neighbourhood. Here's the honest version.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Plateau-Mont-Royal",
        text: "The baseline. More terraces per block than anywhere else in the city, ranging from classic bistro sidewalk tables to backyard spaces with fire pits. Saint-Laurent, Mont-Royal, Rachel. This is where you take people when they're visiting and want to understand what Montréal outdoor drinking actually looks like. It's also the most crowded, and you can feel it. Both things are true. Réservoir, the brewery on Duluth, puts yellow picnic tables on the roof and doesn't ask anything of you. Worth knowing about.",
      },
      {
        t: "labeled",
        name: "Mile End",
        text: "A different energy than the Plateau. The terrace scene here is younger and less concerned with what things look like. Natural wine on a wooden bench is more common than tablecloths and a printed menu. Bernard and Saint-Viateur. If you want the density of the Plateau but with more room to breathe, this is closer to what you're after.",
      },
      {
        t: "labeled",
        name: "Old Montréal",
        text: "Some of the best terrace views in the city. Hotel rooftops, canal-side spots, cobblestone terraces with the architecture right there. The quieter streets away from Place Jacques-Cartier have the best options. The river is close. Worth it if you pick carefully. Terrasse William Gray, Terrasse Nelligan, and Terrasse sur l'Auberge are the rooftop cluster here. Obvious options. Obvious because they're good.",
      },
      {
        t: "labeled",
        name: "Griffintown",
        text: "Grown up fast. The canal corridor now has a real run of solid spots, and the neighbourhood has enough density to make a proper evening out of it. Good option if you want something a bit different from the Plateau circuit.",
      },
      {
        t: "labeled",
        name: "Saint-Henri and Little Burgundy",
        text: "Both have developed real restaurant scenes over the past decade, which is recent and worth acknowledging. Less crowded than the Plateau, more neighbourhood feel. The stretch of Notre-Dame Ouest from Atwater heading west is worth walking on a summer evening. Don't tell too many people. Terrasse Saint-Ambroise at McAuslan and Messorem Bracitorium are both on the canal. Both take dogs. Going with a dog, those are the ones to know.",
      },
      {
        t: "labeled",
        name: "Downtown",
        text: "More spread out than the other neighbourhoods, which changes how it feels. The best spots are hotel rooftops with views of the mountain, and a handful of solid terraces around Peel and the quieter streets near McGill. Crescent Street exists and is what it is. Worth it if you know where you're going.",
      },
      {
        t: "labeled",
        name: "Verdun",
        text: "Consistently underrated. Wellington Street has a run of genuinely good terraces. Honest prices, local crowd, seats available without a fight. The river is close. Go to Verdun.",
      },
    ],
    contentFr: [
      {
        t: "p",
        text: "La terrasse à Montréal, c'est concentré. Ça s'empile dans quelques quartiers et se disperse vite en dehors. On peut perdre beaucoup de temps à chercher dans le mauvais coin. Voici ce que c'est vraiment.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Plateau-Mont-Royal",
        text: "C'est le point de référence. Plus de terrasses par bloc que n'importe où en ville, des tables de trottoir de bistro aux cours arrière avec foyers. Saint-Laurent, Mont-Royal, Rachel. C'est là qu'on amène les visiteurs qui veulent comprendre ce que boire dehors à Montréal veut vraiment dire. C'est aussi le plus achalandé, et ça se ressent. Les deux sont vrais en même temps. Réservoir, la brasserie sur Duluth, met des tables à pique-nique jaunes sur le toit et te demande rien. Bonne chose à savoir.",
      },
      {
        t: "labeled",
        name: "Mile End",
        text: "Autre chose que le Plateau. La scène est plus jeune, moins préoccupée par l'image. Du vin naturel sur un banc en bois, c'est plus courant que des nappes et un menu imprimé. Bernard et Saint-Viateur. Si tu veux la densité du Plateau mais avec plus d'air, c'est par là.",
      },
      {
        t: "labeled",
        name: "Vieux-Montréal",
        text: "Certaines des meilleures vues de la ville. Rooftops d'hôtel, terrasses sur les pavés avec l'architecture juste là, spots en bord d'eau. Les rues plus calmes, loin de la Place Jacques-Cartier, ont les meilleures options. Le fleuve est proche. Ça vaut la peine si on choisit bien. Terrasse William Gray, Terrasse Nelligan, Terrasse sur l'Auberge. Les choix évidents de rooftops. Évidents parce qu'ils sont bons.",
      },
      {
        t: "labeled",
        name: "Griffintown",
        text: "Le quartier a grandi vite. Le corridor du canal a maintenant une vraie suite de bons endroits, et il y a assez de densité pour en faire une vraie soirée. Bonne option si tu veux sortir du circuit habituel.",
      },
      {
        t: "labeled",
        name: "Saint-Henri et Petite-Bourgogne",
        text: "Les deux ont développé de vraies scènes de restos sur la dernière décennie. Moins achalandé que le Plateau, plus de feeling de quartier. Le tronçon de Notre-Dame Ouest, à partir d'Atwater vers l'ouest, vaut la peine d'être marché un soir d'été. On garde ça pour soi. La Terrasse Saint-Ambroise à la brasserie McAuslan et Messorem Bracitorium sont tous les deux sur le canal. Les deux acceptent les chiens. Si tu vas avec un chien, commence par là.",
      },
      {
        t: "labeled",
        name: "Centre-Ville",
        text: "Pas un quartier de terrasses au sens naturel du terme, mais il y a des bons coups. Les rooftops d'hôtel donnent sur la montagne et ça change tout. Quelques adresses solides autour de Peel et dans les rues calmes près de McGill. La rue Crescent, c'est autre chose. Venir avec une idée précise en tête.",
      },
      {
        t: "labeled",
        name: "Verdun",
        text: "Sous-estimé depuis toujours. La rue Wellington a une vraie suite de bonnes terrasses. Prix honnêtes, clientèle locale, des places disponibles sans se battre. Le fleuve est à deux pas. Allez à Verdun.",
      },
    ],
  },
  {
    slug: "best-terraces-montreal",
    title: "The Best Terraces in Montréal",
    titleFr: "Les meilleures terrasses à Montréal",
    description:
      "Montréal has over 180 terraces. Most people rotate through the same three or four. Here are thirteen worth knowing about, across every type and neighbourhood.",
    descriptionFr:
      "Montréal compte plus de 180 terrasses. La plupart des gens en rotent trois ou quatre toujours les mêmes. En voici treize qui valent la peine, dans tous les styles et tous les quartiers.",
    date: "April 12, 2026",
    dateFr: "12 avril 2026",
    dateIso: "2026-04-12",
    content: [
      {
        t: "p",
        text: "Montréal has over 180 terraces, patios, and rooftops. Most people have a rotation of three or four, and they're fine. But fine isn't the point. The point is the one you haven't found yet.",
      },
      {
        t: "p",
        text: "This list cuts across types and neighbourhoods — rooftops, hidden courtyards, canal-side gardens, sidewalk tables on streets that still feel like real streets. Cross-referenced from Cult MTL, Tastet, Time Out, Tourisme Montréal, and several others. Updated for the 2026 season.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Terrasse William Gray",
        text: "Eight floors up on Hotel William Gray, Old Montréal. The Old Port, the Saint-Lawrence, the Ferris wheel below you. Firepits when it cools. Cult MTL's 2025 reader pick. When someone asks you to name a Montréal rooftop, this is the name that comes out. For once, the obvious answer is right.",
      },
      {
        t: "labeled",
        name: "Terrasse Nelligan",
        text: "Hotel Nelligan, Rue Saint-Paul Ouest. Eighty seats, views across Old Montréal. The mimosa brunches became an institution without anyone deciding they would. Retractable awnings when the weather turns. Saturday mornings, call ahead.",
      },
      {
        t: "labeled",
        name: "Rose Orange",
        text: "44th floor of Place Ville Marie, Downtown. The city spread below you in every direction. Go for sunset. The food doesn't need to be the reason.",
      },
      {
        t: "labeled",
        name: "Réservoir",
        text: "Craft brewery on Avenue Duluth, Plateau-Mont-Royal. Yellow picnic tables on the roof. No dress code implied or enforced. The antidote to hotel bars.",
      },
      {
        t: "labeled",
        name: "Taverne Atlantic",
        text: "Art Deco bar on Avenue du Parc, Mile-Ex. City views, pizza, solid cocktails. The neighbourhood still feels like a neighbourhood. Cult MTL 2025 reader pick.",
      },
      {
        t: "labeled",
        name: "Jardin Nelson",
        text: "Hidden courtyard off Place Jacques-Cartier, Old Montréal. The building dates to 1812. Live jazz most evenings. Crepes and cold drinks while the old city goes about itself around you.",
      },
      {
        t: "labeled",
        name: "Café Santropol",
        text: "Hidden garden on Rue Saint-Urbain, Plateau. Community café since 1976. Tree canopy, a fountain, vegetarian menu. The kind of place you find once and wonder how you missed it for years.",
      },
      {
        t: "labeled",
        name: "Khyber Pass",
        text: "Hidden backyard terrace on Avenue Duluth, Plateau. About fifty seats, plants and murals, BYOW. Afghan food. One of the quieter good terraces in a neighbourhood that isn't short of them.",
      },
      {
        t: "labeled",
        name: "L'Auberge Saint-Gabriel",
        text: "Open courtyard, Rue Saint-Gabriel, Old Montréal. The restaurant has been here since 1688. The terrace is newer. Still.",
      },
      {
        t: "labeled",
        name: "Terrasse Saint-Ambroise",
        text: "McAuslan Brewery, Rue Saint-Ambroise, Saint-Henri. Canal-side, picnic tables, string lights. Wood-fired pizza Thursday through Sunday. Dogs welcome. Cult MTL 2025 reader pick.",
      },
      {
        t: "labeled",
        name: "Messorem Bracitorium",
        text: "Lachine Canal, Rue Pitt, Saint-Henri. One of the largest terraces in the city. Industrial-chic brewery, rotating craft beers, food trucks. 4.8 on Google from over 2,200 reviews. Dogs welcome.",
      },
      {
        t: "labeled",
        name: "Joe Beef",
        text: "Backyard terrace, Rue Notre-Dame Ouest, Little Burgundy. The restaurant that put Montréal on the global dining map. The terrace is in the back. Reservations required. Worth the planning.",
      },
      {
        t: "labeled",
        name: "Beba",
        text: "Sidewalk terrace, Rue Éthel, Verdun. Thirty seats, Argentine restaurant from two brothers formerly of the Joe Beef group. Michelin-noted. The garage door slides open in summer. Verdun is the right answer when everywhere else has a two-hour wait.",
      },
      { t: "divider" },
      {
        t: "p",
        text: "This is thirteen of 180. Use the filters on the main page to find what's open now, dog-friendly, covered, or closest to you.",
      },
    ],
    contentFr: [
      {
        t: "p",
        text: "Plus de 180 terrasses à Montréal. La plupart des gens en rotent trois ou quatre et s'en contentent. Mais se contenter, c'est pas vraiment l'idée. L'idée, c'est celle qu'on a pas encore trouvée.",
      },
      {
        t: "p",
        text: "Cette liste couvre tous les styles et tous les quartiers : rooftops, cours cachées, jardins au bord du canal, tables de trottoir dans des rues qui ont encore du caractère. Recoupé à partir de Cult MTL, Tastet, Time Out, Tourisme Montréal et d'autres. Mis à jour pour la saison 2026.",
      },
      { t: "divider" },
      {
        t: "labeled",
        name: "Terrasse William Gray",
        text: "Huitième étage de l'Hôtel William Gray, Vieux-Montréal. Le Vieux-Port en bas, le Saint-Laurent, la grande roue. Des foyers quand ça refroidit. Choix des lecteurs Cult MTL 2025. Le nom qui sort en premier quand on demande un rooftop à Montréal. Pour une fois, la réponse évidente est la bonne.",
      },
      {
        t: "labeled",
        name: "Terrasse Nelligan",
        text: "Hôtel Nelligan, rue Saint-Paul Ouest. Quatre-vingts places, vue sur le vieux quartier. Les brunchs aux mimosas sont devenus une institution d'eux-mêmes, sans que personne le décide vraiment. Auvents rétractables si le ciel change d'idée. Le samedi matin, appelle avant.",
      },
      {
        t: "labeled",
        name: "Rose Orange",
        text: "44e étage de la Place Ville Marie, Centre-Ville. La ville en dessous dans tous les sens. Vas-y pour le coucher de soleil. La bouffe a pas besoin d'être la raison.",
      },
      {
        t: "labeled",
        name: "Réservoir",
        text: "Brasserie sur l'avenue Duluth, Plateau-Mont-Royal. Tables à pique-nique jaunes sur le toit. Personne te juge sur ta tenue. L'antidote aux bars d'hôtel.",
      },
      {
        t: "labeled",
        name: "Taverne Atlantic",
        text: "Bar Art déco, avenue du Parc, Mile-Ex. Vues sur la ville, pizza, cocktails corrects. Le quartier a encore quelque chose de réel. Choix des lecteurs Cult MTL 2025.",
      },
      {
        t: "labeled",
        name: "Jardin Nelson",
        text: "Cour cachée derrière la Place Jacques-Cartier, Vieux-Montréal. Le bâtiment date de 1812. Jazz en direct la plupart des soirs. Des crêpes et des drinks pendant que le vieux quartier vaque autour de toi.",
      },
      {
        t: "labeled",
        name: "Café Santropol",
        text: "Jardin caché, rue Saint-Urbain, Plateau. Café communautaire depuis 1976. Canopée d'arbres, une fontaine, menu végé. Le genre d'endroit qu'on trouve une fois et qu'on se demande comment on avait passé à côté aussi longtemps.",
      },
      {
        t: "labeled",
        name: "Khyber Pass",
        text: "Cour arrière cachée, avenue Duluth, Plateau. Une cinquantaine de places, des plantes, des murales. Apportez votre vin. Cuisine afghane. Une des terrasses tranquilles du Plateau, ce qui est pas peu dire.",
      },
      {
        t: "labeled",
        name: "L'Auberge Saint-Gabriel",
        text: "Cour à ciel ouvert, rue Saint-Gabriel, Vieux-Montréal. Le resto est là depuis 1688. La terrasse est plus récente. Quand même.",
      },
      {
        t: "labeled",
        name: "Terrasse Saint-Ambroise",
        text: "Brasserie McAuslan, rue Saint-Ambroise, Saint-Henri. Canal, tables à pique-nique, guirlandes lumineuses. Pizza au four à bois du jeudi au dimanche. Chiens bienvenus. Choix des lecteurs Cult MTL 2025.",
      },
      {
        t: "labeled",
        name: "Messorem Bracitorium",
        text: "Canal Lachine, rue Pitt, Saint-Henri. Une des plus grandes terrasses en ville. Brasserie industrielle, bières en rotation, camions de bouffe. 4,8 sur Google à partir de plus de 2 200 avis. Chiens bienvenus aussi.",
      },
      {
        t: "labeled",
        name: "Joe Beef",
        text: "Cour arrière, rue Notre-Dame Ouest, Petite-Bourgogne. Le resto qui a mis Montréal sur la carte gastronomique mondiale. La terrasse est dans la cour. Réservations obligatoires. Ça mérite de planifier.",
      },
      {
        t: "labeled",
        name: "Beba",
        text: "Terrasse de trottoir, rue Éthel, Verdun. Trente places, restaurant argentin fondé par deux frères anciennement du groupe Joe Beef. Noté au guide Michelin. La porte de garage coulissante s'ouvre en été. Verdun, c'est la bonne réponse quand les autres quartiers ont deux heures d'attente.",
      },
      { t: "divider" },
      {
        t: "p",
        text: "C'est treize sur 180. Utilise les filtres sur la page principale pour trouver ce qui est ouvert maintenant, dog-friendly, couvert, ou le plus proche.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
