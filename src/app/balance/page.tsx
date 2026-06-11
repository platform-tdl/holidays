import { createClient } from "@/lib/supabase/server";
import { getMemberBalances } from "@/lib/queries";
import { BalanceTable } from "@/components/balance/balance-table";

export default async function BalancePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();
  const supabase = await createClient();
  const balances = await getMemberBalances(supabase, year);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Balance de vacaciones</h1>
        <div className="flex gap-1">
          {[2024, 2025, 2026, 2027].map((y) => (
            <a
              key={y}
              href={`/balance?year=${y}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                y === year
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </div>
      <BalanceTable balances={balances} year={year} />
    </div>
  );
}
