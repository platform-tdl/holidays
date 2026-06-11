export const DAY_TYPES = {
  vacaciones: { label: "Vacaciones", short: "V", color: "bg-blue-500", text: "text-white" },
  compensatorio: { label: "Compensatorio", short: "C", color: "bg-amber-500", text: "text-white" },
  evento: { label: "Evento", short: "E", color: "bg-green-500", text: "text-white" },
  competicion: { label: "Competición", short: "K", color: "bg-purple-500", text: "text-white" },
  examenes: { label: "Exámenes", short: "X", color: "bg-pink-500", text: "text-white" },
} as const;

export const BANK_HOLIDAY_STYLE = { color: "bg-red-400", text: "text-white", short: "F" };

export type DayTypeKey = keyof typeof DAY_TYPES;

export const DAY_TYPE_OPTIONS: { value: DayTypeKey; label: string }[] = [
  { value: "vacaciones", label: "Vacaciones" },
  { value: "compensatorio", label: "Compensatorio" },
  { value: "evento", label: "Evento" },
  { value: "competicion", label: "Competición" },
  { value: "examenes", label: "Exámenes" },
];
