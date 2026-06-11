import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/queries";
import { LogoutButton } from "./logout-button";

export async function Nav() {
  const supabase = await createClient();
  const member = await getCurrentMember(supabase);

  return (
    <nav className="border-b border-slate-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-8">
        <Link href="/" className="text-lg font-bold text-slate-900">
          TDL Vacaciones
        </Link>
        {member && (
          <>
            <NavLinks isAdmin={member.is_admin} slug={member.slug} />
            <div className="ml-auto flex items-center gap-3">
              <Link
                href={`/persona/${member.slug}`}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
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

function NavLinks({ isAdmin, slug }: { isAdmin: boolean; slug: string }) {
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
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
