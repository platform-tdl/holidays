import { DAY_TYPES, DayTypeKey } from "@/lib/constants";
import { AthleteIcon } from "@/components/icons/athlete-icon";
import { BeachIcon } from "@/components/icons/beach-icon";

const ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  athlete: AthleteIcon,
  beach: BeachIcon,
};

export function DayBadge({ dayType, size = "md" }: { dayType: DayTypeKey; size?: "sm" | "md" }) {
  const style = DAY_TYPES[dayType];
  const isMd = size === "md";
  const IconComponent = style.icon ? ICONS[style.icon] : null;

  return (
    <span className={`inline-flex items-center justify-center rounded-lg shadow-sm ${style.color} ${style.text} ${isMd ? "h-6 w-6" : "h-4 w-4"}`}>
      {IconComponent ? (
        <IconComponent className={isMd ? "w-3.5 h-3.5" : "w-2.5 h-2.5"} />
      ) : (
        <span className={`font-bold ${isMd ? "text-[10px]" : "text-[8px]"}`}>{style.short}</span>
      )}
    </span>
  );
}
