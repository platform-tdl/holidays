"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface LogEntry {
  id: string;
  created_at: string;
  action: string;
  actor_name: string;
  member_name: string;
  details: Record<string, unknown>;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  add_day: { label: "Añadió día", color: "bg-blue-100 text-blue-700" },
  delete_day: { label: "Eliminó día", color: "bg-red-100 text-red-700" },
  update_compensatory: { label: "Comp. actualizado", color: "bg-amber-100 text-amber-700" },
  carryover: { label: "Arrastre", color: "bg-indigo-100 text-indigo-700" },
};

function formatDetails(action: string, details: Record<string, unknown>): string {
  switch (action) {
    case "add_day":
      return `${details.date} — ${details.day_type}${details.note ? ` (${details.note})` : ""}`;
    case "delete_day":
      return `${details.date} — ${details.day_type}`;
    case "update_compensatory":
      return `${details.year}: ${details.old_value} → ${details.new_value} días`;
    case "carryover":
      return `${details.from_year} → ${details.to_year}: ${details.carried} días arrastrados`;
    default:
      return JSON.stringify(details);
  }
}

export function ActivityLog({ entries }: { entries: LogEntry[] }) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-500">
        No hay actividad registrada todavía
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-2.5 text-left font-bold text-slate-700">Fecha</th>
              <th className="px-4 py-2.5 text-left font-bold text-slate-700">Acción</th>
              <th className="px-4 py-2.5 text-left font-bold text-slate-700">Quién</th>
              <th className="px-4 py-2.5 text-left font-bold text-slate-700">A quién</th>
              <th className="px-4 py-2.5 text-left font-bold text-slate-700">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const actionStyle = ACTION_LABELS[entry.action] ?? { label: entry.action, color: "bg-slate-100 text-slate-700" };
              return (
                <tr key={entry.id} className="border-b border-slate-100/80 transition hover:bg-indigo-50/30">
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-500">
                    {format(parseISO(entry.created_at), "d MMM HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${actionStyle.color}`}>
                      {actionStyle.label}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-700">{entry.actor_name}</td>
                  <td className="px-4 py-2 text-slate-600">{entry.member_name}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {formatDetails(entry.action, entry.details)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
