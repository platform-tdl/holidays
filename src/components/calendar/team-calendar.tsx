"use client";

import { useState } from "react";
import { format } from "date-fns";
import { TeamMember, DayEntry, BankHoliday } from "@/lib/types";
import { getMonthDays, isWeekend, formatMonthYear, toDateString, getDayName } from "@/lib/dates";
import { DAY_TYPES, BANK_HOLIDAY_STYLE, DayTypeKey } from "@/lib/constants";
import { AddDayModal } from "@/components/forms/add-day-modal";
import { useRouter } from "next/navigation";

interface Props {
  members: TeamMember[];
  entries: DayEntry[];
  bankHolidays: BankHoliday[];
  year: number;
  month: number;
}

export function TeamCalendar({ members, entries, bankHolidays, year, month }: Props) {
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
      <div className="mb-4 flex items-center gap-4">
        <button onClick={handlePrev} className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          ← Anterior
        </button>
        <h2 className="text-lg font-semibold capitalize text-slate-900">
          {formatMonthYear(currentDate)}
        </h2>
        <button onClick={handleNext} className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          Siguiente →
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700">
                Equipo
              </th>
              {days.map((day) => {
                const dateStr = toDateString(day);
                const holiday = holidayMap.get(dateStr);
                const weekend = isWeekend(day);
                return (
                  <th
                    key={dateStr}
                    className={`min-w-[32px] px-1 py-1 text-center font-medium ${
                      holiday ? "bg-red-50 text-red-700" : weekend ? "bg-slate-100 text-slate-400" : "text-slate-600"
                    }`}
                    title={holiday?.name}
                  >
                    <div className="text-[10px]">{getDayName(day)}</div>
                    <div>{format(day, "d")}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="sticky left-0 z-10 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 whitespace-nowrap">
                  {member.name}
                </td>
                {days.map((day) => {
                  const dateStr = toDateString(day);
                  const entry = entryMap.get(`${member.id}_${dateStr}`);
                  const holiday = holidayMap.get(dateStr);
                  const weekend = isWeekend(day);

                  let cellContent = null;
                  let bgClass = "";

                  if (entry) {
                    const style = DAY_TYPES[entry.day_type as DayTypeKey];
                    cellContent = (
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${style.color} ${style.text}`}>
                        {style.short}
                      </span>
                    );
                  } else if (holiday) {
                    cellContent = (
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${BANK_HOLIDAY_STYLE.color} ${BANK_HOLIDAY_STYLE.text}`}>
                        {BANK_HOLIDAY_STYLE.short}
                      </span>
                    );
                  }

                  if (weekend && !entry) bgClass = "bg-slate-50";

                  return (
                    <td
                      key={dateStr}
                      className={`cursor-pointer px-1 py-1 text-center ${bgClass} hover:bg-blue-50`}
                      onClick={() =>
                        setModal({
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

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        {Object.entries(DAY_TYPES).map(([key, style]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${style.color} ${style.text}`}>
              {style.short}
            </span>
            {style.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${BANK_HOLIDAY_STYLE.color} ${BANK_HOLIDAY_STYLE.text}`}>
            {BANK_HOLIDAY_STYLE.short}
          </span>
          Festivo
        </div>
      </div>

      {modal && (
        <AddDayModal
          memberId={modal.memberId}
          memberName={modal.memberName}
          date={modal.date}
          existingEntry={modal.existingEntry}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
