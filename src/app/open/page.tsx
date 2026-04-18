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
type StatusKey = "open" | "soon" | "reported" | "closed" | "none";

function getStatus(terraceId: string, data: SeasonData | null): StatusKey {
  if (!data) return "none";
  const official = data.official[terraceId];
  if (official) {
    const { opening_date, closing_date } = official;
    const today = data.today;
    if (opening_date > today) return "soon";
    if (closing_date && closing_date < today) return "closed";
    return "open";
  }
  if ((data.crowdsource[terraceId] ?? 0) > 0) return "reported";
  return "none";
}

function formatDate(dateStr: string, lang: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    lang === "fr" ? "fr-CA" : "en-CA",
    { month: "short", day: "numeric" },
  );
}

function getSessionId(): string {
  let token = localStorage.getItem("review_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("review_token", token);
  }
  return token;
}

export default function OpenPage() {
  const { t, lang } = useLang();
  const [data, setData] = useState<SeasonData | null>(null);
  const [userConfirmed, setUserConfirmed] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("open_first");
  const [reportSearch, setReportSearch] = useState("");
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);
  const [lastConfirmedName, setLastConfirmedName] = useState<string | null>(
    null,
  );
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setUserConfirmed(
        new Set(JSON.parse(localStorage.getItem("confirmed_open") ?? "[]")),
      );
    } catch {}
    fetch("/api/open-reports")
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setReportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function confirmOpen(terrace: Terrace) {
    if (confirming.has(terrace.id) || userConfirmed.has(terrace.id)) return;
    setConfirming((s) => new Set(s).add(terrace.id));

    const today = new Date().toISOString().split("T")[0];
    const res = await fetch("/api/open-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        terraceId: terrace.id,
        openingDate: today,
        sessionId: getSessionId(),
      }),
    });

    if (res.ok) {
      const next = new Set(userConfirmed).add(terrace.id);
      setUserConfirmed(next);
      localStorage.setItem("confirmed_open", JSON.stringify([...next]));
      setData((prev) =>
        prev
          ? {
              ...prev,
              crowdsource: {
                ...prev.crowdsource,
                [terrace.id]: (prev.crowdsource[terrace.id] ?? 0) + 1,
              },
            }
          : prev,
      );
    }

    setConfirming((s) => {
      const next = new Set(s);
      next.delete(terrace.id);
      return next;
    });
  }

  async function handleReportSelect(terrace: Terrace) {
    setReportSearch("");
    setReportDropdownOpen(false);
    await confirmOpen(terrace);
    setLastConfirmedName(terrace.name);
    setTimeout(() => setLastConfirmedName(null), 4000);
  }

  const reportResults = useMemo(() => {
    if (reportSearch.trim().length < 2) return [];
    const q = reportSearch.toLowerCase();
    return terraces
      .filter(
        (t) => !userConfirmed.has(t.id) && t.name.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [reportSearch, userConfirmed]);

  const officialCount = data ? Object.keys(data.official).length : 0;

  const statusOrder: Record<StatusKey, number> = {
    open: 0,
    reported: 1,
    soon: 2,
    closed: 3,
    none: 4,
  };

  const list = [...terraces];

  if (sort === "open_first") {
    list.sort((a, b) => {
      const sa = getStatus(a.id, data);
      const sb = getStatus(b.id, data);
      if (statusOrder[sa] !== statusOrder[sb])
        return statusOrder[sa] - statusOrder[sb];
      return a.name.localeCompare(b.name);
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
          {data && (
            <p className="text-accent font-medium text-sm mt-3">
              {officialCount === 0
                ? lang === "fr"
                  ? "Aucune terrasse n'a encore soumis ses dates."
                  : "No terraces have submitted their dates yet."
                : t.officialCountLabel(officialCount)}
            </p>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {(["open_first", "az", "neighborhood"] as SortKey[]).map((key) => {
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
            })}
          </div>
        </div>

        {/* List */}
        {!data ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((terrace) => {
              const status = getStatus(terrace.id, data);
              const official = data.official[terrace.id];
              const csCount = data.crowdsource[terrace.id] ?? 0;
              const isConfirmed = userConfirmed.has(terrace.id);

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

                  {isConfirmed && (
                    <span className="shrink-0 text-xs text-green-600 font-medium flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
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
                      {t.youConfirmed}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Crowdsource section */}
        <div className="mt-12 pt-8 border-t-2 border-border">
          <h2 className="font-display text-lg font-bold mb-1">
            {lang === "fr"
              ? "Vous avez vu une terrasse ouverte?"
              : "Spotted an open terrace?"}
          </h2>
          <p className="text-sm text-muted mb-5">
            {lang === "fr"
              ? "Signalez-la pour aider la communauté — une confirmation par terrasse."
              : "Report it to help others — one confirmation per terrace."}
          </p>

          <div ref={reportRef} className="relative">
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
                value={reportSearch}
                onChange={(e) => {
                  setReportSearch(e.target.value);
                  setReportDropdownOpen(true);
                }}
                onFocus={() =>
                  reportSearch.trim().length >= 2 && setReportDropdownOpen(true)
                }
                placeholder={
                  lang === "fr"
                    ? "Chercher une terrasse..."
                    : "Search for a terrace..."
                }
                className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-light"
              />
              {reportSearch && (
                <button
                  onClick={() => {
                    setReportSearch("");
                    setReportDropdownOpen(false);
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

            {reportDropdownOpen && reportResults.length > 0 && (
              <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl border border-border shadow-lg z-20 overflow-hidden">
                {reportResults.map((terrace) => (
                  <button
                    key={terrace.id}
                    onClick={() => handleReportSelect(terrace)}
                    disabled={confirming.has(terrace.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/[0.04] transition-colors text-left cursor-pointer disabled:opacity-50 border-b border-border last:border-0"
                  >
                    <div>
                      <span className="text-sm font-medium block">
                        {terrace.name}
                      </span>
                      <span className="text-xs text-muted">
                        {terrace.neighborhood}
                      </span>
                    </div>
                    <span className="text-xs text-accent shrink-0 ml-3 font-medium">
                      {confirming.has(terrace.id)
                        ? "…"
                        : lang === "fr"
                          ? "Confirmer ouvert"
                          : "Confirm open"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {reportDropdownOpen &&
              reportSearch.trim().length >= 2 &&
              reportResults.length === 0 && (
                <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl border border-border shadow-lg z-20 px-4 py-3">
                  <p className="text-sm text-muted">
                    {lang === "fr" ? "Aucun résultat" : "No results"}
                  </p>
                </div>
              )}
          </div>

          {lastConfirmedName && (
            <p className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1.5">
              <svg
                className="w-4 h-4 shrink-0"
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
              {lang === "fr"
                ? `Merci\u00a0! ${lastConfirmedName} a été signalé ouvert.`
                : `Thanks! ${lastConfirmedName} has been reported as open.`}
            </p>
          )}
        </div>

        {/* Owner CTA */}
        <div className="mt-10 p-5 rounded-xl border border-border bg-card text-center">
          <p className="text-sm font-medium mb-1">{t.ownerCta}</p>
          <p className="text-xs text-muted mb-3">{t.ownerCtaDesc}</p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            {t.ownerCtaBtn}
          </Link>
        </div>
      </div>
    </div>
  );
}
