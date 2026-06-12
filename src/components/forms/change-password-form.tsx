"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/app/actions";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6) {
      setMessage({ type: "err", text: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }
    if (newPw !== confirm) {
      setMessage({ type: "err", text: "Las contraseñas no coinciden" });
      return;
    }
    startTransition(async () => {
      try {
        await changePasswordAction(current, newPw);
        setMessage({ type: "ok", text: "Contraseña actualizada" });
        setCurrent("");
        setNewPw("");
        setConfirm("");
      } catch (e) {
        setMessage({ type: "err", text: e instanceof Error ? e.message : "Error" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Contraseña actual</label>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Nueva contraseña</label>
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Confirmar nueva contraseña</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
      </div>
      {message && (
        <p className={`rounded-xl px-3 py-2 text-sm font-medium ${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </p>
      )}
      <button type="submit" disabled={isPending}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50">
        {isPending ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
