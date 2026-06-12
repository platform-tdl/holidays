"use client";

import { useState } from "react";
import { format } from "date-fns";
import { TeamMember, DayEntry, BankHoliday } from "@/lib/types";
import { getMonthDays, isWeekend, formatMonthYear, toDateString, getDayName } from "@/lib/dates";
import { DAY_TYPES, BANK_HOLIDAY_STYLE, DayTypeKey } from "@/lib/constants";
import { AddDayModal } from "@/components/forms/add-day-modal";
import { DayBadge } from "@/components/calendar/day-badge";
import { useRouter } from "next/navigation";

interface Props {
  members: TeamMember[];
  entries: DayEntry[];
  bankHolidays: BankHoliday[];
  year: number;
  month: number;
  currentMemberId?: string;
  isAdmin?: boolean;
  remainingByMember?: Record<string, number>;
  allBankHolidayDates?: string[];
}

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

export function TeamCalendar({ members, entries, bankHolidays, allBankHolidayDates = [], year, month, currentMemberId, isAdmin, remainingByMember = {} }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<{
    memberId: string;
    memberName: string;
    date: string;
    existingEntry?: DayEntry;
  } | null>(null);

  const days = getMonthDays(year, month);
  const currentDate = new Date(year, month);

  const entryMap = new Map<string, DayEntry>();
  entries.forEach((e) => entryMap.set(`${e.member_id}_${e.date}`, e));

  const holidayMap = new Map<string, BankHoliday>();
  bankHolidays.forEach((h) => holidayMap.set(h.date, h));

  function handlePrev() {
    const prev = month === 0 ? { y: year - 1, m: 12 } : { y: year, m: month };
    router.push(`/calendario?year=${prev.y}&month=${prev.m}`);
  }

  function handleNext() {
    const next = month === 11 ? { y: year + 1, m: 1 } : { y: year, m: month + 2 };
    router.push(`/calendario?year=${next.y}&month=${next.m}`);
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <button onClick={handlePrev} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:shadow-md">
          ← Anterior
        </button>
        <h2 className="text-xl font-bold capitalize text-slate-900">
          {formatMonthYear(currentDate)}
        </h2>
        <button onClick={handleNext} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:shadow-md">
          Siguiente →
        </button>
        <a href={`/calendario/anual?year=${year}`} className="ml-auto rounded-xl px-3 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200 transition hover:bg-indigo-50">
          Vista anual
        </a>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="sticky left-0 z-10 bg-slate-50/80 px-3 py-2.5 text-left text-sm font-bold text-slate-700">
                Equipo
              </th>
              {days.map((day) => {
                const dateStr = toDateString(day);
                const holiday = holidayMap.get(dateStr);
                const weekend = isWeekend(day);
                return (
                  <th
                    key={dateStr}
                    className={`min-w-[34px] px-1 py-1.5 text-center font-medium ${
                      holiday ? "bg-emerald-50 text-emerald-600" : weekend ? "bg-slate-100/60 text-slate-400" : "text-slate-500"
                    }`}
                    title={holiday?.name}
                  >
                    <div className="text-[10px] uppercase tracking-wide">{getDayName(day)}</div>
                    <div className="text-xs font-semibold">{format(day, "d")}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => (
              <tr key={member.id} className={`border-b border-slate-100/80 transition hover:bg-indigo-50/30 ${member.id === currentMemberId ? "bg-indigo-100/60" : ""}`}>
                <td className={`sticky left-0 z-10 px-3 py-2 whitespace-nowrap ${member.id === currentMemberId ? "bg-indigo-100/60" : "bg-white"}`}>
                  <div className="group/member relative flex cursor-default items-center gap-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${MEMBER_COLORS[i % MEMBER_COLORS.length]}`}>
                      {member.name.charAt(0)}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{member.name}</span>
                    {remainingByMember[member.id] !== undefined && (
                      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover/member:opacity-100 whitespace-nowrap">
                        {remainingByMember[member.id]} días restantes
                      </span>
                    )}
                  </div>
                </td>
                {days.map((day) => {
                  const dateStr = toDateString(day);
                  const entry = entryMap.get(`${member.id}_${dateStr}`);
                  const holiday = holidayMap.get(dateStr);
                  const weekend = isWeekend(day);

                  let cellContent = null;
                  let bgClass = "";

                  if (entry) {
                    cellContent = <DayBadge dayType={entry.day_type as DayTypeKey} />;
                  } else if (holiday) {
                    cellContent = (
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold shadow-sm ${BANK_HOLIDAY_STYLE.color} ${BANK_HOLIDAY_STYLE.text}`}>
                        {BANK_HOLIDAY_STYLE.short}
                      </span>
                    );
                  }

                  if (weekend && !entry) bgClass = "bg-slate-50/60";

                  const canEdit = isAdmin || member.id === currentMemberId;

                  return (
                    <td
                      key={dateStr}
                      className={`px-0.5 py-1 text-center ${bgClass} ${canEdit ? "cursor-pointer transition hover:bg-indigo-100/40" : ""}`}
                      onClick={() =>
                        canEdit && setModal({
                          memberId: member.id,
                          memberName: member.name,
                          date: dateStr,
                          existingEntry: entry,
                        })
                      }
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {Object.entries(DAY_TYPES).map(([key, style]) => (
          <div key={key} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${style.soft}`}>
            <DayBadge dayType={key as DayTypeKey} size="sm" />
            <span className="font-medium">{style.label}</span>
          </div>
        ))}
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${BANK_HOLIDAY_STYLE.soft}`}>
          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-md text-[9px] font-bold ${BANK_HOLIDAY_STYLE.color} ${BANK_HOLIDAY_STYLE.text}`}>
            {BANK_HOLIDAY_STYLE.short}
          </span>
          <span className="font-medium">Festivo</span>
        </div>
      </div>

      {modal && (
        <AddDayModal
          memberId={modal.memberId}
          memberName={modal.memberName}
          date={modal.date}
          existingEntry={modal.existingEntry}
          bankHolidayDates={allBankHolidayDates}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
