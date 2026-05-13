import Link from "next/link";
import Image from "next/image";
import type { Match } from "@/types";
import { bravuraLogo } from "@/lib/asset-url";
import { getValidImageSrc, getInitials } from "@/lib/image-utils";
import { cn, formatDateLong, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const resultVariant = { V: "green", E: "gray", D: "red" } as const;
const resultLabel = { V: "Vitória", E: "Empate", D: "Derrota" } as const;
const resultStyles = {
  V: "border-green-700/70 bg-[radial-gradient(circle_at_top,rgba(21,128,61,0.18),transparent_42%)]",
  E: "border-brand-border bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]",
  D: "border-brand-red/80 bg-[radial-gradient(circle_at_top,rgba(200,16,46,0.22),transparent_42%)]",
} as const;

function TeamLogo({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return <Image src={src} alt={name} width={44} height={44} className="h-11 w-11 object-contain" />;
  }
  return (
    <div className="h-11 w-11 shrink-0 rounded-sm bg-brand-black border border-brand-border flex items-center justify-center text-xs font-bold text-brand-gray">
      {getInitials(name)}
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const bravuraLogoSrc = getValidImageSrc(bravuraLogo);
  const opponentLogo = getValidImageSrc(match.opponentLogo);
  const bravuraGoals = match.events.filter((event) => event.team === "bravura" && event.type === "gol" && event.playerName.trim());
  const hasBravuraGoals = bravuraGoals.length > 0;

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={cn(
        "group block overflow-hidden rounded-sm border bg-brand-black-2 transition-colors hover:border-brand-gold/70",
        match.status === "encerrada" && match.result ? resultStyles[match.result] : "border-brand-border"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-2 text-xs">
        <div className="min-w-0">
          <span className="block break-words uppercase tracking-wider text-brand-gray">{match.competition}</span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-brand-white/40">{match.homeAway === "casa" ? "Casa" : "Fora"}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.status === "encerrada" && match.result && (
            <Badge variant={resultVariant[match.result]}>{resultLabel[match.result]}</Badge>
          )}
          {match.status === "agendada" && <Badge variant="gold">Próximo</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3 justify-end">
          <span className="hidden min-w-0 break-words text-right font-display uppercase text-lg sm:block">Bravura</span>
          <TeamLogo src={bravuraLogoSrc} name="Bravura" />
        </div>
        <div className="text-center">
          {match.status === "encerrada" ? (
            <div className="flex items-center gap-2 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
              <span>{match.scoreHome}</span>
              <span className="text-brand-gray">×</span>
              <span>{match.scoreAway}</span>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-display text-xl">{formatTime(match.date)}</p>
              <p className="text-[10px] text-brand-gray uppercase">{match.homeAway === "casa" ? "Casa" : "Fora"}</p>
            </div>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <TeamLogo src={opponentLogo} name={match.opponent} />
          <span className="hidden min-w-0 break-words font-display uppercase text-lg sm:block">{match.opponent}</span>
        </div>
      </div>
      <div className="px-5 pb-4 text-xs text-brand-gray flex flex-wrap justify-between gap-1">
        <span>{formatDateLong(match.date)}</span>
        <span className="break-words text-right">{match.location}</span>
      </div>
      {match.status === "encerrada" && (
        <div className="border-t border-brand-border/80 px-4 py-3">
          {hasBravuraGoals ? (
            <div className="rounded-sm bg-brand-black/55 px-3 py-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                Gols do Bravura
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bravuraGoals.map((goal, index) => (
                  <span key={`${goal.playerName}-${goal.minute}-${index}`} className="rounded-full border border-brand-border bg-white/5 px-2 py-1 text-[11px] font-semibold text-brand-white/85">
                    {goal.playerName}{goal.minute > 0 ? ` ${goal.minute}'` : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] uppercase tracking-wider text-brand-gray">Sem gols do Bravura registrados.</p>
          )}
        </div>
      )}
    </Link>
  );
}
