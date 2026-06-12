"use client";

import { useState, useTransition } from "react";
import { updateCompensatoryAction } from "@/app/actions";

interface Props {
  memberId: string;
  year: number;
  currentValue: number;
}

export function CompensatoryForm({ memberId, year, currentValue }: Props) {
  const [value, setValue] = useState(currentValue.toString());
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return;
    startTransition(() => updateCompensatoryAction(memberId, year, num));
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-sm font-medium transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
      />
      <button
        onClick={handleSave}
        disabled={isPending || parseInt(value) === currentValue}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-30"
      >
        {isPending ? "..." : "Guardar"}
      </button>
    </div>
  );
}
