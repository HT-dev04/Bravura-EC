import Link from "next/link";
import Image from "next/image";
import type { Match } from "@/types";
import { bravuraLogo } from "@/lib/asset-url";
import { getValidImageSrc, getInitials } from "@/lib/image-utils";
import { formatDateLong, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const resultVariant = { V: "green", E: "gray", D: "red" } as const;

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
  const homeTeam = match.homeAway === "casa" ? "Bravura" : match.opponent;
  const awayTeam = match.homeAway === "casa" ? match.opponent : "Bravura";
  const rawHomeLogo = match.homeAway === "casa" ? bravuraLogo : match.opponentLogo;
  const rawAwayLogo = match.homeAway === "casa" ? match.opponentLogo : bravuraLogo;
  const homeLogo = getValidImageSrc(rawHomeLogo);
  const awayLogo = getValidImageSrc(rawAwayLogo);

  return (
    <Link
      href={`/jogos/${match.id}`}
      className="block bg-brand-black-2 border border-brand-border hover:border-brand-red transition-colors rounded-sm"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-brand-border text-xs">
        <span className="min-w-0 break-words uppercase tracking-wider text-brand-gray">{match.competition}</span>
        <div className="flex items-center gap-2">
          {match.status === "encerrada" && match.result && (
            <Badge variant={resultVariant[match.result]}>{match.result === "V" ? "Vitória" : match.result === "E" ? "Empate" : "Derrota"}</Badge>
          )}
          {match.status === "agendada" && <Badge variant="gold">Próximo</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3 justify-end">
          <span className="hidden min-w-0 break-words text-right font-display uppercase text-lg sm:block">{homeTeam}</span>
          <TeamLogo src={homeLogo} name={homeTeam} />
        </div>
        <div className="text-center">
          {match.status === "encerrada" ? (
            <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2">
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
          <TeamLogo src={awayLogo} name={awayTeam} />
          <span className="hidden min-w-0 break-words font-display uppercase text-lg sm:block">{awayTeam}</span>
        </div>
      </div>
      <div className="px-5 pb-4 text-xs text-brand-gray flex flex-wrap justify-between gap-1">
        <span>{formatDateLong(match.date)}</span>
        <span className="break-words text-right">{match.location}</span>
      </div>
    </Link>
  );
}
