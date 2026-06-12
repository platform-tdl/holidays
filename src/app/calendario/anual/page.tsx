import { createClient } from "@/lib/supabase/server";
import { getTeamMembers, getMonthEntries, getBankHolidays, getCurrentMember } from "@/lib/queries";
import { AnnualCalendar } from "@/components/calendar/annual-calendar";

export default async function AnualPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();

  const supabase = await createClient();
  const startStr = `${year}-01-01`;
  const endStr = `${year}-12-31`;

  const [members, entries, bankHolidays, currentMember] = await Promise.all([
    getTeamMembers(supabase),
    getMonthEntries(supabase, startStr, endStr),
    getBankHolidays(supabase, startStr, endStr),
    getCurrentMember(supabase),
  ]);

  return (
    <AnnualCalendar
      members={members}
      entries={entries}
      bankHolidays={bankHolidays}
      year={year}
      currentMemberId={currentMember?.id}
    />
  );
}
