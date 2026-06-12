export const DAY_TYPES = {
  vacaciones: { label: "Vacaciones", short: "V", color: "bg-blue-500", text: "text-white", soft: "bg-blue-100 text-blue-700" },
  evento: { label: "Evento", short: "E", color: "bg-emerald-500", text: "text-white", soft: "bg-emerald-100 text-emerald-700" },
  competicion: { label: "Competicion", short: "K", color: "bg-violet-500", text: "text-white", soft: "bg-violet-100 text-violet-700" },
} as const;

export const BANK_HOLIDAY_STYLE = { color: "bg-rose-500", text: "text-white", short: "F", soft: "bg-rose-100 text-rose-700" };

export type DayTypeKey = keyof typeof DAY_TYPES;

export const DAY_TYPE_OPTIONS: { value: DayTypeKey; label: string }[] = [
  { value: "vacaciones", label: "Vacaciones" },
  { value: "evento", label: "Evento" },
  { value: "competicion", label: "Competicion" },
];
