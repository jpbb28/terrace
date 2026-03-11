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
          <div
            key={day}
            className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
          >
            {/* Day name */}
            <span className="w-24 text-sm shrink-0 font-medium">{day}</span>

            {/* Open/closed toggle */}
            <button
              type="button"
              onClick={() => update(i, { open: !d.open })}
              className={`relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${
                d.open ? "bg-accent" : "bg-foreground/20"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  d.open ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>

            {d.open ? (
              <>
                {d.is24h ? (
                  <span className="text-sm text-muted flex-1">Open 24 hours</span>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={d.openTime}
                      onChange={(e) => update(i, { openTime: e.target.value })}
                      className="text-sm bg-card border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-colors"
                    />
                    <span className="text-muted text-xs shrink-0">—</span>
                    <input
                      type="time"
                      value={d.closeTime}
                      onChange={(e) => update(i, { closeTime: e.target.value })}
                      className="text-sm bg-card border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => update(i, { is24h: !d.is24h })}
                    className="text-xs text-muted hover:text-accent transition-colors"
                    title="Toggle 24 hours"
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToAll(i)}
                    className="text-xs text-muted hover:text-accent transition-colors"
                    title="Copy to all days"
                  >
                    Copy all
                  </button>
                </div>
              </>
            ) : (
              <span className="text-sm text-muted flex-1">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
