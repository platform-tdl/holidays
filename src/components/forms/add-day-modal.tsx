"use client";

import { useState, useTransition } from "react";
import { format, parseISO, eachDayOfInterval, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { DayEntry } from "@/lib/types";
import { DAY_TYPE_OPTIONS, DAY_TYPES, DayTypeKey } from "@/lib/constants";
import { addDayEntryAction, addDayRangeAction, deleteDayEntryAction } from "@/app/actions";

interface Props {
  memberId: string;
  memberName: string;
  date: string;
  existingEntry?: DayEntry;
  bankHolidayDates?: string[];
  onClose: () => void;
}

function countWorkdays(start: string, end: string, holidays: Set<string>): number {
  if (!start || !end || end < start) return 0;
  return eachDayOfInterval({ start: parseISO(start), end: parseISO(end) })
    .filter((d) => !isWeekend(d) && !holidays.has(format(d, "yyyy-MM-dd")))
    .length;
}

export function AddDayModal({ memberId, memberName, date, existingEntry, bankHolidayDates = [], onClose }: Props) {
  const [dayType, setDayType] = useState<DayTypeKey>(existingEntry?.day_type ?? "vacaciones");
  const [note, setNote] = useState(existingEntry?.note ?? "");
  const [endDate, setEndDate] = useState(date);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const holidaySet = new Set(bankHolidayDates);
  const formattedDate = format(parseISO(date), "EEEE d 'de' MMMM yyyy", { locale: es });
  const isRange = endDate > date;
  const workdays = isRange ? countWorkdays(date, endDate, holidaySet) : 1;

  function handleAdd() {
    setError("");
    startTransition(async () => {
      try {
        if (isRange) {
          const count = await addDayRangeAction(memberId, date, endDate, dayType, bankHolidayDates, note);
          onClose();
        } else {
          await addDayEntryAction(memberId, date, dayType, note);
          onClose();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  function handleDelete() {
    if (!existingEntry) return;
    startTransition(async () => {
      try {
        await deleteDayEntryAction(existingEntry.id);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al borrar");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600">
            {memberName.charAt(0)}
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{memberName}</h3>
            <p className="text-sm capitalize text-slate-500">{formattedDate}</p>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{error}</p>}

        {existingEntry ? (
          <div className="mt-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Día registrado como{" "}
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${DAY_TYPES[existingEntry.day_type as DayTypeKey].soft}`}>
                  {DAY_TYPE_OPTIONS.find(o => o.value === existingEntry.day_type)?.label}
                </span>
              </p>
              {existingEntry.note && <p className="mt-2 text-sm text-slate-500">Nota: {existingEntry.note}</p>}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md disabled:opacity-50"
              >
                {isPending ? "Borrando..." : "Eliminar"}
              </button>
              <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:shadow-sm">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tipo</label>
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value as DayTypeKey)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              >
                {DAY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Desde</label>
                <input
                  type="date"
                  value={date}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Hasta</label>
                <input
                  type="date"
                  value={endDate}
                  min={date}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                />
              </div>
            </div>
            {isRange && (
              <p className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                {workdays} día{workdays !== 1 ? "s" : ""} laborable{workdays !== 1 ? "s" : ""} (sin fines de semana ni festivos)
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nota (opcional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Motivo, comentario..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
              >
                {isPending ? "Guardando..." : isRange ? `Guardar ${workdays} días` : "Guardar"}
              </button>
              <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
