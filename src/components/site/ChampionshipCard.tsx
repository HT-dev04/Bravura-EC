import Link from "next/link";
import Image from "next/image";
import { Trophy } from "lucide-react";
import type { Championship } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CHAMPIONSHIP_STATUS_LABELS, getChampionshipSummary } from "@/lib/championship-stats";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";

const statusVariant = { planejado: "outline", em_andamento: "red", encerrado: "gray" } as const;

export function ChampionshipLogo({ championship, size = 64 }: { championship: Championship; size?: number }) {
  const logo = getValidImageSrc(championship.logo);
  if (logo) {
    return (
      <Image
        src={logo}
        alt={championship.name}
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-sm border border-brand-gold/40 bg-brand-black font-display text-brand-gold"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {getInitials(championship.name) || <Trophy className="h-1/2 w-1/2" />}
    </div>
  );
}

export function ChampionshipCard({ championship, href }: { championship: Championship; href?: string }) {
  const summary = getChampionshipSummary(championship);
  const cover = getValidImageSrc(championship.cover);

  return (
    <Link
      href={href || `/campeonatos/${championship.slug}`}
      className="group block overflow-hidden rounded-sm border border-brand-border bg-brand-black-2 transition-colors hover:border-brand-gold/70"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.22),transparent_55%),linear-gradient(135deg,#1a0a0d,#0a0a0a)]">
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
            className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black-2 via-brand-black-2/30 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge variant={statusVariant[championship.status]}>{CHAMPIONSHIP_STATUS_LABELS[championship.status]}</Badge>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
          <ChampionshipLogo championship={championship} size={56} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-gold">Temporada {championship.season}</p>
            <h3 className="break-words font-display text-xl uppercase leading-tight sm:text-2xl">{championship.name}</h3>
          </div>
        </div>
      </div>

      {championship.finalPosition && (
        <div className="flex items-center gap-2 border-t border-brand-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
          <Trophy className="h-4 w-4 shrink-0" />
          <span className="break-words">{championship.finalPosition}</span>
        </div>
      )}

      <div className="grid grid-cols-5 border-t border-brand-border text-center">
        <CardStat label="Jogos" value={summary.games} />
        <CardStat label="V" value={summary.wins} className="text-green-500" />
        <CardStat label="E" value={summary.draws} />
        <CardStat label="D" value={summary.losses} className="text-brand-red" />
        <CardStat label="Gols" value={`${summary.goalsFor}:${summary.goalsAgainst}`} />
      </div>
    </Link>
  );
}

function CardStat({ label, value, className = "" }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="border-r border-brand-border py-2 last:border-r-0">
      <p className="text-[9px] uppercase text-brand-gray">{label}</p>
      <p className={`text-sm font-bold ${className}`}>{value}</p>
    </div>
  );
}
