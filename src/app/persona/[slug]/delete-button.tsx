"use client";

import { useTransition } from "react";
import { deleteDayEntryAction } from "@/app/actions";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("¿Eliminar este día?")) return;
        startTransition(() => deleteDayEntryAction(entryId));
      }}
      disabled={isPending}
      className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? "..." : "Eliminar"}
    </button>
  );
}
