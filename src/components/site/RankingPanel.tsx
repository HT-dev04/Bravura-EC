import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gamepad2, Handshake, RectangleVertical, Sparkles, Target, Trophy } from "lucide-react";
import { RankingShareModal } from "@/components/site/RankingShareModal";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";
import type { RankingAccent, RankingIcon } from "@/lib/championship-rankings";

export type RankingPanelRow = {
  id: string;
  name: string;
  photo?: string;
  number?: number;
  position?: string;
  href: string;
  value: number;
};

export const RANKING_ACCENT_TEXT: Record<RankingAccent, string> = {
  red: "text-brand-red",
  gold: "text-brand-gold",
  yellow: "text-yellow-400",
};

export function RankingIconGlyph({ icon, className }: { icon: RankingIcon; className?: string }) {
  if (icon === "yellowCards") return <RectangleVertical className={`${className} fill-yellow-400 text-yellow-400`} />;
  if (icon === "redCards") return <RectangleVertical className={`${className} fill-brand-red text-brand-red`} />;
  const Icon = icon === "goals" ? Trophy : icon === "assists" ? Handshake : icon === "games" ? Gamepad2 : icon === "participations" ? Target : Sparkles;
  return <Icon className={className} />;
}

/** Cartão de ranking com os 4 primeiros, botão de arte para compartilhar e link para o ranking completo. */
export function RankingPanel({
  title,
  icon,
  accent,
  unit,
  rows,
  shareTitle,
  shareSubtitle,
  shareUrl,
  siteLabel,
  fullRankingHref,
}: {
  title: string;
  icon: RankingIcon;
  accent: RankingAccent;
  unit: string;
  rows: RankingPanelRow[];
  shareTitle: string;
  shareSubtitle: string;
  shareUrl: string;
  siteLabel: string;
  fullRankingHref: string;
}) {
  const accentText = RANKING_ACCENT_TEXT[accent];
  const shareItems = rows.slice(0, 5).map((row) => ({
    id: row.id,
    name: row.name,
    photo: getValidImageSrc(row.photo) || undefined,
    value: row.value,
    label: unit,
    number: row.number || undefined,
  }));

  return (
    <div className="min-w-0 overflow-hidden rounded-sm border border-brand-border bg-brand-black-2">
      <div className="space-y-3 border-b border-brand-border px-4 py-3">
        <div className="flex items-center gap-2">
          <RankingIconGlyph icon={icon} className={`h-4 w-4 ${accentText}`} />
          <h3 className="font-display text-lg uppercase tracking-wide">{title}</h3>
        </div>
        <RankingShareModal title={shareTitle} subtitle={shareSubtitle} items={shareItems} shareUrl={shareUrl} siteLabel={siteLabel} />
      </div>
      <div className="divide-y divide-brand-border">
        {rows.length > 0 ? (
          rows.slice(0, 4).map((row, index) => {
            const photo = getValidImageSrc(row.photo);
            return (
              <Link key={row.id} href={row.href} className="flex min-w-0 items-center gap-3 p-3 transition-colors hover:bg-white/5">
                <span className="w-6 shrink-0 text-center font-display text-lg text-brand-gold">{index + 1}</span>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-black">
                  {photo ? (
                    <Image src={photo} alt={row.name} fill sizes="40px" className="object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-gold">{getInitials(row.name)}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display uppercase leading-tight">{row.name}</p>
                  <p className="truncate text-[10px] uppercase text-brand-gray">
                    {[row.number ? `#${row.number}` : "", row.position].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-display text-2xl font-bold leading-none ${accentText}`}>{row.value}</p>
                  <p className="text-[9px] uppercase text-brand-gray">{unit}</p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="p-4 text-sm text-brand-gray">Sem dados registrados.</p>
        )}
      </div>
      <Link
        href={fullRankingHref}
        className="flex items-center justify-center gap-1.5 border-t border-brand-border px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-gray transition-colors hover:bg-white/5 hover:text-brand-white"
      >
        Ver mais
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
