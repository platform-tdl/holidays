import { DayTypeKey } from "./constants";

export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  base_days_per_year: number;
  is_active: boolean;
  is_admin: boolean;
}

export interface YearlyBalance {
  id: string;
  member_id: string;
  year: number;
  base_days: number;
  carried_over_days: number;
  compensatory_earned: number;
}

export interface DayEntry {
  id: string;
  member_id: string;
  date: string;
  day_type: DayTypeKey;
  note: string | null;
}

export interface BankHoliday {
  id: string;
  date: string;
  name: string;
}

export interface ActivityLogEntry {
  id: string;
  created_at: string;
  actor_id: string;
  member_id: string;
  action: string;
  details: Record<string, unknown>;
  actor_name?: string;
  member_name?: string;
}

export interface MemberBalance {
  member_id: string;
  name: string;
  slug: string;
  year: number;
  base_days: number;
  carried_over_days: number;
  compensatory_earned: number;
  total_available: number;
  days_used: number;
  remaining: number;
}
