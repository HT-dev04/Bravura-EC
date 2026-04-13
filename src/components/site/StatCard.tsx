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
    <div className="bg-brand-black-2 border border-brand-border rounded-sm p-5">
      <p className="text-[10px] uppercase tracking-widest text-brand-gray mb-1">{label}</p>
      <p className={cn("font-display text-4xl md:text-5xl font-bold leading-none", color)}>{value}</p>
      {hint && <p className="text-xs text-brand-gray mt-2">{hint}</p>}
    </div>
  );
}
