"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DayTypeKey } from "@/lib/constants";

export async function addDayEntryAction(
  memberId: string,
  date: string,
  dayType: DayTypeKey,
  note?: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("day_entries")
    .insert({
      member_id: memberId,
      date,
      day_type: dayType,
      note: note || null,
    });
  if (error) throw new Error(error.message);
  revalidatePath("/calendario");
  revalidatePath("/balance");
}

export async function deleteDayEntryAction(entryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("day_entries")
    .delete()
    .eq("id", entryId);
  if (error) throw new Error(error.message);
  revalidatePath("/calendario");
  revalidatePath("/balance");
}

export async function updateCompensatoryAction(
  memberId: string,
  year: number,
  amount: number
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("yearly_balances")
    .update({ compensatory_earned: amount })
    .eq("member_id", memberId)
    .eq("year", year);
  if (error) throw new Error(error.message);
  revalidatePath("/balance");
  revalidatePath("/admin");
}

export async function runCarryoverAction(fromYear: number) {
  const supabase = await createClient();
  const { data: balances, error } = await supabase
    .from("member_balances")
    .select("*")
    .eq("year", fromYear);
  if (error) throw new Error(error.message);
  if (!balances?.length) throw new Error("No balances found for " + fromYear);

  const toYear = fromYear + 1;
  const newBalances = balances.map((b) => ({
    member_id: b.member_id,
    year: toYear,
    base_days: 22,
    carried_over_days: Math.max(0, b.remaining),
    compensatory_earned: 0,
  }));

  const { error: upsertError } = await supabase
    .from("yearly_balances")
    .upsert(newBalances, { onConflict: "member_id,year" });
  if (upsertError) throw new Error(upsertError.message);
  revalidatePath("/balance");
  revalidatePath("/admin");
}
