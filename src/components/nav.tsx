"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/calendario", label: "Calendario" },
  { href: "/balance", label: "Balance" },
  { href: "/admin", label: "Admin" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-8">
        <Link href="/" className="text-lg font-bold text-slate-900">
          TDL Vacaciones
        </Link>
        <div className="flex gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
