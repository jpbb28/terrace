import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { terraces } from "@/data/terraces";
import { slugify } from "@/lib/utils";
import TerracePageView, {
  buildTerraceMetadata,
} from "@/components/TerracePageView";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return terraces.map((t) => ({ slug: slugify(t.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const terrace = terraces.find((t) => slugify(t.name) === slug);
  if (!terrace) return {};
  return buildTerraceMetadata(terrace, slug, "fr");
}

export default async function TerracePageFr({ params }: Props) {
  const { slug } = await params;
  const terrace = terraces.find((t) => slugify(t.name) === slug);
  if (!terrace) notFound();
  return <TerracePageView terrace={terrace} slug={slug} lang="fr" />;
}
