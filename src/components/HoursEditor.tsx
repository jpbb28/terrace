"use client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type DayHours = {
  open: boolean;
  is24h: boolean;
  openTime: string;
  closeTime: string;
};

export function defaultHours(): DayHours[] {
  return DAYS.map(() => ({ open: false, is24h: false, openTime: "11:00", closeTime: "22:00" }));
}

export function fromHourPeriods(
  periods: { day: number; open: string; close: string; is24h?: boolean }[]
): DayHours[] {
  const days = defaultHours();
  for (const p of periods) {
    days[p.day] = { open: true, is24h: p.is24h ?? false, openTime: p.open, closeTime: p.close };
  }
  return days;
}

export function toHourPeriods(days: DayHours[]) {
  return days.flatMap((d, i) => {
    if (!d.open) return [];
    return [{ day: i, open: d.openTime, close: d.closeTime, ...(d.is24h ? { is24h: true } : {}) }];
  });
}

// 30-min increments, 6 AM – 11:30 PM
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 6; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h > 12 ? h - 12 : h;
    TIME_OPTIONS.push({ value, label: `${h12}:${String(m).padStart(2, "0")} ${ampm}` });
  }
}

interface Props {
  value: DayHours[];
  onChange: (v: DayHours[]) => void;
}

export default function HoursEditor({ value, onChange }: Props) {
  function update(i: number, patch: Partial<DayHours>) {
    onChange(value.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
      {DAYS.map((day, i) => {
        const d = value[i];
        return (
          <div key={day} className="px-4 py-3">

            {/* ── Row 1: day name + toggle (always visible) ── */}
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm font-medium">{day}</span>

              {/* Toggle — no transforms, left positioning only */}
              <button
                type="button"
                role="switch"
                aria-checked={d.open}
                onClick={() => update(i, { open: !d.open })}
                className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  d.open ? "bg-accent" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                    d.open ? "left-6" : "left-1"
                  }`}
                />
              </button>

              {/* Closed label */}
              {!d.open && (
                <span className="text-sm text-muted">Closed</span>
              )}

              {/* ── Desktop only: times + actions inline ── */}
              {d.open && (
                <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0">
                  {d.is24h ? (
                    <span className="text-sm text-muted">Open 24 hours</span>
                  ) : (
                    <>
                      <TimeSelect value={d.openTime} onChange={(v) => update(i, { openTime: v })} />
                      <span className="text-muted text-xs shrink-0">—</span>
                      <TimeSelect value={d.closeTime} onChange={(v) => update(i, { closeTime: v })} />
                    </>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto shrink-0">
                    <Pill active={d.is24h} onClick={() => update(i, { is24h: !d.is24h })}>24h</Pill>
                    <Pill onClick={() => {
                      const src = value[i];
                      onChange(value.map((_, idx) => (idx === i ? src : { ...src })));
                    }}>Copy to all</Pill>
                  </div>
                </div>
              )}
            </div>

            {/* ── Mobile only: times + actions on second row ── */}
            {d.open && (
              <div className="sm:hidden mt-2.5 flex items-center gap-2 flex-wrap pl-[calc(5rem+0.75rem)]">
                {d.is24h ? (
                  <span className="text-sm text-muted">Open 24 hours</span>
                ) : (
                  <>
                    <TimeSelect value={d.openTime} onChange={(v) => update(i, { openTime: v })} />
                    <span className="text-muted text-xs shrink-0">—</span>
                    <TimeSelect value={d.closeTime} onChange={(v) => update(i, { closeTime: v })} />
                  </>
                )}
                <Pill active={d.is24h} onClick={() => update(i, { is24h: !d.is24h })}>24h</Pill>
                <Pill onClick={() => {
                  const src = value[i];
                  onChange(value.map((_, idx) => (idx === i ? src : { ...src })));
                }}>Copy to all</Pill>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-card border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-colors cursor-pointer"
    >
      {TIME_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Pill({
  children,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
        active
          ? "bg-accent text-white border-accent"
          : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
