import Link from "next/link";
import Image from "next/image";
import { Camera, Mail, MapPin, Phone } from "lucide-react";
import { clubInfo } from "@/data/club";

export function Footer() {
  return (
    <footer className="bg-brand-black border-t border-brand-border mt-auto">
      <div className="container-x py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image src="/logo/bravura.svg" alt="Bravura FC" width={40} height={40} />
            <span className="font-display uppercase text-xl tracking-wider">
              Bravura <span className="text-brand-red">FC</span>
            </span>
          </div>
          <p className="text-sm text-brand-gray italic">&ldquo;{clubInfo.motto}&rdquo;</p>
          <p className="text-xs text-brand-gray mt-2">Fundado em {clubInfo.founded}</p>
        </div>

        <div>
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
            <li><Link href="/patrocinadores" className="text-brand-white/80 hover:text-white">Patrocinadores</Link></li>
            <li><Link href="/loja" className="text-brand-white/80 hover:text-white">Loja Oficial</Link></li>
            <li><Link href="/contato" className="text-brand-white/80 hover:text-white">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display uppercase text-sm text-brand-gold mb-3 tracking-wider">Contato</h4>
          <ul className="space-y-3 text-sm text-brand-white/80">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-red" />
              <span>Estádio Municipal da Vila<br />Rua do Clube, 123</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-red" />
              <span>(11) 90000-0000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-red" />
              <a href="mailto:contato@bravurafc.example">contato@bravurafc.example</a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/bravura_esporte_clube"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-white"
              >
                <Camera className="w-4 h-4" />
                @bravura_esporte_clube
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-border">
        <div className="container-x py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-brand-gray">
          <p>© {new Date().getFullYear()} Bravura FC. Todos os direitos reservados.</p>
          <p className="uppercase tracking-wider">Coragem dentro e fora de campo.</p>
        </div>
      </div>
    </footer>
  );
}
