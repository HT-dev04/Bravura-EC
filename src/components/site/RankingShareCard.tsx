/* eslint-disable @next/next/no-img-element */
import { forwardRef } from "react";

export type RankingShareItem = {
  id: string;
  name: string;
  photo?: string;
  value: number;
  label: string;
};

type RankingShareCardProps = {
  title: string;
  subtitle: string;
  items: RankingShareItem[];
  siteLabel: string;
  frameVariant: 1 | 2;
};

export const RankingShareCard = forwardRef<HTMLDivElement, RankingShareCardProps>(
  ({ title, subtitle, items, siteLabel, frameVariant }, ref) => {
    const visibleItems = items.filter((item) => item.name && Number.isFinite(item.value)).slice(0, 5);
    const frameSrc = frameVariant === 1 ? "/moldura-ranking2.png" : "/moldura-ranking3.png";
    const listTop = frameVariant === 1 ? 735 : 635;
    const listHeight = frameVariant === 1 ? 715 : 760;

    return (
      <div
        ref={ref}
        className="relative h-[1920px] w-[1080px] overflow-hidden bg-brand-black text-white"
      >
        <img src={frameSrc} alt="Moldura do ranking Bravura" className="absolute inset-0 h-full w-full object-cover" />

        <div
          className="absolute left-[122px] right-[122px] flex flex-col"
          style={{ top: listTop, minHeight: listHeight }}
        >
          <div className="px-8 text-center">
            <p className="text-2xl font-black uppercase tracking-[0.28em] text-brand-red drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {subtitle}
            </p>
            <h2 className="mt-3 text-5xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]">
              {title}
            </h2>
          </div>

          <div className="mt-12 space-y-5 px-8">
            {visibleItems.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center rounded-[24px] border border-brand-gold/60 bg-black/45 px-10 text-center shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                <p className="text-4xl font-black uppercase leading-tight text-white/85">Sem dados para este filtro</p>
              </div>
            ) : visibleItems.map((item, index) => {
              const isLeader = index === 0;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-6 rounded-[22px] border px-7 shadow-[0_18px_38px_rgba(0,0,0,0.48)] backdrop-blur-sm ${
                    isLeader
                      ? "min-h-40 border-brand-gold bg-[linear-gradient(135deg,rgba(212,175,55,0.34),rgba(120,0,0,0.44),rgba(0,0,0,0.72))]"
                      : "min-h-32 border-brand-gold/35 bg-black/52"
                  }`}
                >
                  <div className={`flex shrink-0 items-center justify-center rounded-2xl font-black ${isLeader ? "h-24 w-24 bg-brand-gold text-5xl text-brand-black" : "h-[72px] w-[72px] bg-brand-red text-3xl text-white"}`}>
                    {index + 1}º
                  </div>
                  <div className={`shrink-0 overflow-hidden rounded-full border-2 border-brand-gold bg-brand-black ${isLeader ? "h-24 w-24" : "h-[72px] w-[72px]"}`}>
                    {item.photo ? (
                      <img src={item.photo} alt={item.name} crossOrigin="anonymous" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-black-2 text-2xl font-black uppercase text-brand-gold">
                        {item.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`${isLeader ? "text-5xl" : "text-4xl"} truncate font-black uppercase tracking-tight text-white`}>
                      {item.name}
                    </p>
                    <p className="mt-2 text-xl uppercase tracking-[0.2em] text-brand-gold/75">Bravura Futebol Clube</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`${isLeader ? "text-6xl text-brand-gold" : "text-5xl text-brand-red"} font-black leading-none`}>
                      {item.value}
                    </p>
                    <p className="mt-2 text-xl font-bold uppercase tracking-[0.18em] text-white/65">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-[170px] left-0 right-0 text-center">
          <p className="text-2xl font-black uppercase tracking-[0.2em] text-brand-gold/90 opacity-0">{siteLabel}</p>
        </div>
      </div>
    );
  }
);

RankingShareCard.displayName = "RankingShareCard";
