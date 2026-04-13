import Link from "next/link";
import Image from "next/image";
import type { Match } from "@/types";
import { formatDateLong, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const resultVariant = { V: "green", E: "gray", D: "red" } as const;

export function MatchCard({ match }: { match: Match }) {
  const homeTeam = match.homeAway === "casa" ? "Bravura" : match.opponent;
  const awayTeam = match.homeAway === "casa" ? match.opponent : "Bravura";
  const homeLogo = match.homeAway === "casa" ? "/logo/bravura.svg" : match.opponentLogo;
  const awayLogo = match.homeAway === "casa" ? match.opponentLogo : "/logo/bravura.svg";

  return (
    <Link
      href={`/jogos/${match.id}`}
      className="block bg-brand-black-2 border border-brand-border hover:border-brand-red transition-colors rounded-sm"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border text-xs">
        <span className="uppercase tracking-wider text-brand-gray">{match.competition}</span>
        <div className="flex items-center gap-2">
          {match.status === "encerrada" && match.result && (
            <Badge variant={resultVariant[match.result]}>{match.result === "V" ? "Vitória" : match.result === "E" ? "Empate" : "Derrota"}</Badge>
          )}
          {match.status === "agendada" && <Badge variant="gold">Próximo</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-5">
        <div className="flex items-center gap-3 justify-end">
          <span className="font-display uppercase text-lg text-right hidden sm:block">{homeTeam}</span>
          <Image src={homeLogo} alt={homeTeam} width={44} height={44} className="w-11 h-11" />
        </div>
        <div className="text-center">
          {match.status === "encerrada" ? (
            <div className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
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
        <div className="flex items-center gap-3">
          <Image src={awayLogo} alt={awayTeam} width={44} height={44} className="w-11 h-11" />
          <span className="font-display uppercase text-lg hidden sm:block">{awayTeam}</span>
        </div>
      </div>
      <div className="px-5 pb-4 text-xs text-brand-gray flex flex-wrap justify-between gap-1">
        <span>{formatDateLong(match.date)}</span>
        <span>{match.location}</span>
      </div>
    </Link>
  );
}
