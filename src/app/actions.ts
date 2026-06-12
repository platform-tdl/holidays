"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DayTypeKey } from "@/lib/constants";
import { getCurrentMember } from "@/lib/queries";

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  memberId: string,
  action: string,
  details: Record<string, unknown>
) {
  await supabase
    .from("activity_log")
    .insert({ actor_id: actorId, member_id: memberId, action, details });
}

function isPastMonth(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() < now.getFullYear() ||
    (date.getFullYear() === now.getFullYear() && date.getMonth() < now.getMonth())
  );
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("No autorizado");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) throw new Error("La contraseña actual no es correcta");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function addDayRangeAction(
  memberId: string,
  startDate: string,
  endDate: string,
  dayType: DayTypeKey,
  bankHolidayDates: string[],
  note?: string
) {
  const supabase = await createClient();
  const actor = await getCurrentMember(supabase);
  if (!actor) throw new Error("No autorizado");

  const holidaySet = new Set(bankHolidayDates);
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const day = current.getDay();
    const dateStr = current.toISOString().split("T")[0];
    if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) {
      dates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  if (!dates.length) throw new Error("No hay días laborables en el rango seleccionado");

  if (dates.some((d) => isPastMonth(d)) && !actor.is_admin) {
    throw new Error("No se pueden añadir días en meses pasados");
  }

  const rows = dates.map((d) => ({
    member_id: memberId,
    date: d,
    day_type: dayType,
    note: note || null,
  }));

  const { error } = await supabase.from("day_entries").insert(rows);
  if (error) throw new Error(error.message);

  for (const d of dates) {
    await logActivity(supabase, actor.id, memberId, "add_day", {
      date: d,
      day_type: dayType,
      note: note || null,
    });
  }

  revalidatePath("/calendario");
  revalidatePath("/balance");
  return dates.length;
}

export async function addDayEntryAction(
  memberId: string,
  date: string,
  dayType: DayTypeKey,
  note?: string
) {
  const supabase = await createClient();
  const actor = await getCurrentMember(supabase);
  if (!actor) throw new Error("No autorizado");

  if (isPastMonth(date) && !actor.is_admin) {
    throw new Error("No se pueden añadir días en meses pasados");
  }

  const { error } = await supabase
    .from("day_entries")
    .insert({
      member_id: memberId,
      date,
      day_type: dayType,
      note: note || null,
    });
  if (error) throw new Error(error.message);

  await logActivity(supabase, actor.id, memberId, "add_day", {
    date,
    day_type: dayType,
    note: note || null,
  });

  revalidatePath("/calendario");
  revalidatePath("/balance");
}

export async function deleteDayEntryAction(entryId: string) {
  const supabase = await createClient();
  const actor = await getCurrentMember(supabase);
  if (!actor) throw new Error("No autorizado");

  const { data: entry } = await supabase
    .from("day_entries")
    .select("*")
    .eq("id", entryId)
    .single();

  if (!entry) throw new Error("Entrada no encontrada");

  if (isPastMonth(entry.date) && !actor.is_admin) {
    throw new Error("No se pueden eliminar días de meses pasados");
  }

  const { error } = await supabase
    .from("day_entries")
    .delete()
    .eq("id", entryId);
  if (error) throw new Error(error.message);

  await logActivity(supabase, actor.id, entry.member_id, "delete_day", {
    date: entry.date,
    day_type: entry.day_type,
    note: entry.note,
  });

  revalidatePath("/calendario");
  revalidatePath("/balance");
}

export async function updateCompensatoryAction(
  memberId: string,
  year: number,
  amount: number
) {
  const supabase = await createClient();
  const actor = await getCurrentMember(supabase);
  if (!actor?.is_admin) throw new Error("Solo administradores");

  const { data: current } = await supabase
    .from("yearly_balances")
    .select("compensatory_earned")
    .eq("member_id", memberId)
    .eq("year", year)
    .single();

  const oldValue = current?.compensatory_earned ?? 0;

  const { error } = await supabase
    .from("yearly_balances")
    .update({ compensatory_earned: amount })
    .eq("member_id", memberId)
    .eq("year", year);
  if (error) throw new Error(error.message);

  await logActivity(supabase, actor.id, memberId, "update_compensatory", {
    year,
    old_value: oldValue,
    new_value: amount,
  });

  revalidatePath("/balance");
  revalidatePath("/admin");
}

export async function addBankHolidayAction(date: string, name: string) {
  const supabase = await createClient();
  const actor = await getCurrentMember(supabase);
  if (!actor?.is_admin) throw new Error("Solo administradores");

  const { error } = await supabase.from("bank_holidays").insert({ date, name });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/calendario");
}

export async function deleteBankHolidayAction(id: string) {
  const supabase = await createClient();
  const actor = await getCurrentMember(supabase);
  if (!actor?.is_admin) throw new Error("Solo administradores");

  const { error } = await supabase.from("bank_holidays").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/calendario");
}

export async function runCarryoverAction(fromYear: number) {
  const supabase = await createClient();
  const actor = await getCurrentMember(supabase);
  if (!actor?.is_admin) throw new Error("Solo administradores");

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

  for (const b of balances) {
    await logActivity(supabase, actor.id, b.member_id, "carryover", {
      from_year: fromYear,
      to_year: toYear,
      remaining: b.remaining,
      carried: Math.max(0, b.remaining),
    });
  }

  revalidatePath("/balance");
  revalidatePath("/admin");
}
