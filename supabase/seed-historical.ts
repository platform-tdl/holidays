import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { readFileSync } from "fs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars. Run: source .env.local && npx tsx supabase/seed-historical.ts");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws as unknown as typeof WebSocket },
});

interface HistoricalEntry {
  slug: string;
  date: string;
  day_type: string;
}

async function seedHistorical() {
  const entries: HistoricalEntry[] = JSON.parse(
    readFileSync("/tmp/historical_entries.json", "utf-8")
  );
  console.log(`Loaded ${entries.length} historical entries`);

  // Get member map
  const { data: members, error: mErr } = await supabase
    .from("team_members")
    .select("id, slug");
  if (mErr) { console.error(mErr); process.exit(1); }

  const memberMap = new Map(members.map((m) => [m.slug, m.id]));

  // Ensure yearly_balances exist for 2024 and 2025
  const years = [2024, 2025];
  for (const year of years) {
    const balances = members.map((m) => ({
      member_id: m.id,
      year,
      base_days: 22,
      carried_over_days: 0,
      compensatory_earned: 0,
    }));
    const { error } = await supabase
      .from("yearly_balances")
      .upsert(balances, { onConflict: "member_id,year" });
    if (error) console.error(`Error upserting ${year} balances:`, error);
    else console.log(`  ${year} balances ensured`);
  }

  // Insert day entries in batches
  const dayEntries = entries
    .map((e) => {
      const memberId = memberMap.get(e.slug);
      if (!memberId) return null;
      return {
        member_id: memberId,
        date: e.date,
        day_type: e.day_type,
      };
    })
    .filter(Boolean);

  console.log(`Inserting ${dayEntries.length} day entries...`);

  const BATCH = 100;
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < dayEntries.length; i += BATCH) {
    const batch = dayEntries.slice(i, i + BATCH);
    const { error } = await supabase
      .from("day_entries")
      .upsert(batch as any[], { onConflict: "member_id,date" });
    if (error) {
      console.error(`Batch error at ${i}:`, error.message);
      skipped += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Done! Inserted: ${inserted}, Skipped: ${skipped}`);
}

seedHistorical();
