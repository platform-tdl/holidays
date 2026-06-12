import { MemberBalance } from "@/lib/types";
import Link from "next/link";

interface Props {
  balances: MemberBalance[];
  year: number;
}

const MEMBER_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

export function BalanceTable({ balances, year }: Props) {
  if (!balances.length) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center text-slate-500 shadow-sm">
        No hay datos de balance para {year}. Ejecuta el arrastre de año desde Admin.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
            <th className="px-4 py-3 font-bold text-slate-700">Nombre</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-500">Base</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-500">Acumulado</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-500">Comp. ganados</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-500">Total</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-500">Usados</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-500">Restante</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((b, i) => (
            <tr key={b.member_id} className="border-b border-slate-100/80 transition hover:bg-indigo-50/30">
              <td className="px-4 py-3">
                <Link href={`/persona/${b.slug}`} className="group flex items-center gap-2.5">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${MEMBER_COLORS[i % MEMBER_COLORS.length]}`}>
                    {b.name.charAt(0)}
                  </span>
                  <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition">{b.name}</span>
                </Link>
              </td>
              <td className="px-4 py-3 text-center text-slate-500">{b.base_days}</td>
              <td className="px-4 py-3 text-center text-slate-500">{b.carried_over_days}</td>
              <td className="px-4 py-3 text-center text-slate-500">{b.compensatory_earned}</td>
              <td className="px-4 py-3 text-center font-bold text-slate-800">{b.total_available}</td>
              <td className="px-4 py-3 text-center text-slate-500">{b.days_used}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-2.5 py-1 text-sm font-bold ${
                    b.remaining > 5
                      ? "bg-emerald-100 text-emerald-700"
                      : b.remaining > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
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
