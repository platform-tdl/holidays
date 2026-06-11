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
      className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? "..." : "Eliminar"}
    </button>
  );
}
