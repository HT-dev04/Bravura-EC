import Link from "next/link";
import Image from "next/image";
import type { Player } from "@/types";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/elenco/${player.slug}`}
      className="group relative block bg-brand-black-2 border border-brand-border hover:border-brand-red transition-colors rounded-sm overflow-hidden"
    >
      <div className="relative aspect-[3/4] bg-gradient-to-b from-brand-red/20 via-brand-black to-brand-black-2 overflow-hidden">
        <Image
          src={player.photo}
          alt={player.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 300px"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />
        <span className="absolute top-3 right-3 font-display text-5xl md:text-6xl font-bold text-brand-gold leading-none drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          {player.number}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold">
            {player.position}
          </p>
          <p className="font-display text-xl uppercase leading-tight">{player.nickname}</p>
          <p className="text-xs text-brand-gray">{player.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 text-center border-t border-brand-border">
        <div className="py-2">
          <p className="text-[9px] uppercase text-brand-gray">Jogos</p>
          <p className="font-bold text-sm">{player.stats.games}</p>
        </div>
        <div className="py-2 border-x border-brand-border">
          <p className="text-[9px] uppercase text-brand-gray">Gols</p>
          <p className="font-bold text-sm text-brand-red">{player.stats.goals}</p>
        </div>
        <div className="py-2">
          <p className="text-[9px] uppercase text-brand-gray">Assist.</p>
          <p className="font-bold text-sm text-brand-gold">{player.stats.assists}</p>
        </div>
      </div>
    </Link>
  );
}
