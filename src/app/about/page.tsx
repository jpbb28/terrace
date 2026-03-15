import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { terraces } from "@/data/terraces";

export const metadata: Metadata = {
  title: "About – Terrasse Season",
  description: "Terrasse Season is a directory of outdoor dining spots across Montréal. Who built it, how the data works, and how to contribute.",
  alternates: { canonical: "https://terrasseseason.com/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-2xl mx-auto px-5 py-12">
        <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-2">
          About
        </p>
        <h1 className="font-display text-3xl font-bold mb-8">Terrasse Season</h1>

        <div className="prose-like space-y-5 text-base text-foreground/80 leading-relaxed">
          <p>
            Terrasse Season is a directory of outdoor dining spots in Montréal: terrasses, patios, rooftops, and backyards across the city&apos;s 24 neighbourhoods. {terraces.length} listings, filterable by type, features, and hours.
          </p>

          <p>
            Montréal summers are short. The terrasse season is shorter. This site exists so you spend less time hunting for a spot and more time actually sitting in one. And so you find somewhere new instead of defaulting to the same place every weekend because it's the only one you know.
          </p>

          <p>
            The data comes from cross-referencing Time Out, Tastet, Cult MTL, Tourisme Montréal, Narcity, Daily Hive, OpenTable, and several others, then verifying what we could. Hours come from Google Places and are updated seasonally. Nothing is perfect. Terrasses open and close, restaurants pivot, owners change their minds about dogs. We update as often as we can.
          </p>

          <hr className="border-border my-8" />

          <h2 className="font-display text-xl font-bold text-foreground">How the data works</h2>

          <p>
            For features like heated and covered, we only mark them when we have a source confirming it. Dog-friendliness is harder. Published sources are sparse, so we also rely on user submissions, which means accuracy varies more. When in doubt, call ahead. Hours are set from Google Places data and refreshed before each season. If a detail isn&apos;t shown, it means we don&apos;t have a confirmed source for it, not that the answer is no.
          </p>
          <p>
            Some data is thin, and we know it. Dog-friendliness in particular is hard to verify from published sources. Most restaurants don&apos;t advertise it, and what&apos;s written online goes out of date fast. If you know a spot welcomes dogs (or doesn&apos;t), submitting that information is genuinely useful. That&apos;s how this gets better.
          </p>

          <h2 className="font-display text-xl font-bold text-foreground mt-8">Contributing</h2>

          <p>
            To add a missing terrasse, use{" "}
            <Link href="/submit" className="text-accent hover:underline">
              the suggest form
            </Link>
            . To correct something on an existing listing (wrong hours, closed permanently, dog policy changed), use the Edit button on that terrasse&apos;s page. It pre-fills the existing details so you only need to change what&apos;s wrong. We review everything that comes in.
          </p>

          <h2 className="font-display text-xl font-bold text-foreground mt-8">A note on accuracy</h2>

          <p>
            We do our best, but things change fast in the restaurant industry. Always worth checking a restaurant&apos;s own social media or calling ahead before making a trip specifically for the terrasse.
          </p>

          <hr className="border-border my-8" />

          <p className="text-sm text-muted">
            Questions or feedback?{" "}
            <Link href="/submit" className="text-accent hover:underline">
              Use the suggest form
            </Link>{" "}
            or find us on Instagram.
          </p>
        </div>
      </div>
    </div>
  );
}
