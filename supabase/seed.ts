import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Run: source .env.local && npx tsx supabase/seed.ts");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws as unknown as typeof WebSocket },
});

const MEMBERS = [
  { name: "María Ruiz", slug: "maria-ruiz", carried: 6 },
  { name: "Jota", slug: "jota", carried: 8 },
  { name: "Rocío Ruiz", slug: "rocio-ruiz", carried: 6 },
  { name: "Dani Pajuelo", slug: "dani-pajuelo", carried: 0 },
  { name: "Cristina", slug: "cristina", carried: 12 },
  { name: "Lucía", slug: "lucia", carried: 4 },
  { name: "Pol", slug: "pol", carried: 24 },
  { name: "Guillermo", slug: "guillermo", carried: 0 },
  { name: "Germán", slug: "german", carried: 0 },
  { name: "Carmen", slug: "carmen", carried: 0 },
  { name: "Eulogio", slug: "eulogio", carried: 0 },
];

const BANK_HOLIDAYS_2026 = [
  { date: "2026-01-01", name: "Año Nuevo" },
  { date: "2026-01-06", name: "Reyes Magos" },
  { date: "2026-04-02", name: "Jueves Santo" },
  { date: "2026-04-03", name: "Viernes Santo" },
  { date: "2026-05-01", name: "Día del Trabajo" },
  { date: "2026-05-02", name: "Comunidad de Madrid" },
  { date: "2026-05-15", name: "San Isidro" },
  { date: "2026-08-15", name: "Asunción de la Virgen" },
  { date: "2026-10-12", name: "Fiesta Nacional de España" },
  { date: "2026-11-02", name: "Todos los Santos (trasladado)" },
  { date: "2026-11-09", name: "Almudena" },
  { date: "2026-12-07", name: "Constitución (trasladado)" },
  { date: "2026-12-08", name: "Inmaculada Concepción" },
  { date: "2026-12-25", name: "Navidad" },
];

async function seed() {
  console.log("Seeding team members...");
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .upsert(
      MEMBERS.map((m) => ({ name: m.name, slug: m.slug })),
      { onConflict: "slug" }
    )
    .select();

  if (membersError) {
    console.error("Error seeding members:", membersError);
    process.exit(1);
  }
  console.log(`  ${members.length} members upserted`);

  console.log("Seeding yearly balances for 2026...");
  const balances = members.map((member) => {
    const seed = MEMBERS.find((m) => m.slug === member.slug)!;
    return {
      member_id: member.id,
      year: 2026,
      base_days: 22,
      carried_over_days: seed.carried,
      compensatory_earned: 0,
    };
  });

  const { error: balancesError } = await supabase
    .from("yearly_balances")
    .upsert(balances, { onConflict: "member_id,year" });

  if (balancesError) {
    console.error("Error seeding balances:", balancesError);
    process.exit(1);
  }
  console.log(`  ${balances.length} balances upserted`);

  console.log("Seeding Madrid 2026 bank holidays...");
  const { error: holidaysError } = await supabase
    .from("bank_holidays")
    .upsert(BANK_HOLIDAYS_2026, { onConflict: "date" });

  if (holidaysError) {
    console.error("Error seeding bank holidays:", holidaysError);
    process.exit(1);
  }
  console.log(`  ${BANK_HOLIDAYS_2026.length} bank holidays upserted`);

  console.log("Done!");
}

seed();
