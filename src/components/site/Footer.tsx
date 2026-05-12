import Link from "next/link";
import Image from "next/image";
import { Camera, Mail, MapPin, Phone } from "lucide-react";
import { clubInfo } from "@/data/club";
import { bravuraLogo } from "@/lib/asset-url";

export function Footer() {
  return (
    <footer className="bg-brand-black border-t border-brand-border mt-auto">
      <div className="container-x py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-3 mb-4">
            <Image
              src={bravuraLogo}
              alt="Bravura Esporte Clube"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="min-w-0 break-words font-display uppercase text-xl tracking-wider">
              Bravura <span className="text-brand-red">EC</span>
            </span>
          </div>
          <p className="break-words text-sm text-brand-gray italic">&ldquo;{clubInfo.motto}&rdquo;</p>
          <p className="text-xs text-brand-gray mt-2">Fundado em {clubInfo.founded}</p>
        </div>

        <div className="min-w-0">
          <h4 className="font-display uppercase text-sm text-brand-gold mb-3 tracking-wider">Navegação</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/o-clube" className="text-brand-white/80 hover:text-white">O Clube</Link></li>
            <li><Link href="/elenco" className="text-brand-white/80 hover:text-white">Elenco</Link></li>
            <li><Link href="/jogos" className="text-brand-white/80 hover:text-white">Jogos</Link></li>
            <li><Link href="/estatisticas" className="text-brand-white/80 hover:text-white">Estatísticas</Link></li>
            <li><Link href="/galeria" className="text-brand-white/80 hover:text-white">Galeria</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display uppercase text-sm text-brand-gold mb-3 tracking-wider">Mais</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/noticias" className="text-brand-white/80 hover:text-white">Notícias</Link></li>
            <li><Link href="/patrocinadores" className="break-words text-brand-white/80 hover:text-white">Patrocinadores</Link></li>
            <li><Link href="/loja" className="text-brand-white/80 hover:text-white">Loja Oficial</Link></li>
            <li><Link href="/contato" className="text-brand-white/80 hover:text-white">Contato</Link></li>
            <li><Link href="/admin" className="text-brand-white/80 hover:text-white">Área Admin</Link></li>
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="font-display uppercase text-sm text-brand-gold mb-3 tracking-wider">Contato</h4>
          <ul className="space-y-3 text-sm text-brand-white/80">
            <li className="flex min-w-0 items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-red" />
              <span className="min-w-0 break-words">Bugre, Minas Gerais</span>
            </li>
            <li className="flex min-w-0 items-center gap-2">
              <Phone className="w-4 h-4 text-brand-red" />
              <a href="https://wa.me/5533987976​00" className="min-w-0 break-words">(33) 9879-7600</a>
            </li>
            <li className="flex min-w-0 items-center gap-2">
              <Mail className="w-4 h-4 text-brand-red" />
              <a href="mailto:bravuraesporteclube@gmail.com" className="min-w-0 break-words">bravuraesporteclube@gmail.com</a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/bravura_esporte_clube"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-2 text-brand-gold hover:text-white"
              >
                <Camera className="w-4 h-4" />
                <span className="min-w-0 break-words">@bravura_esporte_clube</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-border">
        <div className="container-x py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-brand-gray">
          <p className="break-words text-center md:text-left">© {new Date().getFullYear()} Bravura Esporte Clube. Todos os direitos reservados.</p>
          <p className="break-words text-center uppercase tracking-wider md:text-right">Com união e bravura, sonhos se tornam realidade.</p>
        </div>
      </div>
    </footer>
  );
}
