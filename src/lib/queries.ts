import { SupabaseClient } from "@supabase/supabase-js";
import { DayTypeKey } from "./constants";

export async function getTeamMembers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
}

export async function getMonthEntries(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("day_entries")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);
  if (error) throw error;
  return data;
}

export async function getBankHolidays(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("bank_holidays")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);
  if (error) throw error;
  return data;
}

export async function getMemberBalances(
  supabase: SupabaseClient,
  year: number
) {
  const { data, error } = await supabase
    .from("member_balances")
    .select("*")
    .eq("year", year);
  if (error) throw error;
  return data;
}

export async function addDayEntry(
  supabase: SupabaseClient,
  memberId: string,
  date: string,
  dayType: DayTypeKey,
  note?: string
) {
  const { data, error } = await supabase
    .from("day_entries")
    .insert({ member_id: memberId, date, day_type: dayType, note: note || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDayEntry(
  supabase: SupabaseClient,
  entryId: string
) {
  const { error } = await supabase
    .from("day_entries")
    .delete()
    .eq("id", entryId);
  if (error) throw error;
}

export async function updateCompensatoryEarned(
  supabase: SupabaseClient,
  memberId: string,
  year: number,
  amount: number
) {
  const { error } = await supabase
    .from("yearly_balances")
    .update({ compensatory_earned: amount })
    .eq("member_id", memberId)
    .eq("year", year);
  if (error) throw error;
}

export async function getMemberEntries(
  supabase: SupabaseClient,
  memberId: string,
  year: number
) {
  const { data, error } = await supabase
    .from("day_entries")
    .select("*")
    .eq("member_id", memberId)
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`)
    .order("date");
  if (error) throw error;
  return data;
}
