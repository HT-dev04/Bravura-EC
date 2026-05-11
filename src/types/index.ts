export type Position = "Goleiro" | "Defensor" | "Meia" | "Atacante";

export interface PlayerStats {
  games: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
}

export interface Player {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  number: number;
  position: Position;
  birthDate: string;
  height: number;
  weight: number;
  preferredFoot: "Direito" | "Esquerdo" | "Ambos";
  photo: string;
  bio: string;
  season: string;
  stats: PlayerStats;
  history: { year: number; club: string }[];
  monthlyGoals: { month: string; goals: number }[];
}

export type MatchStatus = "agendada" | "em_andamento" | "encerrada";
export type MatchResult = "V" | "E" | "D";

export interface MatchEvent {
  minute: number;
  type: "gol" | "assistencia" | "cartao_amarelo" | "cartao_vermelho" | "substituicao";
  playerId: string;
  playerName: string;
  team: "bravura" | "adversario";
  description?: string;
}

export interface Match {
  id: string;
  opponent: string;
  opponentLogo: string;
  date: string;
  location: string;
  homeAway: "casa" | "fora";
  competition: string;
  season: string;
  status: MatchStatus;
  scoreHome: number | null;
  scoreAway: number | null;
  result: MatchResult | null;
  events: MatchEvent[];
  lineupStart: string[];
  lineupBench: string[];
  highlightPlayerId?: string;
  highlightQuote?: string;
  gallery: string[];
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Bastidores" | "Jogos" | "Mercado";
  author: string;
  publishedAt: string;
  cover: string;
  content: string;
}

export type GalleryAlbum = "Jogos" | "Elenco" | "Bastidores" | "Treinos" | "Artes";

export interface GalleryPhoto {
  id: string;
  src: string;
  mediaType?: "image" | "video";
  album: GalleryAlbum;
  season: string;
  caption: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: "Bronze" | "Prata" | "Ouro";
  website?: string;
}

export type ProductCategory =
  | "uniformes-jogo"
  | "treino"
  | "acessorios"
  | "promocoes";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  images: string[];
  description: string;
  sizes: ("P" | "M" | "G" | "GG")[];
  stock: number;
  featured: boolean;
  isNew: boolean;
  bestseller: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  status: "pendente" | "pago" | "enviado" | "entregue";
}

export type MonthlyPaymentStatus = "pendente" | "pago" | "isento";

export interface MonthlyPayment {
  playerId: string;
  month: string;
  status: MonthlyPaymentStatus;
  paidAt?: string;
}

export interface RevenueEntry {
  id: string;
  date: string;
  description: string;
  value: number;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  description: string;
  value: number;
}

export interface SponsorshipEntry {
  id: string;
  date: string;
  name: string;
  photo: string;
  purpose: string;
  value: number;
}

export interface FinanceData {
  monthlyFeeAmount: number;
  monthlyPayments: MonthlyPayment[];
  revenues: RevenueEntry[];
  expenses: ExpenseEntry[];
  sponsorships: SponsorshipEntry[];
}

export interface ClubInfo {
  name: string;
  founded: number;
  motto: string;
  history: string[];
  mission: string;
  vision: string;
  values: string[];
  timeline: { id: string; year: number; title: string; description: string }[];
  mascot: string;
}

export interface TeamStatsSummary {
  games: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  winRate: number;
  cleanSheets: number;
  goalsByMonth: { month: string; goals: number }[];
  winRateByCompetition: { competition: string; rate: number }[];
}

export interface CmsData {
  players: Player[];
  matches: Match[];
  news: NewsItem[];
  gallery: GalleryPhoto[];
  products: Product[];
  sponsors: Sponsor[];
  orders: Order[];
  teamStats: TeamStatsSummary;
  finance: FinanceData;
}
