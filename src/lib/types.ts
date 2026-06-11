import { DayTypeKey } from "./constants";

export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  base_days_per_year: number;
  is_active: boolean;
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

export interface MemberBalance {
  member_id: string;
  name: string;
  slug: string;
  year: number;
  base_days: number;
  carried_over_days: number;
  compensatory_earned: number;
  total_available: number;
  vacation_used: number;
  compensatory_used: number;
  remaining: number;
}
