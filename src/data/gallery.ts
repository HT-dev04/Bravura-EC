import { assetUrl } from "@/lib/asset-url";
import type { GalleryPhoto } from "@/types";

const galleryRows: GalleryPhoto[] = [
  { id: "g01", src: "/gallery/jogo-01-a.jpg", album: "Jogos", season: "2026", caption: "Estreia contra o Serra Azul FC" },
  { id: "g02", src: "/gallery/jogo-01-b.jpg", album: "Jogos", season: "2026", caption: "Comemoração do segundo gol" },
  { id: "g03", src: "/gallery/jogo-01-c.jpg", album: "Jogos", season: "2026", caption: "Torcida em peso na Vila" },
  { id: "g04", src: "/gallery/jogo-02-a.jpg", album: "Jogos", season: "2026", caption: "Mago cobra falta precisa" },
  { id: "g05", src: "/gallery/jogo-02-b.jpg", album: "Jogos", season: "2026", caption: "Vitória em casa adversária" },
  { id: "g06", src: "/gallery/jogo-03-a.jpg", album: "Jogos", season: "2026", caption: "Capitão abre o placar" },
  { id: "g07", src: "/gallery/jogo-04-a.jpg", album: "Jogos", season: "2026", caption: "Goleada 4 a 0 fora de casa" },
  { id: "g08", src: "/gallery/jogo-05-a.jpg", album: "Jogos", season: "2026", caption: "Enzo marca seu primeiro" },
  { id: "g09", src: "/gallery/jogo-07-a.jpg", album: "Jogos", season: "2026", caption: "Raio decide a goleada" },
  { id: "g10", src: "/gallery/elenco-01.jpg", album: "Elenco", season: "2026", caption: "Foto oficial da temporada" },
  { id: "g11", src: "/gallery/elenco-02.jpg", album: "Elenco", season: "2026", caption: "Comissão técnica" },
  { id: "g12", src: "/gallery/elenco-03.jpg", album: "Elenco", season: "2026", caption: "Elenco durante aquecimento" },
  { id: "g13", src: "/gallery/elenco-04.jpg", album: "Elenco", season: "2024", caption: "Elenco de 2024" },
  { id: "g14", src: "/gallery/bastidores-01.jpg", album: "Bastidores", season: "2026", caption: "Bastidores da pré-temporada" },
  { id: "g15", src: "/gallery/bastidores-02.jpg", album: "Bastidores", season: "2026", caption: "Descontração no vestiário" },
  { id: "g16", src: "/gallery/bastidores-03.jpg", album: "Bastidores", season: "2026", caption: "Reunião tática" },
  { id: "g17", src: "/gallery/bastidores-04.jpg", album: "Bastidores", season: "2024", caption: "Bastidores do fim de temporada" },
  { id: "g18", src: "/gallery/treinos-01.jpg", album: "Treinos", season: "2026", caption: "Treino físico" },
  { id: "g19", src: "/gallery/treinos-02.jpg", album: "Treinos", season: "2026", caption: "Trabalho de bola parada" },
  { id: "g20", src: "/gallery/treinos-03.jpg", album: "Treinos", season: "2026", caption: "Rachão fim de treino" },
  { id: "g21", src: "/gallery/artes-01.jpg", album: "Artes", season: "2026", caption: "Lançamento da nova camisa" },
  { id: "g22", src: "/gallery/artes-02.jpg", album: "Artes", season: "2026", caption: "Cartaz oficial da estreia" },
  { id: "g23", src: "/gallery/artes-03.jpg", album: "Artes", season: "2026", caption: "Arte de aniversário do clube" },
  { id: "g24", src: "/gallery/artes-04.jpg", album: "Artes", season: "2024", caption: "Cartaz do encerramento de 2024" },
];

export const gallery: GalleryPhoto[] = galleryRows.map((item) => ({ ...item, src: assetUrl(item.src) }));
