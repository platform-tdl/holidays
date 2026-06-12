"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { addBankHolidayAction, deleteBankHolidayAction } from "@/app/actions";
import { BankHoliday } from "@/lib/types";

interface Props {
  holidays: BankHoliday[];
  year: number;
}

export function BankHolidaysAdmin({ holidays, year }: Props) {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !name) return;
    setError("");
    startTransition(async () => {
      try {
        await addBankHolidayAction(date, name);
        setDate("");
        setName("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteBankHolidayAction(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      }
    });
  }

  const filtered = holidays.filter((h) => h.date.startsWith(String(year)));

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-800">Festivos ({year})</h2>
        <div className="flex gap-1">
          {[year - 1, year, year + 1].map((y) => (
            <a
              key={y}
              href={`/admin?holidayYear=${y}`}
              className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                y === year ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </div>

      {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      <form onSubmit={handleAdd} className="mb-4 flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: San Isidro"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
        >
          Añadir
        </button>
      </form>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-2 text-left font-bold text-slate-700">Fecha</th>
                <th className="px-4 py-2 text-left font-bold text-slate-700">Nombre</th>
                <th className="px-4 py-2 text-right font-bold text-slate-700"></th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((h) => (
                  <tr key={h.id} className="border-b border-slate-100/80 transition hover:bg-indigo-50/30">
                    <td className="px-4 py-2 font-medium capitalize text-slate-800">
                      {format(parseISO(h.date), "EEEE d MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{h.name}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(h.id)}
                        disabled={isPending}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center text-sm text-slate-500">
          No hay festivos para {year}
        </p>
      )}
    </div>
  );
}
