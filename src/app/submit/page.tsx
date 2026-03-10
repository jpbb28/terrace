"use client";

import { useState } from "react";
import Link from "next/link";

const neighborhoods = [
  "Ahuntsic", "Chinatown", "Downtown", "Griffintown", "Hochelaga",
  "Latin Quarter", "Little Burgundy", "Little Italy", "Mile End", "Mile-Ex",
  "NDG", "Old Montreal", "Outremont", "Parc-Extension", "Petite-Patrie",
  "Plateau-Mont-Royal", "Pointe-Saint-Charles", "Quartier des Spectacles",
  "Rosemont", "Saint-Henri", "The Village", "Verdun", "Villeray",
];

const terraceTypes = [
  { value: "sidewalk", label: "Sidewalk / Streetside" },
  { value: "rooftop", label: "Rooftop" },
  { value: "backyard", label: "Backyard / Garden" },
  { value: "courtyard", label: "Courtyard / Hidden Patio" },
];

type FormState = "idle" | "submitting" | "success" | "error";

export default function SubmitPage() {
  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState({
    name: "",
    address: "",
    neighborhood: "",
    terraceType: "",
    cuisineType: "",
    capacity: "",
    covered: false,
    dogFriendly: false,
    heated: false,
    website: "",
    phone: "",
    openingHours: "",
    seasonalOpen: "",
    seasonalClose: "",
    description: "",
    submitterName: "",
    submitterEmail: "",
    submitterRole: "",
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");

    // For now, log to console — wire up to email/database in v2
    console.log("Terrace submission:", form);

    // Simulate a short delay
    await new Promise((r) => setTimeout(r, 800));
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <svg className="w-12 h-12" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="16,1 14,8 18,8" fill="#c45d3e"/>
              <polygon points="16,31 14,24 18,24" fill="#c45d3e"/>
              <polygon points="1,16 8,14 8,18" fill="#c45d3e"/>
              <polygon points="31,16 24,14 24,18" fill="#c45d3e"/>
              <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e"/>
              <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e"/>
              <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e"/>
              <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e"/>
              <circle cx="16" cy="16" r="6" fill="#c45d3e"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Thanks for submitting!</h2>
          <p className="text-muted text-sm mb-6">
            We'll review your terrace and add it to the map. It usually takes
            1–3 days. We may reach out to you if we need more details.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-accent text-black text-sm font-medium hover:bg-accent-dim transition-colors"
            >
              Back to the map
            </Link>
            <button
              onClick={() => {
                setState("idle");
                setForm({
                  name: "", address: "", neighborhood: "", terraceType: "",
                  cuisineType: "", capacity: "", covered: false, dogFriendly: false,
                  heated: false, website: "", phone: "", openingHours: "",
                  seasonalOpen: "", seasonalClose: "", description: "",
                  submitterName: "", submitterEmail: "", submitterRole: "",
                });
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-card transition-colors"
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
          &larr; Back to map
        </Link>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="16,1 14,8 18,8" fill="#c45d3e"/>
            <polygon points="16,31 14,24 18,24" fill="#c45d3e"/>
            <polygon points="1,16 8,14 8,18" fill="#c45d3e"/>
            <polygon points="31,16 24,14 24,18" fill="#c45d3e"/>
            <polygon points="5.4,5.4 10.2,8.4 7.8,10.8" fill="#c45d3e"/>
            <polygon points="26.6,26.6 21.8,23.6 24.2,21.2" fill="#c45d3e"/>
            <polygon points="26.6,5.4 23.6,10.2 21.2,7.8" fill="#c45d3e"/>
            <polygon points="5.4,26.6 8.4,21.8 10.8,24.2" fill="#c45d3e"/>
            <circle cx="16" cy="16" r="6" fill="#c45d3e"/>
          </svg>
          <span className="font-bold">Terrace Season</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Submit a terrace</h1>
          <p className="text-muted text-sm">
            Know a great terrace that's not on the map? Whether you're an owner,
            manager, or just a regular — help us grow the list.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Terrace Info */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Terrace Info
            </h2>
            <div className="space-y-4">
              <Field label="Restaurant / Bar name" required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Café Olimpico"
                  className={inputClass}
                />
              </Field>

              <Field label="Address" required>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="e.g. 124 Rue Saint-Viateur O"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Neighborhood" required>
                  <select
                    required
                    value={form.neighborhood}
                    onChange={(e) => update("neighborhood", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Terrace type" required>
                  <select
                    required
                    value={form.terraceType}
                    onChange={(e) => update("terraceType", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {terraceTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Cuisine type">
                  <input
                    type="text"
                    value={form.cuisineType}
                    onChange={(e) => update("cuisineType", e.target.value)}
                    placeholder="e.g. French Bistro, Brewery"
                    className={inputClass}
                  />
                </Field>

                <Field label="Approximate capacity">
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(e) => update("capacity", e.target.value)}
                    placeholder="e.g. 40"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="What makes this terrace special? Views, vibe, notable features..."
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Features
            </h2>
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label="Dog-friendly"
                checked={form.dogFriendly}
                onChange={(v) => update("dogFriendly", v)}
              />
              <Checkbox
                label="Covered / has awning"
                checked={form.covered}
                onChange={(v) => update("covered", v)}
              />
              <Checkbox
                label="Heated"
                checked={form.heated}
                onChange={(v) => update("heated", v)}
              />
            </div>
          </section>

          {/* Hours & Season */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Hours & Season
            </h2>
            <div className="space-y-4">
              <Field label="Opening hours">
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => update("openingHours", e.target.value)}
                  placeholder="e.g. 11:30 AM – 11:00 PM"
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Season opens">
                  <input
                    type="text"
                    value={form.seasonalOpen}
                    onChange={(e) => update("seasonalOpen", e.target.value)}
                    placeholder="e.g. May, April 15"
                    className={inputClass}
                  />
                </Field>
                <Field label="Season closes">
                  <input
                    type="text"
                    value={form.seasonalClose}
                    onChange={(e) => update("seasonalClose", e.target.value)}
                    placeholder="e.g. October, Halloween"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Contact (optional)
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Website">
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="514-000-0000"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Submitter */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              About you
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Your name">
                  <input
                    type="text"
                    value={form.submitterName}
                    onChange={(e) => update("submitterName", e.target.value)}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </Field>
                <Field label="Your email">
                  <input
                    type="email"
                    value={form.submitterEmail}
                    onChange={(e) => update("submitterEmail", e.target.value)}
                    placeholder="So we can follow up"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Your role">
                <select
                  value={form.submitterRole}
                  onChange={(e) => update("submitterRole", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Prefer not to say</option>
                  <option value="owner">Owner / Manager</option>
                  <option value="staff">Staff</option>
                  <option value="regular">Regular customer</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>
          </section>

          <button
            type="submit"
            disabled={state === "submitting"}
            className="w-full py-3 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {state === "submitting" ? "Submitting..." : "Submit terrace"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded accent-accent w-4 h-4"
      />
      {label}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors";
