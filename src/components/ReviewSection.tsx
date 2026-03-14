"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";

interface Review {
  id: string;
  rating: number;
  text: string | null;
  created_at: string;
}

interface Props {
  terraceId: string;
  placeId?: string;
  googleRating?: number;
  googleReviewCount?: number;
}

function Stars({ value, interactive = false, onChange }: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={interactive ? `${star} star${star !== 1 ? "s" : ""}` : undefined}
        >
          <svg
            className={`w-5 h-5 transition-colors ${active >= star ? "text-amber-400" : "text-foreground/15"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return lang === "fr" ? "aujourd'hui" : "today";
  if (days === 1) return lang === "fr" ? "hier" : "yesterday";
  if (days < 30) return lang === "fr" ? `il y a ${days} j` : `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return lang === "fr" ? `il y a ${months} mois` : `${months}mo ago`;
  return lang === "fr" ? `il y a ${Math.floor(months / 12)} an` : `${Math.floor(months / 12)}y ago`;
}

export default function ReviewSection({ terraceId, placeId, googleRating, googleReviewCount }: Props) {
  const { lang } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const lsKey = `reviewed_${terraceId}`;
  const tokenKey = "review_token";

  function getOrCreateToken(): string {
    let token = localStorage.getItem(tokenKey);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(tokenKey, token);
    }
    return token;
  }

  useEffect(() => {
    setAlreadyReviewed(!!localStorage.getItem(lsKey));
    setRating(0);
    setText("");
    setSubmitted(false);
    setError("");
    setLoading(true);

    fetch(`/api/reviews/${terraceId}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        setAvg(d.avg ?? null);
        setCount(d.count ?? 0);
      })
      .finally(() => setLoading(false));
  }, [terraceId, lsKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terraceId, rating, text, token: getOrCreateToken() }),
    });

    if (res.ok) {
      localStorage.setItem(lsKey, "1");
      setAlreadyReviewed(true);
      setSubmitted(true);
      fetch(`/api/reviews/${terraceId}`)
        .then((r) => r.json())
        .then((d) => {
          setReviews(d.reviews ?? []);
          setAvg(d.avg ?? null);
          setCount(d.count ?? 0);
        });
    } else {
      const d = await res.json();
      if (d.error === "already_reviewed") {
        localStorage.setItem(lsKey, "1");
        setAlreadyReviewed(true);
      } else {
        setError(lang === "fr" ? "Une erreur s'est produite." : "Something went wrong.");
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="pt-5 border-t border-border space-y-5">

      {/* Google rating block */}
      {placeId && googleRating && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted mb-2">
            {lang === "fr" ? "Sur Google" : "On Google"}
          </p>
          <a
            href={`https://search.google.com/local/reviews?placeid=${placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 group"
          >
            <svg className="w-3.5 h-3.5 text-[#4285F4] shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5 16.25 5 12C5 7.9 8.2 4.73 12.2 4.73C15.29 4.73 17.1 6.7 17.1 6.7L19 4.72C19 4.72 16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12C2.03 17.05 6.16 22 12.25 22C17.6 22 21.5 18.33 21.5 12.91C21.5 11.76 21.35 11.1 21.35 11.1Z"/>
            </svg>
            <span className="text-sm font-semibold group-hover:text-accent transition-colors">
              {googleRating.toFixed(1)}
            </span>
            <Stars value={Math.round(googleRating)} />
            {googleReviewCount && (
              <span className="text-xs text-muted group-hover:text-accent transition-colors">
                ({googleReviewCount.toLocaleString()})
              </span>
            )}
          </a>
        </div>
      )}

      {/* Terrace Season reviews block */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {lang === "fr" ? "Avis visiteurs" : "Visitor reviews"}
          </p>
          {avg !== null && count > 0 && (
            <div className="flex items-center gap-2">
              <Stars value={Math.round(avg)} />
              <span className="text-xs text-muted">{avg.toFixed(1)} ({count})</span>
            </div>
          )}
        </div>

        {/* Submission form */}
        {submitted ? (
          <p className="text-sm text-green-700 font-medium mb-4">
            {lang === "fr" ? "Merci pour votre avis !" : "Thanks for your review!"}
          </p>
        ) : alreadyReviewed ? (
          <p className="text-xs text-muted mb-4">
            {lang === "fr" ? "Vous avez déjà évalué cette terrasse." : "You've already reviewed this terrace."}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Stars value={rating} interactive onChange={setRating} />
              {rating > 0 && (
                <span className="text-xs text-muted">
                  {["", lang === "fr" ? "Décevant" : "Poor", lang === "fr" ? "Passable" : "Fair", lang === "fr" ? "Bien" : "Good", lang === "fr" ? "Très bien" : "Very good", lang === "fr" ? "Excellent" : "Excellent"][rating]}
                </span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={lang === "fr" ? "Votre avis (optionnel)" : "Your thoughts (optional)"}
              rows={2}
              maxLength={500}
              className="w-full text-sm px-3 py-2 rounded-xl border border-border bg-foreground/[0.02] resize-none focus:outline-none focus:ring-1 focus:ring-accent/40 placeholder:text-muted/50 mb-2"
            />
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? lang === "fr" ? "En cours..." : "Submitting..."
                : lang === "fr" ? "Soumettre" : "Submit"}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <p className="text-xs text-muted">{lang === "fr" ? "Chargement..." : "Loading..."}</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-muted">
            {lang === "fr" ? "Aucun avis pour l'instant. Soyez le premier !" : "No reviews yet. Be the first!"}
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl bg-foreground/[0.03] border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <Stars value={r.rating} />
                  <span className="text-[10px] text-muted">{timeAgo(r.created_at, lang)}</span>
                </div>
                {r.text && (
                  <p className="text-sm text-foreground/75 leading-relaxed">{r.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
