"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { terraces } from "@/data/terraces";
import { useLang } from "@/lib/LanguageContext";
import { Terrace } from "@/lib/types";

interface SeasonData {
  official: Record<
    string,
    { opening_date: string; closing_date: string | null; updated_at: string }
  >;
  crowdsource: Record<string, number>;
  today: string;
}

type SortKey = "open_first" | "az" | "neighborhood";
type StatusKey = "open" | "soon" | "reported" | "closed";

// Only called for terraces that are in the filtered list (have some signal)
function getStatus(terraceId: string, data: SeasonData): StatusKey {
  const official = data.official[terraceId];
  if (official) {
    const { opening_date, closing_date } = official;
    const today = data.today;
    if (opening_date > today) return "soon";
    if (closing_date && closing_date < today) return "closed";
    return "open";
  }
  return "reported";
}

function formatDate(dateStr: string, lang: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    lang === "fr" ? "fr-CA" : "en-CA",
    { month: "short", day: "numeric" },
  );
}

const STATUS_ORDER: Record<StatusKey, number> = {
  open: 0,
  reported: 1,
  soon: 2,
  closed: 3,
};

export default function OpenPage() {
  const { t, lang } = useLang();
  const [data, setData] = useState<SeasonData | null>(null);
  const [sort, setSort] = useState<SortKey>("open_first");

  // Submission form
  const [formSearch, setFormSearch] = useState("");
  const [formDropdownOpen, setFormDropdownOpen] = useState(false);
  const [formTerrace, setFormTerrace] = useState<Terrace | null>(null);
  const [dateMode, setDateMode] = useState<"today" | "date">("today");
  const [customDate, setCustomDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tracks which terraces the user submitted this session (for undo)
  const [undoable, setUndoable] = useState<Map<string, string>>(new Map());
  const [undoing, setUndoing] = useState<Set<string>>(new Set());

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/open-reports")
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formResults = useMemo(() => {
    if (formSearch.trim().length < 2) return [];
    const q = formSearch.toLowerCase();
    return terraces.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [formSearch]);

  async function handleSubmit() {
    if (!formTerrace || submitting) return;
    const openingDate =
      dateMode === "today"
        ? (data?.today ?? new Date().toISOString().split("T")[0])
        : customDate;
    if (dateMode === "date" && !customDate) return;

    setSubmitting(true);
    const res = await fetch("/api/season-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terraceId: formTerrace.id, openingDate }),
    });

    if (res.ok) {
      const tid = formTerrace.id;
      const tname = formTerrace.name;
      setData((prev) =>
        prev
          ? {
              ...prev,
              official: {
                ...prev.official,
                [tid]: {
                  opening_date: openingDate,
                  closing_date: null,
                  updated_at: new Date().toISOString(),
                },
              },
            }
          : prev,
      );
      setUndoable((prev) => new Map(prev).set(tid, tname));
      setFormTerrace(null);
      setFormSearch("");
      setDateMode("today");
      setCustomDate("");
    }

    setSubmitting(false);
  }

  async function handleUndo(terraceId: string) {
    if (undoing.has(terraceId)) return;
    setUndoing((s) => new Set(s).add(terraceId));

    const res = await fetch(
      `/api/season-dates?terraceId=${encodeURIComponent(terraceId)}`,
      { method: "DELETE" },
    );

    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev.official };
        delete next[terraceId];
        return { ...prev, official: next };
      });
      setUndoable((prev) => {
        const next = new Map(prev);
        next.delete(terraceId);
        return next;
      });
    }

    setUndoing((s) => {
      const next = new Set(s);
      next.delete(terraceId);
      return next;
    });
  }

  // Only show terraces that have some signal
  const listedTerraces = useMemo(() => {
    if (!data) return [];
    return terraces.filter(
      (t) => data.official[t.id] || (data.crowdsource[t.id] ?? 0) > 0,
    );
  }, [data]);

  const sortedList = useMemo(() => {
    if (!data) return listedTerraces;
    const list = [...listedTerraces];
    if (sort === "open_first") {
      list.sort((a, b) => {
        const sa = STATUS_ORDER[getStatus(a.id, data)];
        const sb = STATUS_ORDER[getStatus(b.id, data)];
        return sa !== sb ? sa - sb : a.name.localeCompare(b.name);
      });
    } else if (sort === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort(
        (a, b) =>
          a.neighborhood.localeCompare(b.neighborhood) ||
          a.name.localeCompare(b.name),
      );
    }
    return list;
  }, [listedTerraces, sort, data]);

  const LogoIcon = () => (
    <svg
      className="w-5 h-5 shrink-0"
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
  );

  const today = data?.today ?? "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          {t.backToMap}
        </Link>
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span className="font-bold">Terrasse Season</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-3">
            {t.openPageTitle}
          </h1>
          <p className="text-muted text-sm max-w-lg">{t.openPageSubtitle}</p>
        </div>

        {/* Sort controls — only when there's something to sort */}
        {sortedList.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["open_first", "az", "neighborhood"] as SortKey[]).map(
                (key) => {
                  const labels: Record<SortKey, string> = {
                    open_first: t.sortOpenFirst,
                    az: t.sortAZ,
                    neighborhood: t.sortNeighborhood,
                  };
                  return (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${sort === key ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
                    >
                      {labels[key]}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* List */}
        {!data ? (
          <div className="space-y-3 mb-12">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : sortedList.length === 0 ? (
          <div className="py-10 text-center mb-12">
            <p className="text-3xl mb-2">☀️</p>
            <p className="text-sm text-muted">
              {lang === "fr"
                ? "Pas encore de terrasses signalées ouvertes. Soyez le premier!"
                : "No terraces reported open yet. Be the first below!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-12">
            {sortedList.map((terrace) => {
              const status = getStatus(terrace.id, data);
              const official = data.official[terrace.id];
              const csCount = data.crowdsource[terrace.id] ?? 0;
              const canUndo = undoable.has(terrace.id);
              const isUndoing = undoing.has(terrace.id);

              return (
                <div
                  key={terrace.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    status === "open"
                      ? "border-green-500/25 bg-green-500/[0.03]"
                      : status === "reported"
                        ? "border-green-500/15 bg-green-500/[0.02]"
                        : "border-border bg-card"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {terrace.name}
                      </span>
                      {status === "open" && (
                        <span className="shrink-0 text-[10px] bg-green-500/15 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {t.openNowBadge}
                        </span>
                      )}
                      {status === "reported" && (
                        <span className="shrink-0 text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">
                          {lang === "fr" ? "Signalé ouvert" : "Reported open"}
                        </span>
                      )}
                      {status === "soon" && (
                        <span className="shrink-0 text-[10px] bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {t.openingSoonBadge(
                            formatDate(official.opening_date, lang),
                          )}
                        </span>
                      )}
                      {status === "closed" && (
                        <span className="shrink-0 text-[10px] bg-foreground/8 text-muted px-2 py-0.5 rounded-full font-medium">
                          {t.closedBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-accent font-medium">
                        {terrace.neighborhood}
                      </span>
                      {official && (
                        <span className="text-[11px] text-muted">
                          · {formatDate(official.opening_date, lang)}
                          {official.closing_date &&
                            ` – ${formatDate(official.closing_date, lang)}`}
                        </span>
                      )}
                      {!official && csCount > 0 && (
                        <span className="text-[11px] text-muted">
                          · {t.crowdsourceCount(csCount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {canUndo && (
                    <button
                      onClick={() => handleUndo(terrace.id)}
                      disabled={isUndoing}
                      className="shrink-0 text-xs text-muted hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUndoing ? "…" : lang === "fr" ? "Annuler" : "Undo"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Submit section */}
        <div className="pt-8 border-t-2 border-border">
          <h2 className="font-display text-lg font-bold mb-1">
            {lang === "fr" ? "Signalez une ouverture" : "Report an opening"}
          </h2>
          <p className="text-sm text-muted mb-6">
            {lang === "fr"
              ? "Propriétaire ou visiteur — aidez la communauté en indiquant quand une terrasse ouvre."
              : "Owner or visitor — help the community by reporting when a terrace opens."}
          </p>

          {/* Step 1: pick terrace */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-light uppercase tracking-wide block mb-1.5">
              {lang === "fr" ? "Quelle terrasse?" : "Which terrace?"}
            </label>
            <div ref={formRef} className="relative">
              {formTerrace ? (
                <div className="flex items-center justify-between bg-green-500/[0.06] border border-green-500/20 rounded-xl px-4 h-11">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      className="w-3.5 h-3.5 text-green-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm font-medium truncate">
                      {formTerrace.name}
                    </span>
                    <span className="text-xs text-muted shrink-0">
                      {formTerrace.neighborhood}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFormTerrace(null);
                      setFormSearch("");
                    }}
                    className="text-muted hover:text-foreground cursor-pointer text-xs shrink-0 ml-2"
                  >
                    {lang === "fr" ? "Changer" : "Change"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 h-11 focus-within:border-accent/50 transition-colors shadow-sm">
                    <svg
                      className="w-3.5 h-3.5 text-muted shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      value={formSearch}
                      onChange={(e) => {
                        setFormSearch(e.target.value);
                        setFormDropdownOpen(true);
                      }}
                      onFocus={() =>
                        formSearch.trim().length >= 2 &&
                        setFormDropdownOpen(true)
                      }
                      placeholder={
                        lang === "fr"
                          ? "Chercher par nom..."
                          : "Search by name..."
                      }
                      className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-light"
                    />
                    {formSearch && (
                      <button
                        onClick={() => {
                          setFormSearch("");
                          setFormDropdownOpen(false);
                        }}
                        className="text-muted hover:text-foreground cursor-pointer transition-colors"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          className="w-3.5 h-3.5"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {formDropdownOpen && formResults.length > 0 && (
                    <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl border border-border shadow-lg z-20 overflow-hidden">
                      {formResults.map((terrace) => (
                        <button
                          key={terrace.id}
                          onClick={() => {
                            setFormTerrace(terrace);
                            setFormSearch("");
                            setFormDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/[0.04] transition-colors text-left cursor-pointer border-b border-border last:border-0"
                        >
                          <span className="text-sm font-medium">
                            {terrace.name}
                          </span>
                          <span className="text-xs text-muted shrink-0 ml-2">
                            {terrace.neighborhood}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {formDropdownOpen &&
                    formSearch.trim().length >= 2 &&
                    formResults.length === 0 && (
                      <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl border border-border shadow-lg z-20 px-4 py-3">
                        <p className="text-sm text-muted">
                          {lang === "fr" ? "Aucun résultat" : "No results"}
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>

          {/* Step 2: date — only shown after a terrace is selected */}
          {formTerrace && (
            <>
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-light uppercase tracking-wide block mb-2">
                  {lang === "fr" ? "Date d'ouverture" : "Opening date"}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDateMode("today")}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                      dateMode === "today"
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {lang === "fr" ? "Ouverte maintenant" : "Open now"}
                  </button>
                  <button
                    onClick={() => setDateMode("date")}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                      dateMode === "date"
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {lang === "fr" ? "Choisir une date" : "Pick a date"}
                  </button>
                </div>
                {dateMode === "date" && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={today}
                    className="mt-3 block px-3 py-2 bg-white border border-border rounded-lg text-sm text-foreground outline-none focus:border-accent/50 transition-colors"
                  />
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || (dateMode === "date" && !customDate)}
                className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "…" : lang === "fr" ? "Soumettre" : "Submit"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
