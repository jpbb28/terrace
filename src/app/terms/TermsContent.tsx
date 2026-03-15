"use client";

import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";

export default function TermsContent() {
  const { lang } = useLang();

  if (lang === "fr") {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
          Légal
        </p>
        <h1 className="font-display text-3xl font-bold mb-2">Conditions et avertissement</h1>
        <p className="text-sm text-muted mb-10">Dernière mise à jour : mai 2025</p>

        <div className="space-y-8 text-sm text-foreground/75 leading-relaxed">
          <section>
            <h2 className="font-semibold text-foreground text-base mb-2">Exactitude de l&apos;information</h2>
            <p>
              Terrasse Season fournit un répertoire de spots de bouffe en plein air à Montréal compilé à partir de sources publiques incluant des publications alimentaires, Google Places et des soumissions d&apos;utilisateurs. On fait des efforts raisonnables pour garder l&apos;information à jour, mais on peut pas garantir que les horaires, adresses, caractéristiques, dates saisonnières ou tout autre détail sont exacts au moment où vous les lisez.
            </p>
            <p className="mt-3">
              Les restaurants changent leurs horaires. Les terrasses ferment de façon inattendue. Les politiques sur les chiens, les chauffages et les réservations changent sans préavis. Vérifiez toujours directement avec l&apos;établissement avant de planifier.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground text-base mb-2">Aucune responsabilité</h2>
            <p>
              Terrasse Season n&apos;est pas responsable de toute perte, inconvénient ou déception résultant de la dépendance sur l&apos;information fournie sur ce site, incluant mais sans s&apos;y limiter : établissements fermés, horaires changés, adresses incorrectes, menus ou prix modifiés, ou tout autre écart entre ce qui est listé ici et ce que vous trouvez en personne.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground text-base mb-2">Avis des utilisateurs</h2>
            <p>
              Les avis soumis via ce site représentent les opinions d&apos;utilisateurs individuels et ne reflètent pas les vues de Terrasse Season. On se réserve le droit de retirer les avis qui contiennent de fausses informations, du contenu offensant, ou du matériel qui viole les droits des autres.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground text-base mb-2">Aucune affiliation</h2>
            <p>
              Terrasse Season n&apos;a aucune affiliation officielle avec les établissements listés sur ce site. Les fiches ne sont pas des placements payants. Aucun établissement n&apos;a payé pour être inclus, et l&apos;inclusion ne constitue pas un endossement.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground text-base mb-2">Liens externes</h2>
            <p>
              Les liens vers des sites web de restaurants, Google Maps et d&apos;autres services externes sont fournis par commodité. On n&apos;est pas responsable du contenu ou de la disponibilité des sites externes.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground text-base mb-2">Sources des données</h2>
            <p>
              Les données des fiches sont compilées à partir de sources publiques et sont destinées à des fins d&apos;information seulement. Les données d&apos;horaires proviennent de l&apos;API Google Places. Si vous croyez que l&apos;information sur votre établissement est incorrecte, soumettez une correction via le bouton Modifier sur la page de cet établissement.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground text-base mb-2">Modifications</h2>
            <p>
              On peut mettre à jour cette page de temps en temps. L&apos;utilisation continue du site après tout changement constitue une acceptation des conditions mises à jour.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
        Legal
      </p>
      <h1 className="font-display text-3xl font-bold mb-2">Terms &amp; Disclaimer</h1>
      <p className="text-sm text-muted mb-10">Last updated: May 2025</p>

      <div className="space-y-8 text-sm text-foreground/75 leading-relaxed">
        <section>
          <h2 className="font-semibold text-foreground text-base mb-2">Accuracy of information</h2>
          <p>
            Terrasse Season provides a directory of outdoor dining spots in Montréal compiled from publicly available sources including food publications, Google Places, and user submissions. We make reasonable efforts to keep information current, but we cannot guarantee that hours, locations, features, seasonal dates, or any other details are accurate at the time you read them.
          </p>
          <p className="mt-3">
            Restaurants change hours. Terrasses close unexpectedly. Policies around dogs, heaters, and reservations change without notice. Always verify directly with the establishment before making plans based on information from this site.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground text-base mb-2">No liability</h2>
          <p>
            Terrasse Season is not responsible for any loss, inconvenience, or disappointment resulting from reliance on information provided on this site, including but not limited to: closed establishments, changed hours, incorrect addresses, altered menus or pricing, or any other discrepancy between what is listed here and what you find in person.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground text-base mb-2">User reviews</h2>
          <p>
            Reviews submitted through this site represent the opinions of individual users and do not reflect the views of Terrasse Season. We reserve the right to remove reviews that contain false information, offensive content, or material that violates the rights of others.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground text-base mb-2">No affiliation</h2>
          <p>
            Terrasse Season has no official affiliation with any of the establishments listed on this site. Listings are not paid placements. No establishment has paid for inclusion, and inclusion does not constitute an endorsement.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground text-base mb-2">External links</h2>
          <p>
            Links to restaurant websites, Google Maps, and other external services are provided as a convenience. We are not responsible for the content or availability of external sites.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground text-base mb-2">Data sources</h2>
          <p>
            Listing data is compiled from publicly available sources and is intended for informational purposes only. Hours data is sourced from Google Places API. If you believe information about your establishment is incorrect, please{" "}
            <Link href="/submit" className="text-accent hover:underline">
              submit a correction
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-foreground text-base mb-2">Changes to these terms</h2>
          <p>
            We may update this page from time to time. Continued use of the site after any changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
