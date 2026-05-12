import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: "red" | "gold" | "white";
  hint?: string;
}

export function StatCard({ label, value, accent = "white", hint }: StatCardProps) {
  const color =
    accent === "red" ? "text-brand-red" : accent === "gold" ? "text-brand-gold" : "text-white";
  return (
    <div className="min-w-0 bg-brand-black-2 border border-brand-border rounded-sm p-4 sm:p-5">
      <p className="break-words text-[10px] uppercase tracking-widest text-brand-gray mb-1">{label}</p>
      <p className={cn("break-words font-display text-3xl md:text-5xl font-bold leading-none", color)}>{value}</p>
      {hint && <p className="break-words text-xs text-brand-gray mt-2">{hint}</p>}
    </div>
  );
}
