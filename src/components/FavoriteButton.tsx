"use client";

import { useFavorites } from "@/lib/favorites";
import { useLang } from "@/lib/LanguageContext";

interface FavoriteButtonProps {
  id: string;
  /** Photo overlay style (circular white chip). Otherwise a bordered icon button. */
  overlay?: boolean;
  className?: string;
}

export default function FavoriteButton({
  id,
  overlay = false,
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const { t } = useLang();
  const saved = hydrated && isFavorite(id);

  const base = overlay
    ? "flex items-center justify-center w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-colors"
    : "flex items-center justify-center w-8 h-8 rounded-full border border-border bg-white transition-colors hover:border-accent/40";

  const color = saved
    ? "text-accent"
    : overlay
      ? "text-foreground/55 hover:text-accent"
      : "text-muted hover:text-accent";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t.removeFromList : t.saveToList}
      title={saved ? t.removeFromList : t.saveToList}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={`${base} ${color} cursor-pointer ${className}`}
    >
      {saved ? (
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px]"
          fill="currentColor"
          aria-hidden
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.313 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}
