import { createClient } from "@/lib/supabase/server";
import { getTeamMembers, getMemberBalances, getCurrentMember, getActivityLog, getBankHolidays } from "@/lib/queries";
import { CompensatoryForm } from "./compensatory-form";
import { CarryoverButton } from "./carryover-button";
import { ActivityLog } from "./activity-log";
import { BankHolidaysAdmin } from "./bank-holidays-admin";
import { redirect } from "next/navigation";
import { EXCLUDED_SLUGS } from "@/lib/constants";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ holidayYear?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const currentMember = await getCurrentMember(supabase);
  if (!currentMember?.is_admin) redirect("/calendario");

  const year = new Date().getFullYear();
  const holidayYear = params.holidayYear ? parseInt(params.holidayYear) : year;

  const [members, balances, activityLog, bankHolidays] = await Promise.all([
    getTeamMembers(supabase),
    getMemberBalances(supabase, year),
    getActivityLog(supabase, 100),
    getBankHolidays(supabase, `${holidayYear}-01-01`, `${holidayYear}-12-31`),
  ]);

  const filteredMembers = members.filter((m) => !EXCLUDED_SLUGS.has(m.slug));
  const balanceMap = new Map(balances.map((b) => [b.member_id, b]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestión de días compensatorios, festivos, arrastre de año y registro de actividad
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Días compensatorios ganados ({year})
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-2.5 text-left font-bold text-slate-700">Nombre</th>
                <th className="px-4 py-2.5 text-center font-bold text-slate-700">Comp. ganados</th>
                <th className="px-4 py-2.5 text-center font-bold text-slate-700">Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => {
                const balance = balanceMap.get(m.id);
                return (
                  <tr key={m.id} className="border-b border-slate-100/80 transition hover:bg-indigo-50/30">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{m.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-sm font-bold text-amber-700">
                        {balance?.compensatory_earned ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <CompensatoryForm
                        memberId={m.id}
                        year={year}
                        currentValue={balance?.compensatory_earned ?? 0}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <BankHolidaysAdmin holidays={bankHolidays} year={holidayYear} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-800">Arrastre de año</h2>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-slate-600">
            Calcula los días restantes de cada persona en un año y los arrastra como
            acumulado al año siguiente. Esta acción es idempotente (se puede ejecutar varias veces).
          </p>
          <div className="flex gap-3">
            <CarryoverButton fromYear={2025} />
            <CarryoverButton fromYear={2026} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-800">Registro de actividad</h2>
        <ActivityLog entries={activityLog} />
      </section>
    </div>
  );
}
