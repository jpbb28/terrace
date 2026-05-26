"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { terraces } from "@/data/terraces";
import { Terrace } from "@/lib/types";
import { useFavorites } from "@/lib/favorites";
import { useLang } from "@/lib/LanguageContext";

function RowInner({ terrace }: { terrace: Terrace }) {
  return (
    <>
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-warm-soft via-accent-soft to-olive-soft">
        {terrace.photos.length > 0 && (
          <Image
            src={terrace.photos[0]}
            alt={terrace.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug truncate group-hover:text-accent transition-colors">
          {terrace.name}
        </p>
        <p className="text-[11px] text-muted truncate">
          {terrace.neighborhood}
        </p>
      </div>
    </>
  );
}

export default function FavoritesTray({
  open,
  onOpenChange,
  hidden = false,
  onSelect,
}: {
  /** Panel open state, owned by the parent so the header menu can open it too. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hides the floating button (e.g. while a terrace detail is open). The panel
   *  can still be opened from the menu. */
  hidden?: boolean;
  /** Open a terrace in-app. When provided, list rows call this instead of
   *  navigating; falls back to /?terrace={id} (the interactive home view). */
  onSelect?: (id: string) => void;
}) {
  const { favorites, count, hydrated, remove, clear } = useFavorites();
  const { t } = useLang();

  const [mode, setMode] = useState<"list" | "share">("list");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState(false);

  if (!hydrated) return null;

  // Resolve saved ids to terrace objects, preserving save order.
  const saved = favorites
    .map((id) => terraces.find((tt) => tt.id === id))
    .filter((tt): tt is NonNullable<typeof tt> => Boolean(tt));

  function closePanel() {
    onOpenChange(false);
    setMode("list");
    setShareUrl(null);
    setCopied(false);
    setConfirmClear(false);
    setError(false);
  }

  function selectTerrace(id: string) {
    closePanel();
    onSelect?.(id);
  }

  async function createLink() {
    setCreating(true);
    setError(false);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: favorites,
          title: name.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.slug) {
        const url = `${window.location.origin}/list/${data.slug}`;
        setShareUrl(url);
        if (typeof navigator !== "undefined" && navigator.share) {
          navigator
            .share({ title: name.trim() || "Terrasse Season", url })
            .catch(() => {});
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setCreating(false);
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Floating action button */}
      {count > 0 && !open && !hidden && (
        <button
          onClick={() => onOpenChange(true)}
          aria-label={t.myList}
          className="fixed left-4 bottom-4 sm:left-5 sm:bottom-5 z-[1180] flex items-center gap-2 h-12 pl-3.5 pr-4 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="currentColor"
            aria-hidden
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <span className="text-sm font-semibold tabular-nums">{count}</span>
        </button>
      )}

      {/* Panel + backdrop */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[1190] bg-black/30 animate-fade-in"
            onClick={closePanel}
          />
          <div className="fixed z-[1200] flex flex-col bg-background shadow-2xl border border-border inset-x-0 bottom-0 max-h-[78vh] rounded-t-2xl sm:inset-x-auto sm:left-5 sm:bottom-5 sm:w-[380px] sm:max-h-[72vh] sm:rounded-2xl animate-fade-in">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-display text-base font-bold">
                {t.myListCount(count)}
              </h2>
              <button
                onClick={closePanel}
                aria-label="Close"
                className="w-7 h-7 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-foreground/[0.06] transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {saved.length === 0 ? (
                <p className="text-sm text-muted text-center px-6 py-12">
                  {t.myListEmpty}
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {saved.map((tt) => (
                    <li
                      key={tt.id}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      {onSelect ? (
                        <button
                          onClick={() => selectTerrace(tt.id)}
                          className="flex items-center gap-3 flex-1 min-w-0 group text-left cursor-pointer"
                        >
                          <RowInner terrace={tt} />
                        </button>
                      ) : (
                        <Link
                          href={`/?terrace=${tt.id}`}
                          onClick={closePanel}
                          className="flex items-center gap-3 flex-1 min-w-0 group"
                        >
                          <RowInner terrace={tt} />
                        </Link>
                      )}
                      <button
                        onClick={() => remove(tt.id)}
                        aria-label={t.removeFromListShort}
                        title={t.removeFromListShort}
                        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-muted hover:text-accent hover:bg-foreground/[0.06] transition-colors cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {saved.length > 0 && (
              <div className="shrink-0 border-t border-border p-3 space-y-2">
                {mode === "list" ? (
                  <>
                    <button
                      onClick={() => setMode("share")}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {t.shareList}
                    </button>
                    {confirmClear ? (
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <span className="text-muted">{t.clearListConfirm}</span>
                        <button
                          onClick={() => {
                            clear();
                            setConfirmClear(false);
                            closePanel();
                          }}
                          className="text-accent font-medium hover:underline cursor-pointer"
                        >
                          {t.clearList}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmClear(true)}
                        className="w-full text-center text-xs text-muted hover:text-foreground transition-colors cursor-pointer py-1"
                      >
                        {t.clearList}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    {!shareUrl ? (
                      <>
                        <label className="block text-[11px] text-muted font-medium">
                          {t.shareListNameLabel}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.shareListNamePlaceholder}
                          maxLength={80}
                          className="w-full text-sm bg-white border border-border rounded-xl px-3 py-2 outline-none focus:border-accent transition-colors"
                        />
                        {error && (
                          <p className="text-xs text-red-600">
                            {t.submitError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMode("list")}
                            className="px-3 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                          >
                            ←
                          </button>
                          <button
                            onClick={createLink}
                            disabled={creating}
                            className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {creating ? t.creatingLink : t.createShareLink}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2">
                          <input
                            readOnly
                            value={shareUrl}
                            onFocus={(e) => e.target.select()}
                            className="flex-1 text-xs text-foreground/70 bg-transparent outline-none min-w-0"
                          />
                        </div>
                        <button
                          onClick={copyLink}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
                        >
                          {copied ? (
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
                              {t.linkCopied}
                            </>
                          ) : (
                            t.copyLink
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
