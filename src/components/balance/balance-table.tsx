import { MemberBalance } from "@/lib/types";
import Link from "next/link";

interface Props {
  balances: MemberBalance[];
  year: number;
}

export function BalanceTable({ balances, year }: Props) {
  if (!balances.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        No hay datos de balance para {year}. Ejecuta el arrastre de año desde Admin.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-4 py-3 font-semibold text-slate-700">Nombre</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Base</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Acumulado</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Comp. ganados</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Total disponible</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Vacaciones usadas</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Comp. usados</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">Restante</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((b) => (
            <tr key={b.member_id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-medium text-slate-800">
                <Link href={`/persona/${b.slug}`} className="hover:text-blue-600 hover:underline">
                  {b.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-center text-slate-600">{b.base_days}</td>
              <td className="px-4 py-3 text-center text-slate-600">{b.carried_over_days}</td>
              <td className="px-4 py-3 text-center text-slate-600">{b.compensatory_earned}</td>
              <td className="px-4 py-3 text-center font-semibold text-slate-800">{b.total_available}</td>
              <td className="px-4 py-3 text-center text-slate-600">{b.vacation_used}</td>
              <td className="px-4 py-3 text-center text-slate-600">{b.compensatory_used}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex min-w-[2rem] items-center justify-center rounded-full px-2 py-0.5 text-sm font-bold ${
                    b.remaining > 5
                      ? "bg-green-100 text-green-800"
                      : b.remaining > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {b.remaining}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
