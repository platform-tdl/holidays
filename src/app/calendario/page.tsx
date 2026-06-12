import { createClient } from "@/lib/supabase/server";
import { getTeamMembers, getMonthEntries, getBankHolidays, getCurrentMember, getMemberBalances } from "@/lib/queries";
import { TeamCalendar } from "@/components/calendar/team-calendar";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { EXCLUDED_SLUGS } from "@/lib/constants";

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

  const balanceYear = monthStart.getFullYear();

  const [members, entries, bankHolidays, yearHolidays, currentMember, balances] = await Promise.all([
    getTeamMembers(supabase),
    getMonthEntries(supabase, startStr, endStr),
    getBankHolidays(supabase, startStr, endStr),
    getBankHolidays(supabase, `${year}-01-01`, `${year}-12-31`),
    getCurrentMember(supabase),
    getMemberBalances(supabase, balanceYear),
  ]);

  const currentSlug = members.find((m) => m.id === currentMember?.id)?.slug;
  const isExcluded = currentSlug ? EXCLUDED_SLUGS.has(currentSlug) : false;

  const slugById = new Map(members.map((m) => [m.id, m.slug]));
  const remainingMap: Record<string, number> = {};
  if (isExcluded) {
    const own = balances.find((b) => b.member_id === currentMember?.id);
    if (own) remainingMap[own.member_id] = own.remaining;
  } else {
    balances.forEach((b) => {
      const slug = slugById.get(b.member_id);
      if (!slug || !EXCLUDED_SLUGS.has(slug)) remainingMap[b.member_id] = b.remaining;
    });
  }

  return (
    <TeamCalendar
      members={members}
      entries={entries}
      bankHolidays={bankHolidays}
      allBankHolidayDates={yearHolidays.map((h) => h.date)}
      year={year}
      month={month}
      currentMemberId={currentMember?.id}
      isAdmin={currentMember?.is_admin}
      remainingByMember={remainingMap}
    />
  );
}
