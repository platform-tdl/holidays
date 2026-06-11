import { createClient } from "@/lib/supabase/server";
import { getTeamMembers, getMemberBalances, getCurrentMember } from "@/lib/queries";
import { CompensatoryForm } from "./compensatory-form";
import { CarryoverButton } from "./carryover-button";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const currentMember = await getCurrentMember(supabase);
  if (!currentMember?.is_admin) redirect("/calendario");

  const year = new Date().getFullYear();
  const [members, balances] = await Promise.all([
    getTeamMembers(supabase),
    getMemberBalances(supabase, year),
  ]);

  const balanceMap = new Map(balances.map((b) => [b.member_id, b]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestión de días compensatorios y arrastre de año
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Días compensatorios ganados ({year})
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Nombre</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Comp. ganados</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const balance = balanceMap.get(m.id);
                return (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-800">{m.name}</td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {balance?.compensatory_earned ?? 0}
                    </td>
                    <td className="px-4 py-2 text-center">
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
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Arrastre de año</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
    </div>
  );
}
