import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DAY_TYPES, DayTypeKey } from "@/lib/constants";
import { DeleteEntryButton } from "./delete-button";
import { ChangePasswordForm } from "@/components/forms/change-password-form";

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

  const currentMember = await getCurrentMember(supabase);
  const isOwnProfile = currentMember?.id === member.id;

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

  const cards = [
    { label: "Total disponible", value: balance?.total_available ?? 0, icon: "📋", gradient: "from-slate-50 to-slate-100/50", accent: "text-slate-900" },
    { label: "Días usados", value: balance?.days_used ?? 0, icon: "🏖️", gradient: "from-blue-50 to-blue-100/50", accent: "text-blue-600" },
    {
      label: "Restante",
      value: balance?.remaining ?? 0,
      icon: "✨",
      gradient: (balance?.remaining ?? 0) > 5 ? "from-emerald-50 to-emerald-100/50" : (balance?.remaining ?? 0) > 0 ? "from-amber-50 to-amber-100/50" : "from-red-50 to-red-100/50",
      accent: (balance?.remaining ?? 0) > 5 ? "text-emerald-600" : (balance?.remaining ?? 0) > 0 ? "text-amber-600" : "text-red-600",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
          {member.name.charAt(0)}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
          <p className="text-sm text-slate-500">Balance {year}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-2xl border border-slate-200/80 bg-gradient-to-br ${card.gradient} p-4 shadow-sm`}>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <span>{card.icon}</span>
              {card.label}
            </div>
            <div className={`mt-1 text-3xl font-bold ${card.accent}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800">Días registrados en {year}</h2>
        <div className="flex gap-1">
          {[2024, 2025, 2026, 2027].map((y) => (
            <a
              key={y}
              href={`/persona/${slug}?year=${y}`}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                y === year
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm"
                  : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </div>

      {entries && entries.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-2.5 text-left font-bold text-slate-700">Fecha</th>
                <th className="px-4 py-2.5 text-left font-bold text-slate-700">Tipo</th>
                <th className="px-4 py-2.5 text-left font-bold text-slate-700">Nota</th>
                <th className="px-4 py-2.5 text-right font-bold text-slate-700"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const style = DAY_TYPES[entry.day_type as DayTypeKey];
                return (
                  <tr key={entry.id} className="border-b border-slate-100/80 transition hover:bg-indigo-50/30">
                    <td className="px-4 py-2.5 capitalize text-slate-800 font-medium">
                      {format(parseISO(entry.date), "EEEE d MMM", { locale: es })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${style.soft}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{entry.note || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <DeleteEntryButton entryId={entry.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-500">
          No hay días registrados en {year}
        </p>
      )}
      {isOwnProfile && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Cambiar contraseña</h2>
          <div className="max-w-sm rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </div>
  );
}
