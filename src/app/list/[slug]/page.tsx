import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { terraces } from "@/data/terraces";
import SharedListView from "@/components/SharedListView";

// Shared lists are private curations, not for search indexing.
export const metadata: Metadata = {
  title: "Shared terrace list | Terrasse Season",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

async function getListIds(
  slug: string,
): Promise<{ ids: string[]; title: string | null }> {
  const { data } = await supabaseAdmin
    .from("shared_lists")
    .select("terrace_ids, title")
    .eq("slug", slug)
    .maybeSingle();

  const ids = Array.isArray(data?.terrace_ids)
    ? (data.terrace_ids as unknown[]).filter(
        (x): x is string => typeof x === "string",
      )
    : [];
  return { ids, title: data?.title ?? null };
}

export default async function SharedListPage({ params }: Props) {
  const { slug } = await params;
  const { ids, title } = await getListIds(slug);

  // Resolve against static data, preserving the saved order. Unknown/removed
  // ids are silently dropped. An empty result renders the "not found" state.
  const list = ids
    .map((id) => terraces.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return <SharedListView terraces={list} title={title} />;
}
