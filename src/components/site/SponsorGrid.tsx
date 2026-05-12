import Image from "next/image";
import type { Sponsor } from "@/types";
import { getValidImageSrc } from "@/lib/image-utils";

export function SponsorGrid({ list }: { list: Sponsor[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {list.map((s) => {
        const logoSrc = getValidImageSrc(s.logo);
        return (
          <a
            key={s.id}
            href={s.website || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 bg-white/5 border border-brand-border rounded-sm h-24 flex items-center justify-center hover:border-brand-gold transition-colors p-4"
            title={s.name}
          >
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={s.name}
                width={120}
                height={60}
                className="max-h-12 max-w-full w-auto opacity-80 hover:opacity-100 transition-opacity"
                unoptimized={logoSrc.endsWith(".svg")}
              />
            ) : (
              <span className="break-words text-xs text-brand-gray text-center leading-tight">{s.name}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}
