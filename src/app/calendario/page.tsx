import { createClient } from "@/lib/supabase/server";
import { getTeamMembers, getMonthEntries, getBankHolidays } from "@/lib/queries";
import { TeamCalendar } from "@/components/calendar/team-calendar";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) - 1 : now.getMonth();

  const supabase = await createClient();
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const startStr = format(monthStart, "yyyy-MM-dd");
  const endStr = format(monthEnd, "yyyy-MM-dd");

  const [members, entries, bankHolidays] = await Promise.all([
    getTeamMembers(supabase),
    getMonthEntries(supabase, startStr, endStr),
    getBankHolidays(supabase, startStr, endStr),
  ]);

  return (
    <TeamCalendar
      members={members}
      entries={entries}
      bankHolidays={bankHolidays}
      year={year}
      month={month}
    />
  );
}
