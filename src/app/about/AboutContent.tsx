"use client";

import Link from "next/link";
import Image from "next/image";
import ContactBlock from "@/components/ContactBlock";
import { useLang } from "@/lib/LanguageContext";
import { terraces } from "@/data/terraces";

export default function AboutContent() {
  const { lang } = useLang();
  const count = terraces.length;

  if (lang === "fr") {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
          À propos
        </p>
        <h1 className="font-display text-3xl font-bold mb-8">
          Terrasse Season
        </h1>

        <div className="prose-like font-reading space-y-5 text-base text-foreground/80 leading-relaxed">
          <p>
            Terrasse Season est un répertoire de spots de bouffe en plein air à
            Montréal : terrasses, patios, rooftops et cours arrière dans les 24
            quartiers de la ville. {count} fiches, filtrables par type,
            caractéristiques et horaires.
          </p>

          <p>
            Les étés à Montréal sont courts. La saison de terrasse est encore
            plus courte. Ce site existe pour que tu passes moins de temps à
            chercher un spot et plus de temps assis dedans. Et pour trouver
            quelque chose de nouveau au lieu de retourner au même endroit chaque
            fin de semaine parce que c&apos;est le seul que tu connais.
          </p>

          <p>
            Les données viennent d&apos;un croisement de Time Out, Tastet, Cult
            MTL, Tourisme Montréal, Narcity, Daily Hive, OpenTable et plusieurs
            autres, puis d&apos;une vérification de ce qu&apos;on pouvait. Les
            horaires viennent de Google Places et sont mis à jour
            saisonnièrement. Rien est parfait. Les terrasses ouvrent et ferment,
            les restos pivotent, les proprios changent d&apos;idée sur les
            chiens. On met à jour aussi souvent qu&apos;on peut.
          </p>

          <div className="not-prose rounded-xl border border-border bg-accent-soft/50 px-5 py-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[11px] uppercase tracking-widest text-accent font-medium">
                Dans les médias
              </p>
              <Image
                src="/mtlbloglogo.png"
                alt="MTL Blog"
                width={500}
                height={378}
                className="h-8 w-auto"
              />
            </div>
            <blockquote className="text-[15px] italic text-foreground/75 leading-relaxed">
              &ldquo;This new Montreal restaurant terrasse map has 200+ spots
              and it works better than Google Maps&rdquo;
            </blockquote>
            <a
              href="https://www.mtlblog.com/montreal-restaurants-terrasses-map"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm font-medium text-accent hover:underline"
            >
              MTL Blog, mai 2026
            </a>
          </div>

          <hr className="border-border my-8" />

          <h2 className="font-display text-xl font-bold text-foreground">
            Comment les données fonctionnent
          </h2>

          <p>
            Pour les caractéristiques comme chauffée et couverte, on les indique
            seulement quand on a une source qui le confirme. Le dog-friendly est
            plus difficile. Les sources publiées sont rares, donc on dépend
            aussi des soumissions d&apos;utilisateurs, ce qui veut dire que la
            précision varie plus. En cas de doute, appelle avant. Les horaires
            viennent de Google Places et sont mis à jour avant chaque saison. Si
            un détail est pas affiché, ça veut dire qu&apos;on a pas de source
            confirmée pour ça, pas que la réponse est non.
          </p>
          <p>
            Certaines données sont minces, et on le sait. Le dog-friendly en
            particulier est difficile à vérifier à partir de sources publiées.
            La plupart des restos le publicisent pas, et ce qui est écrit en
            ligne vieillit vite. Si tu sais qu&apos;un endroit accueille les
            chiens (ou pas), soumettre cette information est vraiment utile.
            C&apos;est comme ça que ça s&apos;améliore.
          </p>

          <h2 className="font-display text-xl font-bold text-foreground mt-8">
            Contribuer
          </h2>

          <p>
            Pour ajouter une terrasse manquante, utilise{" "}
            <Link href="/submit" className="text-accent hover:underline">
              le formulaire de suggestion
            </Link>
            . Pour corriger quelque chose sur une fiche existante (mauvais
            horaires, fermé définitivement, politique de chiens changée),
            utilise le bouton <strong>Modifier</strong> sur la page de cette
            terrasse. Il pré-remplit les détails existants pour que tu aies
            juste à changer ce qui est faux. On examine tout ce qui entre.
          </p>

          <h2 className="font-display text-xl font-bold text-foreground mt-8">
            Une note sur la précision
          </h2>

          <p>
            On fait de notre mieux, mais les choses changent vite dans
            l&apos;industrie de la restauration. Ça vaut toujours la peine de
            vérifier les réseaux sociaux du resto ou d&apos;appeler avant de
            faire un voyage spécialement pour la terrasse.
          </p>

          <hr className="border-border my-8" />

          <ContactBlock />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
        About
      </p>
      <h1 className="font-display text-3xl font-bold mb-8">Terrasse Season</h1>

      <div className="prose-like space-y-5 text-base text-foreground/80 leading-relaxed">
        <p>
          Terrasse Season is a directory of outdoor dining spots in Montréal:
          terraces, patios, rooftops, and backyards across the city&apos;s 24
          neighbourhoods. {count} listings, filterable by type, features, and
          hours.
        </p>

        <p>
          Montréal summers are short. The terrace season is shorter. This site
          exists so you spend less time hunting for a spot and more time
          actually sitting in one. And so you find somewhere new instead of
          defaulting to the same place every weekend because it&apos;s the only
          one you know.
        </p>

        <p>
          The data comes from cross-referencing Time Out, Tastet, Cult MTL,
          Tourisme Montréal, Narcity, Daily Hive, OpenTable, and several others,
          then verifying what we could. Hours come from Google Places and are
          updated seasonally. Nothing is perfect. Terraces open and close,
          restaurants pivot, owners change their minds about dogs. We update as
          often as we can.
        </p>

        <div className="not-prose rounded-xl border border-border bg-accent-soft/50 px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-[11px] uppercase tracking-widest text-accent font-medium">
              In the press
            </p>
            <Image
              src="/mtlbloglogo.png"
              alt="MTL Blog"
              width={500}
              height={378}
              className="h-8 w-auto"
            />
          </div>
          <blockquote className="text-[15px] italic text-foreground/75 leading-relaxed">
            &ldquo;This new Montreal restaurant terrasse map has 200+ spots and
            it works better than Google Maps&rdquo;
          </blockquote>
          <a
            href="https://www.mtlblog.com/montreal-restaurants-terrasses-map"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm font-medium text-accent hover:underline"
          >
            MTL Blog, May 2026
          </a>
        </div>

        <hr className="border-border my-8" />

        <h2 className="font-display text-xl font-bold text-foreground">
          How the data works
        </h2>

        <p>
          For features like heated and covered, we only mark them when we have a
          source confirming it. Dog-friendliness is harder. Published sources
          are sparse, so we also rely on user submissions, which means accuracy
          varies more. When in doubt, call ahead. Hours are set from Google
          Places data and refreshed before each season. If a detail isn&apos;t
          shown, it means we don&apos;t have a confirmed source for it, not that
          the answer is no.
        </p>
        <p>
          Some data is thin, and we know it. Dog-friendliness in particular is
          hard to verify from published sources. Most restaurants don&apos;t
          advertise it, and what&apos;s written online goes out of date fast. If
          you know a spot welcomes dogs (or doesn&apos;t), submitting that
          information is genuinely useful. That&apos;s how this gets better.
        </p>

        <h2 className="font-display text-xl font-bold text-foreground mt-8">
          Contributing
        </h2>

        <p>
          To add a missing terrace, use{" "}
          <Link href="/submit" className="text-accent hover:underline">
            the suggest form
          </Link>
          . To correct something on an existing listing (wrong hours, closed
          permanently, dog policy changed), use the <strong>Edit</strong> button
          on that terrace&apos;s page. It pre-fills the existing details so you
          only need to change what&apos;s wrong. We review everything that comes
          in.
        </p>

        <h2 className="font-display text-xl font-bold text-foreground mt-8">
          A note on accuracy
        </h2>

        <p>
          We do our best, but things change fast in the restaurant industry.
          Always worth checking a restaurant&apos;s own social media or calling
          ahead before making a trip specifically for the terrace.
        </p>

        <hr className="border-border my-8" />

        <ContactBlock />
      </div>
    </div>
  );
}
