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
        className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
      <button
        onClick={handleSave}
        disabled={isPending || parseInt(value) === currentValue}
        className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-30"
      >
        {isPending ? "..." : "Guardar"}
      </button>
    </div>
  );
}
