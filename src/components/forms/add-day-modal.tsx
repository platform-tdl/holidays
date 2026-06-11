"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DayEntry } from "@/lib/types";
import { DAY_TYPE_OPTIONS, DayTypeKey } from "@/lib/constants";
import { addDayEntryAction, deleteDayEntryAction } from "@/app/actions";

interface Props {
  memberId: string;
  memberName: string;
  date: string;
  existingEntry?: DayEntry;
  onClose: () => void;
}

export function AddDayModal({ memberId, memberName, date, existingEntry, onClose }: Props) {
  const [dayType, setDayType] = useState<DayTypeKey>(existingEntry?.day_type ?? "vacaciones");
  const [note, setNote] = useState(existingEntry?.note ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const formattedDate = format(parseISO(date), "EEEE d 'de' MMMM yyyy", { locale: es });

  function handleAdd() {
    setError("");
    startTransition(async () => {
      try {
        await addDayEntryAction(memberId, date, dayType, note);
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-900">{memberName}</h3>
        <p className="mt-1 text-sm capitalize text-slate-500">{formattedDate}</p>

        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {existingEntry ? (
          <div className="mt-6">
            <p className="text-sm text-slate-600">
              Este día tiene registrado: <strong>{DAY_TYPE_OPTIONS.find(o => o.value === existingEntry.day_type)?.label}</strong>
            </p>
            {existingEntry.note && <p className="mt-1 text-sm text-slate-500">Nota: {existingEntry.note}</p>}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Borrando..." : "Eliminar"}
              </button>
              <button onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value as DayTypeKey)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {DAY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nota (opcional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Motivo, comentario..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
