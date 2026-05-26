"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terrace } from "@/lib/types";
import { useLang } from "@/lib/LanguageContext";
import { useFavorites } from "@/lib/favorites";
import TerraceCard from "@/components/TerraceCard";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const MONTREAL_CENTER: [number, number] = [45.5152, -73.58];

function Header() {
  const { lang, setLang } = useLang();
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 bg-background border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        <svg
          className="w-6 h-6 shrink-0"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="16,1 14,8 18,8" fill="#c45d3e" />
          <polygon points="16,31 14,24 18,24" fill="#c45d3e" />
          <polygon points="1,16 8,14 8,18" fill="#c45d3e" />
          <polygon points="31,16 24,14 24,18" fill="#c45d3e" />
          <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e" />
          <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e" />
          <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e" />
          <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e" />
          <circle cx="16" cy="16" r="6" fill="#c45d3e" />
        </svg>
        <span className="font-display text-base font-bold tracking-tight">
          Terrasse Season
        </span>
      </Link>
      <button
        onClick={() => setLang(lang === "en" ? "fr" : "en")}
        className="text-[11px] px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all font-semibold tracking-wide cursor-pointer"
      >
        {lang === "en" ? "Français" : "English"}
      </button>
    </header>
  );
}

export default function SharedListView({
  terraces,
  title,
}: {
  terraces: Terrace[];
  title: string | null;
}) {
  const { t } = useLang();
  const { addMany } = useFavorites();
  const router = useRouter();
  const [savedAll, setSavedAll] = useState(false);

  const center = useMemo<[number, number]>(() => {
    if (terraces.length === 0) return MONTREAL_CENTER;
    const lat = terraces.reduce((s, x) => s + x.lat, 0) / terraces.length;
    const lng = terraces.reduce((s, x) => s + x.lng, 0) / terraces.length;
    return [lat, lng];
  }, [terraces]);

  if (terraces.length === 0) {
    return (
      <main className="min-h-[100dvh] flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
          <p className="text-sm text-muted">{t.sharedListEmpty}</p>
          <Link
            href="/"
            className="text-sm px-4 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          >
            {t.browseAllTerraces}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] flex flex-col bg-background">
      <Header />

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Banner */}
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest text-accent font-medium mb-1.5">
            {t.sharedListIntro}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            {title || t.sharedListHeading(terraces.length)}
          </h1>
        </div>

        {/* Save all */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              addMany(terraces.map((x) => x.id));
              setSavedAll(true);
            }}
            disabled={savedAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-default"
          >
            {savedAll ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t.allSaved}
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                {t.saveAllToList(terraces.length)}
              </>
            )}
          </button>
        </div>

        {/* Mini map */}
        <div className="h-64 sm:h-72 rounded-2xl overflow-hidden border border-border">
          <Map
            terraces={terraces}
            selectedId={null}
            center={center}
            zoom={12}
            onViewDetails={(id) => router.push(`/?terrace=${id}`)}
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {terraces.map((tt, i) => (
            <TerraceCard
              key={tt.id}
              terrace={tt}
              selected={false}
              onClick={() => router.push(`/?terrace=${tt.id}`)}
              priority={i === 0}
              compact
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-8">
          <Link
            href="/"
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            {t.browseAllTerraces} →
          </Link>
        </div>
      </div>
    </main>
  );
}
