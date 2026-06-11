"use client";

import { useState, useTransition } from "react";
import { runCarryoverAction } from "@/app/actions";

export function CarryoverButton({ fromYear }: { fromYear: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string>("");

  function handleClick() {
    if (!confirm(`¿Arrastrar saldos de ${fromYear} a ${fromYear + 1}?`)) return;
    setResult("");
    startTransition(async () => {
      try {
        await runCarryoverAction(fromYear);
        setResult(`Arrastre ${fromYear} → ${fromYear + 1} completado`);
      } catch (e) {
        setResult(e instanceof Error ? e.message : "Error");
      }
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {isPending ? "Procesando..." : `${fromYear} → ${fromYear + 1}`}
      </button>
      {result && <p className="mt-2 text-xs text-green-700">{result}</p>}
    </div>
  );
}
