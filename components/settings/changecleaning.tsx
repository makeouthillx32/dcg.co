"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";
import { useTheme } from "@/app/provider";
import { Calendar, Check, Save, Building2, Loader2 } from "lucide-react";

/** ─────────────────────────────────────────
 *  Supabase set‑up
 *  ───────────────────────────────────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** columns that represent days (lower‑case DB) */
const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

type DayKey = (typeof days)[number];

type ScheduleRow = {
  id: number;
  week: number;
  business_id: number;
} & Record<DayKey, boolean>;

export default function ChangeCleaning() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  
  /* ─────────── state ─────────── */
  const [businesses, setBusinesses] = useState<
    { id: number; business_name: string }[]
  >([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ─────────── fetch businesses on mount ─────────── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("Businesses")
        .select("id, business_name")
        .order("business_name");
        
      if (error) toast.error(error.message);
      if (data) setBusinesses(data);
      setLoading(false);
    })();
  }, []);

  /* ─────────── load schedule for selected business ─────────── */
  const fetchSchedule = async (businessId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Schedule")
      .select(
        "id, week, business_id, monday, tuesday, wednesday, thursday, friday"
      )
      .eq("business_id", businessId)
      .order("week");

    if (error) toast.error(error.message);
    setSchedule((data as ScheduleRow[]) || []);
    setLoading(false);
  };

  /* ─────────── toggle helper ───────────
   *  Each week can have MULTIPLE cleaning days.
   *  Toggling a checkbox simply flips its boolean.
   *  ───────────────────────────────────────── */
  const toggleDay = (weekIndex: number, day: DayKey) => {
    setSchedule((prev) =>
      prev.map((row, i) =>
        i === weekIndex ? { ...row, [day]: !row[day] } : row
      )
    );
  };

  /* ─────────── persist edits ─────────── */
  const saveChanges = async () => {
    setLoading(true);

    const updates = schedule.map(async (row) => {
      const { id, ...fields } = row;
      const updatePayload: Partial<ScheduleRow> = {};
      days.forEach((d) => (updatePayload[d] = fields[d]));
      return supabase.from("Schedule").update(updatePayload).eq("id", id);
    });

    const results = await Promise.all(updates);
    const error = results.find((r) => r.error)?.error;
    if (error) toast.error(error.message);
    else toast.success("Schedule updated successfully!");

    setLoading(false);
  };

  /* ─────────── UI ─────────── */
  return (
    <div className={`p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] ${
      isDark 
        ? "bg-[hsl(var(--card))]" 
        : "bg-[hsl(var(--background))]"
    }`}>
      <h2 className="text-xl font-[var(--font-serif)] font-bold mb-6 flex items-center text-[hsl(var(--foreground))]">
        <Calendar className="mr-2 text-[hsl(var(--sidebar-primary))]" size={20} />
        Cleaning Schedule Assignment
      </h2>

      {/* Business selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))] mb-2">
          Select Business
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
            <Building2 size={16} />
          </span>
          <select
            className={`w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5] appearance-none ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelectedId(id);
              fetchSchedule(id);
            }}
            defaultValue=""
            disabled={loading}
          >
            <option value="" disabled>
              Select a business
            </option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.business_name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[hsl(var(--muted-foreground))]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--sidebar-primary))]" />
          <p className="mt-4 text-[hsl(var(--muted-foreground))] font-[var(--font-sans)]">
            Loading schedule...
          </p>
        </div>
      )}

      {!loading && schedule.length === 0 && selectedId && (
        <div className={`p-4 rounded-[var(--radius)] ${
          isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
        }`}>
          <p className="text-[hsl(var(--muted-foreground))] font-[var(--font-sans)] text-center">
            No schedule found for this business. Please check your database.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {schedule.map((weekData, index) => (
          <div
            key={weekData.id}
            className={`p-4 rounded-[var(--radius)] ${
              isDark 
                ? "bg-[hsl(var(--secondary))]" 
                : "bg-[hsl(var(--muted))]"
            } border border-[hsl(var(--border))]`}
          >
            <h3 className="font-[var(--font-sans)] font-semibold mb-3 text-lg text-[hsl(var(--sidebar-primary))]">
              Week {weekData.week}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {days.map((day) => (
                <label
                  key={day}
                  className={`flex items-center justify-between p-2 rounded-[var(--radius)] cursor-pointer select-none transition-colors ${
                    weekData[day]
                      ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                      : `${isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"} text-[hsl(var(--foreground))]`
                  }`}
                  onClick={() => toggleDay(index, day)}
                >
                  <span className="capitalize font-[var(--font-sans)]">{day.slice(0, 3)}</span>
                  {weekData[day] && <Check size={16} />}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedId && schedule.length > 0 && (
        <button
          className={`mt-6 px-6 py-2 flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] font-[var(--font-sans)] font-medium transition-colors hover:bg-[hsl(var(--sidebar-primary))]/90 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          onClick={saveChanges}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </button>
      )}
    </div>
  );
}