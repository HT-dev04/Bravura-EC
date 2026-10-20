import Image from "next/image";
import type { Championship, ChampionshipGroup, ChampionshipTeam } from "@/types";
import { getGroupStandings } from "@/lib/championship-stats";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

export function TeamCrest({ team, size = 32 }: { team: ChampionshipTeam; size?: number }) {
  const logo = getValidImageSrc(team.logo);
  if (logo) {
    return (
      <Image
        src={logo}
        alt={team.name}
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-black font-bold text-brand-gray"
      style={{ width: size, height: size, fontSize: Math.max(9, size / 3) }}
    >
      {getInitials(team.name)}
    </div>
  );
}

export function GroupStandingsTable({ championship, group }: { championship: Championship; group: ChampionshipGroup }) {
  const rows = getGroupStandings(championship, group);

  return (
    <div className="overflow-hidden rounded-sm border border-brand-border bg-brand-black-2">
      <div className="flex items-center justify-between border-b border-brand-border bg-brand-black px-4 py-3">
        <h3 className="font-display text-xl uppercase text-brand-gold">{group.name}</h3>
        <span className="text-[10px] uppercase tracking-widest text-brand-gray">Classificação</span>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-brand-gray">Times ainda não definidos.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-brand-gray">
              <th className="px-4 py-2 text-left font-semibold">Time</th>
              <th className="w-10 text-center font-semibold">P</th>
              <th className="w-9 text-center font-semibold">J</th>
              <th className="w-9 text-center font-semibold">V</th>
              <th className="w-9 text-center font-semibold">E</th>
              <th className="w-9 text-center font-semibold">D</th>
              <th className="hidden w-10 pr-4 text-center font-semibold sm:table-cell">SG</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.team.id}
                className={cn("border-t border-brand-border", row.team.isBravura && "bg-brand-red/10")}
              >
                <td className="px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="w-4 shrink-0 font-display text-base text-brand-gray">{index + 1}</span>
                    <TeamCrest team={row.team} size={28} />
                    <span className={cn("min-w-0 truncate font-semibold uppercase", row.team.isBravura && "text-white")}>
                      {row.team.name}
                    </span>
                  </div>
                </td>
                <td className="text-center">
                  <span className="inline-block min-w-7 rounded-sm bg-brand-gold/15 px-1.5 py-0.5 font-bold text-brand-gold">
                    {row.points}
                  </span>
                </td>
                <td className="text-center">{row.played}</td>
                <td className="text-center">{row.wins}</td>
                <td className="text-center">{row.draws}</td>
                <td className="text-center">{row.losses}</td>
                <td className="hidden pr-4 text-center sm:table-cell">{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
