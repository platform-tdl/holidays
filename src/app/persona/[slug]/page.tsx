import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DAY_TYPES, DayTypeKey } from "@/lib/constants";
import { DeleteEntryButton } from "./delete-button";

export default async function PersonaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const year = sp.year ? parseInt(sp.year) : new Date().getFullYear();

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("team_members")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!member) notFound();

  const { data: balance } = await supabase
    .from("member_balances")
    .select("*")
    .eq("member_id", member.id)
    .eq("year", year)
    .single();

  const { data: entries } = await supabase
    .from("day_entries")
    .select("*")
    .eq("member_id", member.id)
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`)
    .order("date");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>

      {balance ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total disponible", value: balance.total_available, color: "text-slate-900" },
            { label: "Vacaciones usadas", value: balance.vacation_used, color: "text-blue-600" },
            { label: "Comp. usados", value: balance.compensatory_used, color: "text-amber-600" },
            {
              label: "Restante",
              value: balance.remaining,
              color: balance.remaining > 5 ? "text-green-600" : balance.remaining > 0 ? "text-amber-600" : "text-red-600",
            },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">{card.label}</div>
              <div className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No hay balance para {year}</p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Días registrados en {year}</h2>
        <div className="flex gap-1">
          {[2024, 2025, 2026, 2027].map((y) => (
            <a
              key={y}
              href={`/persona/${slug}?year=${y}`}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                y === year ? "bg-blue-600 text-white" : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </div>

      {entries && entries.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Fecha</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Tipo</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Nota</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const style = DAY_TYPES[entry.day_type as DayTypeKey];
                return (
                  <tr key={entry.id} className="border-b border-slate-100">
                    <td className="px-4 py-2 capitalize text-slate-800">
                      {format(parseISO(entry.date), "EEEE d MMM", { locale: es })}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.color} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{entry.note || "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <DeleteEntryButton entryId={entry.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No hay días registrados en {year}</p>
      )}
    </div>
  );
}
