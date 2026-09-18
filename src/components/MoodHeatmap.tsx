import { cn } from "@/lib/utils";

type MoodPoint = { checkinDate: string; moodLevel: number };

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-destructive/70",
  2: "bg-destructive/35",
  3: "bg-muted-foreground/30",
  4: "bg-primary/50",
  5: "bg-primary",
};

export function MoodHeatmap({ data, days = 84 }: { data: MoodPoint[]; days?: number }) {
  const byDate = new Map(data.map((d) => [d.checkinDate, d.moodLevel]));

  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const endDow = todayUTC.getUTCDay();
  const end = new Date(todayUTC);
  end.setUTCDate(end.getUTCDate() + (6 - endDow));
  const totalDays = Math.ceil(days / 7) * 7;
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - totalDays + 1);

  const weeks: { key: string; date: Date; level?: number }[][] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const week: (typeof weeks)[number] = [];
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10);
      week.push({ key, date: new Date(cursor), level: byDate.get(key) });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto pb-1">
        <div className="flex w-fit gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => {
                const isFuture = day.date > todayUTC;
                return (
                  <div
                    key={day.key}
                    title={day.key}
                    className={cn(
                      "size-4 rounded-sm",
                      isFuture ? "bg-transparent" : day.level ? LEVEL_COLORS[day.level] : "bg-muted",
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Low</span>
        {[1, 2, 3, 4, 5].map((l) => (
          <div key={l} className={cn("size-3 rounded-sm", LEVEL_COLORS[l])} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}
