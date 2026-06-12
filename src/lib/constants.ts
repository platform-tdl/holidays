export const DAY_TYPES = {
  vacaciones: { label: "Vacaciones", short: "V", icon: "beach", color: "bg-blue-500", text: "text-white", soft: "bg-blue-100 text-blue-700" },
  evento: { label: "Evento", short: "E", icon: null, color: "bg-violet-500", text: "text-white", soft: "bg-violet-100 text-violet-700" },
  competicion: { label: "Competicion", short: "C", icon: "athlete", color: "bg-amber-500", text: "text-white", soft: "bg-amber-100 text-amber-700" },
} as const;

export const BANK_HOLIDAY_STYLE = { color: "bg-emerald-500", text: "text-white", short: "F", soft: "bg-emerald-100 text-emerald-700" };

export type DayTypeKey = keyof typeof DAY_TYPES;

export const DAY_TYPE_OPTIONS: { value: DayTypeKey; label: string }[] = [
  { value: "vacaciones", label: "Vacaciones" },
  { value: "evento", label: "Evento" },
  { value: "competicion", label: "Competicion" },
];

export const EXCLUDED_SLUGS = new Set(["carmen", "eulogio", "guillermo", "german"]);
