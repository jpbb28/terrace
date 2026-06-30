import Home from "@/components/HomeClient";
import HomeJsonLd from "./HomeJsonLd";

// The homepage. Metadata + hreflang for "/" live in the root layout. The
// directory-wide JSON-LD graph (ItemList of every terrace) is rendered here,
// homepage-only, so it never duplicates the per-terrace AggregateRating on
// /terraces/[slug].
export default function Page() {
  return (
    <>
      <HomeJsonLd />
      <Home />
    </>
  );
}
