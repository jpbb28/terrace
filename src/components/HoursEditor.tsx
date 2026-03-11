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

export function fromHourPeriods(periods: { day: number; open: string; close: string; is24h?: boolean }[]): DayHours[] {
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

// 30-minute increments, 12-hour display
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const label = `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    TIME_OPTIONS.push({ value, label });
  }
}

const selectClass =
  "text-sm bg-card border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-colors cursor-pointer";

interface Props {
  value: DayHours[];
  onChange: (v: DayHours[]) => void;
}

export default function HoursEditor({ value, onChange }: Props) {
  function update(i: number, patch: Partial<DayHours>) {
    onChange(value.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function copyToAll(i: number) {
    const src = value[i];
    onChange(value.map((_, idx) => (idx === i ? src : { ...src })));
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {DAYS.map((day, i) => {
        const d = value[i];
        return (
          <div key={day} className={`px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
            {/* Row 1: day name + toggle (+ "Closed" label if closed) */}
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm font-medium">{day}</span>

              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={d.open}
                onClick={() => update(i, { open: !d.open })}
                className={`relative shrink-0 w-10 h-6 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  d.open ? "bg-accent" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    d.open ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>

              {!d.open && <span className="text-sm text-muted">Closed</span>}
            </div>

            {/* Row 2: times + actions (only when open) */}
            {d.open && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-[calc(6rem+0.75rem)]">
                {d.is24h ? (
                  <span className="text-sm text-muted">Open 24 hours</span>
                ) : (
                  <>
                    <select
                      value={d.openTime}
                      onChange={(e) => update(i, { openTime: e.target.value })}
                      className={selectClass}
                    >
                      {TIME_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <span className="text-muted text-xs">—</span>
                    <select
                      value={d.closeTime}
                      onChange={(e) => update(i, { closeTime: e.target.value })}
                      className={selectClass}
                    >
                      {TIME_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => update(i, { is24h: !d.is24h })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    d.is24h
                      ? "bg-accent text-white border-accent"
                      : "border-border text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  24h
                </button>
                <button
                  type="button"
                  onClick={() => copyToAll(i)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-border text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer"
                >
                  Copy to all
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
