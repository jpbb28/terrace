import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Terms & Disclaimer – Terrasse Season",
  description: "Terms of use and accuracy disclaimer for Terrasse Season.",
  alternates: { canonical: "https://terrasseseason.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

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
    </div>
  );
}
