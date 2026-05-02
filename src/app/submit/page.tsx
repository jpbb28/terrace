"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { terraces } from "@/data/terraces";
import { useLang } from "@/lib/LanguageContext";
import { supabase } from "@/lib/supabase";
import HoursEditor, {
  DayHours,
  defaultHours,
  fromHourPeriods,
  toHourPeriods,
} from "@/components/HoursEditor";

const neighborhoods = [
  "Ahuntsic",
  "Chinatown",
  "Downtown",
  "Griffintown",
  "Hochelaga",
  "Latin Quarter",
  "Little Burgundy",
  "Little Italy",
  "Mile End",
  "Mile-Ex",
  "NDG",
  "Old Montreal",
  "Outremont",
  "Parc-Extension",
  "Petite-Patrie",
  "Plateau-Mont-Royal",
  "Pointe-Saint-Charles",
  "Quartier des Spectacles",
  "Rosemont",
  "Saint-Henri",
  "The Village",
  "Verdun",
  "Villeray",
];

const emptyForm = {
  name: "",
  address: "",
  neighborhood: "",
  terraceTypes: [] as string[],
  cuisineType: "",
  capacity: "",
  covered: false,
  dogFriendly: false,
  heated: false,
  website: "",
  instagram: "",
  phone: "",
  description: "",
  submitterName: "",
  submitterEmail: "",
  submitterRole: "",
};

type FormState = "idle" | "submitting" | "success" | "error";

function SubmitPageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const editTerrace = editId
    ? (terraces.find((t) => t.id === editId) ?? null)
    : null;
  const isEdit = editTerrace !== null;

  const { t } = useLang();

  const terraceTypes = [
    { value: "sidewalk", label: t.sidewalkFull },
    { value: "rooftop", label: t.rooftop },
    { value: "backyard", label: t.backyardFull },
    { value: "courtyard", label: t.courtyardFull },
    { value: "balcony", label: t.balcony },
    { value: "garden", label: t.garden },
  ];

  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState({ ...emptyForm });
  const [hours, setHours] = useState<DayHours[]>(defaultHours());
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (editTerrace) {
      setForm({
        name: editTerrace.name,
        address: editTerrace.address,
        neighborhood: editTerrace.neighborhood,
        terraceTypes: editTerrace.terraceType ?? [],
        cuisineType: editTerrace.cuisineType,
        capacity: editTerrace.capacity ? String(editTerrace.capacity) : "",
        covered: editTerrace.covered,
        dogFriendly: editTerrace.dogFriendly,
        heated: editTerrace.heated,
        website: editTerrace.website ?? "",
        instagram: editTerrace.instagram ?? "",
        phone: editTerrace.phone ?? "",
        description: editTerrace.description,
        submitterName: "",
        submitterEmail: "",
        submitterRole: "",
      });
      if (editTerrace.openingPeriods?.length) {
        setHours(fromHourPeriods(editTerrace.openingPeriods));
      }
    }
  }, [editTerrace]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTerraceType(value: string) {
    setForm((prev) => ({
      ...prev,
      terraceTypes: prev.terraceTypes.includes(value)
        ? prev.terraceTypes.filter((v) => v !== value)
        : [...prev.terraceTypes, value],
    }));
  }

  function computeChanges(newPhotos: string[] = []) {
    if (!editTerrace) return null;
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    const scalar: [string, unknown, unknown][] = [
      ["name", editTerrace.name, form.name],
      ["address", editTerrace.address, form.address],
      ["neighborhood", editTerrace.neighborhood, form.neighborhood || null],
      [
        "terraceType",
        editTerrace.terraceType ?? null,
        form.terraceTypes.length ? form.terraceTypes : null,
      ],
      [
        "cuisineType",
        editTerrace.cuisineType || null,
        form.cuisineType || null,
      ],
      [
        "capacity",
        editTerrace.capacity ?? null,
        form.capacity ? parseInt(form.capacity) : null,
      ],
      ["covered", editTerrace.covered, form.covered],
      ["dogFriendly", editTerrace.dogFriendly, form.dogFriendly],
      ["heated", editTerrace.heated, form.heated],
      ["website", editTerrace.website ?? null, form.website || null],
      ["instagram", editTerrace.instagram ?? null, form.instagram || null],
      ["phone", editTerrace.phone ?? null, form.phone || null],
      ["description", editTerrace.description, form.description],
    ];

    for (const [field, from, to] of scalar) {
      if (from !== to) changes[field] = { from, to };
    }

    const fromPeriods = editTerrace.openingPeriods ?? [];
    const toPeriods = toHourPeriods(hours);
    if (JSON.stringify(fromPeriods) !== JSON.stringify(toPeriods)) {
      changes["openingPeriods"] = { from: fromPeriods, to: toPeriods };
    }

    if (newPhotos.length > 0) {
      changes["photos"] = { from: editTerrace.photos ?? [], to: newPhotos };
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");

    // Upload photos first
    const uploadedUrls: string[] = [];
    if (images.length > 0) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const folder = isEdit
        ? `corrections/${editId}`
        : `submissions/${slug}-${crypto.randomUUID().slice(0, 8)}`;
      for (const [i, file] of images.entries()) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const filename =
          i === 0 ? `main.${ext}` : `${crypto.randomUUID()}.${ext}`;
        const path = `${folder}/${filename}`;
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, file);
        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("photos").getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }
    }

    const shared = {
      name: form.name,
      address: form.address,
      neighborhood: form.neighborhood || null,
      terrace_type: form.terraceTypes.length ? form.terraceTypes : null,
      cuisine_type: form.cuisineType || null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      covered: form.covered,
      dog_friendly: form.dogFriendly,
      heated: form.heated,
      website: form.website || null,
      instagram: form.instagram || null,
      phone: form.phone || null,
      opening_periods: toHourPeriods(hours).length
        ? toHourPeriods(hours)
        : null,
      description: form.description || null,
      submitter_name: form.submitterName || null,
      submitter_email: form.submitterEmail || null,
      submitter_role: form.submitterRole || null,
    };

    const { error } = isEdit
      ? await supabase.from("corrections").insert({
          ...shared,
          terrace_id: editId,
          terrace_name: editTerrace!.name,
          changes: computeChanges(uploadedUrls),
          photos: uploadedUrls,
        })
      : await supabase
          .from("submissions")
          .insert({ ...shared, photos: uploadedUrls });

    if (error) {
      console.error("Submission error:", error);
      setState("error");
      return;
    }

    setState("success");
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-red-500 mb-4">{t.submitError}</p>
          <button
            onClick={() => setState("idle")}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            {t.tryAgain}
          </button>
          <p className="text-xs text-muted mt-4">
            If the problem persists, email us at{" "}
            <a
              href="mailto:hello@terrasseseason.com"
              className="text-accent hover:underline"
            >
              hello@terrasseseason.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <svg
              className="w-12 h-12"
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
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {isEdit ? t.thanksCorrection : t.thanksSubmit}
          </h2>
          <p className="text-muted text-sm mb-6">
            {isEdit ? t.correctionMsg : t.submitMsg}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              {t.backToMapBtn}
            </Link>
            {!isEdit && (
              <button
                onClick={() => {
                  setState("idle");
                  setForm({ ...emptyForm });
                  setHours(defaultHours());
                  setImages([]);
                }}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-card transition-colors"
              >
                {t.submitAnother}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          {t.backToMap}
        </Link>
        <div className="flex items-center gap-2">
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
          <span className="font-bold">Terrasse Season</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {isEdit ? t.correctTitle : t.submitTitle}
          </h1>
          <p className="text-muted text-sm">
            {isEdit ? t.correctSubtitle(editTerrace.name) : t.submitSubtitle}
          </p>
          <p className="text-muted text-xs mt-2">
            Other questions?{" "}
            <a
              href="mailto:hello@terrasseseason.com"
              className="text-accent hover:underline"
            >
              hello@terrasseseason.com
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Terrace Info */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              {t.terraceInfoSection}
            </h2>
            <div className="space-y-4">
              <Field label={t.nameLabel} required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t.namePlaceholder}
                  className={inputClass}
                />
              </Field>

              <Field label={t.addressLabel} required>
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
                <Field label={t.neighborhoodLabel} required>
                  <select
                    required
                    value={form.neighborhood}
                    onChange={(e) => update("neighborhood", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">{t.selectPlaceholder}</option>
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t.terraceTypeLabel}>
                  <div className="flex flex-col gap-2 pt-1">
                    {terraceTypes.map((tt) => (
                      <label
                        key={tt.value}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.terraceTypes.includes(tt.value)}
                          onChange={() => toggleTerraceType(tt.value)}
                          className="rounded accent-accent w-4 h-4"
                        />
                        {tt.label}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label={t.cuisineLabel}>
                  <input
                    type="text"
                    value={form.cuisineType}
                    onChange={(e) => update("cuisineType", e.target.value)}
                    placeholder={t.cuisinePlaceholder}
                    className={inputClass}
                  />
                </Field>

                <Field label={t.capacityLabel}>
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(e) => update("capacity", e.target.value)}
                    placeholder={t.capacityPlaceholder}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label={t.descriptionLabel}>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              {t.featuresSection}
            </h2>
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label={t.dogFriendlyCheck}
                checked={form.dogFriendly}
                onChange={(v) => update("dogFriendly", v)}
              />
              <Checkbox
                label={t.coveredCheck}
                checked={form.covered}
                onChange={(v) => update("covered", v)}
              />
              <Checkbox
                label={t.heatedCheck}
                checked={form.heated}
                onChange={(v) => update("heated", v)}
              />
            </div>
          </section>

          {/* Hours & Season */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              {t.hoursSection}
            </h2>
            <p className="text-xs text-muted mb-4 italic">
              {t.terraceHoursSubmitNote}
            </p>
            <div className="space-y-4">
              <HoursEditor value={hours} onChange={setHours} />
            </div>
          </section>

          {/* Images */}
          <section id="photos">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              {t.photosSection}
            </h2>
            <label className="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors text-center">
              <svg
                className="w-7 h-7 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-muted">
                {images.length === 0
                  ? t.uploadPhotos
                  : t.filesSelected(images.length)}
              </span>
              <span className="text-xs text-muted/60">{t.photoHint}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, 5);
                  setImages(files);
                }}
              />
            </label>
            {images.length > 0 && (
              <div className="mt-3 space-y-2">
                {/* Main photo — landscape */}
                <div className="relative group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-accent">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(images[0])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-accent text-white px-1.5 py-0.5 rounded font-medium leading-none">
                    {t.photoMainBadge}
                  </span>
                </div>
                {/* Additional photos — square thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {images.slice(1).map((f, i) => {
                      const idx = i + 1;
                      return (
                        <div key={idx} className="relative group">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(f)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setImages((prev) => [
                                prev[idx],
                                ...prev.filter((_, j) => j !== idx),
                              ])
                            }
                            className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg"
                          >
                            <span className="text-[10px] text-white font-medium leading-none bg-black/50 px-1.5 py-0.5 rounded">
                              {t.photoMakeMain}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              {t.contactSection}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.websiteLabel}>
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && !/^https?:\/\//i.test(v))
                        update("website", `https://${v}`);
                    }}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>
                <Field label={t.phoneLabel}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="514-000-0000"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label={t.instagramLabel}>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  placeholder="@terraceseason"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* Submitter */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              {t.aboutYouSection}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.yourNameLabel}>
                  <input
                    type="text"
                    value={form.submitterName}
                    onChange={(e) => update("submitterName", e.target.value)}
                    placeholder={t.yourNamePlaceholder}
                    className={inputClass}
                  />
                </Field>
                <Field label={t.yourEmailLabel}>
                  <input
                    type="email"
                    value={form.submitterEmail}
                    onChange={(e) => update("submitterEmail", e.target.value)}
                    placeholder={t.yourEmailPlaceholder}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label={t.yourRoleLabel}>
                <select
                  value={form.submitterRole}
                  onChange={(e) => update("submitterRole", e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t.preferNotSay}</option>
                  <option value="owner">{t.roleOwner}</option>
                  <option value="staff">{t.roleStaff}</option>
                  <option value="regular">{t.roleRegular}</option>
                  <option value="other">{t.roleOther}</option>
                </select>
              </Field>
            </div>
          </section>

          <button
            type="submit"
            disabled={state === "submitting"}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {state === "submitting"
              ? t.submitting
              : isEdit
                ? t.sendCorrection
                : t.submitTerrace}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitPageContent />
    </Suspense>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
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
