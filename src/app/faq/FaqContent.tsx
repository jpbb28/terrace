"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

const faqsEn = [
  {
    q: "When do Montréal terraces open for the season?",
    a: "The traditional start is Victoria Day weekend, the third Monday of May. Most spots open around then, though some heated or covered terraces operate year-round or through the shoulder seasons. We've written a full seasonal breakdown in our guide.",
    link: { href: "/blog/when-do-montreal-terrasses-open", label: "When do terraces open? →" },
  },
  {
    q: "What's the difference between a terrace and a patio?",
    a: "Nothing, really. \"Terrasse\" is the French/Québec term; \"patio\" is the English one. In practice, Montréalers use both interchangeably. On this site we use terrace because that's what most locals call it.",
  },
  {
    q: "Do I need a reservation to sit on a terrace?",
    a: "It depends entirely on the spot. Neighbourhood cafés and casual bistros usually don't take terrace reservations. First come, first served. Popular restaurants and rooftop bars in July and August can fill up fast, so calling ahead or checking their website is worth it. If you're going somewhere specific on a weekend evening in peak season, assume you'll need a reservation.",
  },
  {
    q: "How do I find dog-friendly terraces?",
    a: "Use the dog-friendly filter on the map. Dog-friendly listings are based on published sources or user submissions, so accuracy varies. Always worth calling ahead to confirm. If a spot isn't marked dog-friendly, it may still be. We just don't have it confirmed yet. If you know a place welcomes dogs (or doesn't), use the Edit button on that terrace's page to submit it.",
    link: { href: "/blog/dog-friendly-terrasses-montreal", label: "Read the dog-friendly guide →" },
  },
  {
    q: "Are there terraces open in winter or year-round?",
    a: "Some. Heated and covered terraces can run well into October or November, and a handful operate through the winter. Use the \"heated\" and \"covered\" filters on the map to find them. Hours are often reduced in the off-season, so calling ahead is a good idea.",
  },
  {
    q: "What do \"covered\" and \"heated\" mean?",
    a: "Covered means the terrace has a roof or canopy structure overhead. How much protection that actually provides varies. Some are enclosed enough to sit through a downpour, others are just a pergola that won't block the wind. Heated means the terrace has outdoor heating (infrared heaters, fire pits, or similar). A spot can be one, both, or neither.",
  },
  {
    q: "How accurate is the information on this site?",
    a: "We do our best. Data is sourced from published lists and verified where possible. Hours come from Google Places and are updated seasonally. That said, the restaurant industry moves fast. Spots close, hours change, ownership pivots. Treat this as a reliable starting point, not a guarantee. Always worth a quick check on the restaurant's own social media before a dedicated trip.",
  },
  {
    q: "How do I suggest a new terrace or report an error?",
    a: "To add a missing terrace, use the suggest form. To correct something on an existing listing, use the Edit button on that terrace's page.",
    link: { href: "/submit", label: "Suggest a terrace →" },
  },
  {
    q: "Why does some information appear missing for certain terraces?",
    a: "If a detail isn't shown, it means we don't have a confirmed source for it. Not that the answer is no. We'd rather show nothing than show something wrong. If you know the missing detail, find the terrace on the map and use the Edit button on its page.",
  },
];

const faqsFr = [
  {
    q: "Quand est-ce que les terrasses de Montréal ouvrent pour la saison?",
    a: "Le départ traditionnel, c'est la fin de semaine de la Fête de la Reine, le troisième lundi de mai. La plupart des spots ouvrent autour de là, même si certaines terrasses chauffées ou couvertes opèrent à l'année ou pendant les saisons de transition. On a écrit un guide saisonnier complet.",
    link: { href: "/blog/when-do-montreal-terrasses-open", label: "Quand ouvrent les terrasses? →" },
  },
  {
    q: "C'est quoi la différence entre une terrasse et un patio?",
    a: "Rien, vraiment. \"Terrasse\" est le terme français/québécois, \"patio\" est l'équivalent anglais. En pratique, les Montréalais utilisent les deux de façon interchangeable. Sur ce site on utilise terrasse parce que c'est ce que la plupart des locaux disent.",
  },
  {
    q: "Est-ce qu'il faut réserver pour s'asseoir sur une terrasse?",
    a: "Ça dépend entièrement de l'endroit. Les cafés de quartier et les bistros décontractés prennent généralement pas de réservations de terrasse. Premier arrivé, premier servi. Les restos populaires et les bars de rooftop en juillet-août se remplissent vite, donc appeler d'avance vaut la peine. Si tu vas quelque part de spécifique un soir de fin de semaine en pleine saison, assume que t'auras besoin d'une réservation.",
  },
  {
    q: "Comment je trouve les terrasses dog-friendly?",
    a: "Utilise le filtre dog-friendly sur la carte. Les fiches dog-friendly sont basées sur des sources publiées ou des soumissions d'utilisateurs, donc la précision varie. Ça vaut toujours la peine d'appeler pour confirmer. Si un spot est pas marqué dog-friendly, c'est peut-être quand même le cas. On a juste pas la confirmation encore. Si tu sais qu'un endroit accueille les chiens (ou pas), utilise le bouton Modifier sur la page de cette terrasse pour nous le soumettre.",
    link: { href: "/blog/dog-friendly-terrasses-montreal", label: "Lire le guide dog-friendly →" },
  },
  {
    q: "Est-ce qu'il y a des terrasses ouvertes en hiver ou à l'année?",
    a: "Certaines. Les terrasses chauffées et couvertes peuvent durer jusqu'en octobre ou novembre, et une poignée opèrent tout l'hiver. Utilise les filtres \"chauffée\" et \"couverte\" sur la carte pour les trouver. Les horaires sont souvent réduits hors saison, donc appeler d'avance est une bonne idée.",
  },
  {
    q: "Que veulent dire \"couverte\" et \"chauffée\"?",
    a: "Couverte veut dire que la terrasse a une structure de toit ou de tente au-dessus. La protection que ça offre varie. Certaines sont assez fermées pour s'asseoir pendant une grosse pluie, d'autres c'est juste une pergola qui bloquera pas le vent. Chauffée veut dire que la terrasse a du chauffage extérieur (appareils infrarouges, foyers, ou similaire). Un spot peut être l'un, les deux, ou ni l'un ni l'autre.",
  },
  {
    q: "Est-ce que l'information sur ce site est fiable?",
    a: "On fait de notre mieux. Les données viennent de listes publiées et vérifiées autant que possible. Les horaires viennent de Google Places et sont mis à jour saisonnièrement. Cela dit, l'industrie de la restauration bouge vite. Des spots ferment, les horaires changent, la propriété change. Traite ça comme un point de départ fiable, pas une garantie. Vaut toujours un coup d'oeil sur les réseaux sociaux du resto avant un voyage dédié.",
  },
  {
    q: "Comment je propose une nouvelle terrasse ou signale une erreur?",
    a: "Pour ajouter une terrasse manquante, utilise le formulaire de suggestion. Pour corriger une fiche existante, utilise le bouton Modifier sur la page de cette terrasse.",
    link: { href: "/submit", label: "Suggérer une terrasse →" },
  },
  {
    q: "Pourquoi certaines informations sont manquantes?",
    a: "Si un détail est pas affiché, ça veut dire qu'on a pas de source confirmée pour ça. Pas que la réponse est non. On préfère ne rien afficher que d'afficher quelque chose de faux. Si tu connais le détail manquant, trouve la terrasse sur la carte et utilise le bouton Modifier sur sa page.",
  },
];

export default function FaqContent() {
  const { lang } = useLang();
  const faqs = lang === "fr" ? faqsFr : faqsEn;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
        FAQ
      </p>
      <h1 className="font-display text-3xl font-bold mb-2">
        {lang === "fr" ? "Questions fréquentes" : "Common questions"}
      </h1>
      <p className="text-sm text-muted mb-10">
        {lang === "fr"
          ? "Sur la saison de terrasse à Montréal, le site, et comment les données fonctionnent."
          : "About Montréal terrace season, the site, and how the data works."}
      </p>

      <div className="space-y-0">
        {faqs.map((faq, i) => (
          <div key={i} className="py-6 border-b border-border first:border-t">
            <h2 className="font-semibold text-foreground mb-2 text-base">{faq.q}</h2>
            <p className="text-sm text-foreground/70 leading-relaxed">{faq.a}</p>
            {faq.link && (
              <Link
                href={faq.link.href}
                className="inline-block mt-2 text-xs text-accent hover:underline font-medium"
              >
                {faq.link.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
