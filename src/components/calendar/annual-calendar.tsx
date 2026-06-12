"use client";

import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { TeamMember, DayEntry, BankHoliday } from "@/lib/types";
import { DAY_TYPES, BANK_HOLIDAY_STYLE, DayTypeKey } from "@/lib/constants";
import { DayBadge } from "@/components/calendar/day-badge";
import { useRouter } from "next/navigation";

interface Props {
  members: TeamMember[];
  entries: DayEntry[];
  bankHolidays: BankHoliday[];
  year: number;
  currentMemberId?: string;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

const MEMBER_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

export function AnnualCalendar({ members, entries, bankHolidays, year, currentMemberId }: Props) {
  const router = useRouter();

  const entryMap = new Map<string, DayEntry>();
  entries.forEach((e) => entryMap.set(`${e.member_id}_${e.date}`, e));

  const holidayMap = new Map<string, BankHoliday>();
  bankHolidays.forEach((h) => holidayMap.set(h.date, h));

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">Vista anual {year}</h2>
        <div className="flex gap-1">
          {[year - 1, year, year + 1].map((y) => (
            <a
              key={y}
              href={`/calendario/anual?year=${y}`}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                y === year
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm"
                  : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
        <a
          href={`/calendario?year=${year}&month=${new Date().getMonth() + 1}`}
          className="ml-auto rounded-xl px-3 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200 transition hover:bg-indigo-50"
        >
          Vista mensual
        </a>
      </div>

      <div className="space-y-6">
        {MONTHS.map((month) => {
          const days = eachDayOfInterval({
            start: startOfMonth(new Date(year, month)),
            end: endOfMonth(new Date(year, month)),
          });
          const monthName = format(new Date(year, month), "MMMM", { locale: es });

          return (
            <div key={month}>
              <h3 className="mb-2 text-sm font-bold capitalize text-slate-700">{monthName}</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="sticky left-0 z-10 bg-slate-50/80 px-2 py-1.5 text-left text-xs font-bold text-slate-700 min-w-[120px]">
                        Equipo
                      </th>
                      {days.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const holiday = holidayMap.get(dateStr);
                        const weekend = getDay(day) === 0 || getDay(day) === 6;
                        return (
                          <th
                            key={dateStr}
                            className={`min-w-[18px] px-0 py-1 text-center font-medium ${
                              holiday ? "bg-emerald-50 text-emerald-500" : weekend ? "bg-slate-100/60 text-slate-300" : "text-slate-400"
                            }`}
                            title={holiday ? holiday.name : format(day, "EEEE d", { locale: es })}
                          >
                            {format(day, "d")}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, i) => (
                      <tr
                        key={member.id}
                        className={`border-b border-slate-100/60 ${member.id === currentMemberId ? "bg-indigo-100/60" : ""}`}
                      >
                        <td className={`sticky left-0 z-10 px-2 py-1 whitespace-nowrap ${member.id === currentMemberId ? "bg-indigo-100/60" : "bg-white"}`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${MEMBER_COLORS[i % MEMBER_COLORS.length]}`}>
                              {member.name.charAt(0)}
                            </span>
                            <span className="text-[11px] font-medium text-slate-700">{member.name}</span>
                          </div>
                        </td>
                        {days.map((day) => {
                          const dateStr = format(day, "yyyy-MM-dd");
                          const entry = entryMap.get(`${member.id}_${dateStr}`);
                          const holiday = holidayMap.get(dateStr);
                          const weekend = getDay(day) === 0 || getDay(day) === 6;

                          let bg = "";
                          if (entry) {
                            const style = DAY_TYPES[entry.day_type as DayTypeKey];
                            bg = style.color;
                          } else if (holiday) {
                            bg = BANK_HOLIDAY_STYLE.color;
                          } else if (weekend) {
                            bg = "bg-slate-100/40";
                          }

                          return (
                            <td
                              key={dateStr}
                              className={`px-0 py-0.5 text-center`}
                              title={
                                entry
                                  ? `${DAY_TYPES[entry.day_type as DayTypeKey].label}${entry.note ? ` - ${entry.note}` : ""}`
                                  : holiday
                                    ? holiday.name
                                    : ""
                              }
                            >
                              {(entry || holiday) && (
                                <span className={`mx-auto block h-3.5 w-3.5 rounded-sm ${bg}`} />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {Object.entries(DAY_TYPES).map(([key, style]) => (
          <div key={key} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${style.soft}`}>
            <DayBadge dayType={key as DayTypeKey} size="sm" />
            <span className="font-medium">{style.label}</span>
          </div>
        ))}
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${BANK_HOLIDAY_STYLE.soft}`}>
          <span className={`inline-flex h-3.5 w-3.5 rounded-sm ${BANK_HOLIDAY_STYLE.color}`} />
          <span className="font-medium">Festivo</span>
        </div>
      </div>
    </div>
  );
}
