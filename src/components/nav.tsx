import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries";
import { LogoutButton } from "./logout-button";

export async function Nav() {
  const supabase = await createClient();
  const member = await getCurrentMember(supabase);

  return (
    <nav className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-3 shadow-lg shadow-indigo-500/20">
      <div className="mx-auto flex max-w-7xl items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm">
            ☀️
          </span>
          TDL Vacaciones
        </Link>
        {member && (
          <>
            <NavLinks isAdmin={member.is_admin} />
            <div className="ml-auto flex items-center gap-3">
              <Link
                href={`/persona/${member.slug}`}
                className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/25"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-bold">
                  {member.name.charAt(0)}
                </span>
                {member.name}
              </Link>
              <LogoutButton />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const links = [
    { href: "/calendario", label: "Calendario" },
    { href: "/balance", label: "Balance" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="flex gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
