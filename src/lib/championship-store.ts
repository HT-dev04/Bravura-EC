import "server-only";

import { connection } from "next/server";
import { assetUrl } from "@/lib/asset-url";
import { sanitizeChampionshipAdjust } from "@/lib/championship-stats";
import { withDatabaseRetry } from "@/lib/database-retry";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type {
  Championship,
  ChampionshipMatch,
  ChampionshipPlayer,
  ChampionshipStatus,
  MatchEvent,
  MatchStatus,
  Position,
} from "@/types";
import type { Prisma } from "@/generated/prisma/client";

type ChampionshipRow = Awaited<ReturnType<typeof prisma.championship.findMany>>[number];

const STATUSES: ChampionshipStatus[] = ["planejado", "em_andamento", "encerrado"];
const MATCH_STATUSES: MatchStatus[] = ["agendada", "em_andamento", "encerrada"];
const POSITIONS: Position[] = ["Goleiro", "Defensor", "Meia", "Atacante"];
const EVENT_TYPES: MatchEvent["type"][] = ["gol", "assistencia", "cartao_amarelo", "cartao_vermelho", "substituicao"];

function json<T>(value: T) {
  return value as Prisma.InputJsonValue;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function int(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

function score(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : null;
}

function oneOf<T extends string>(value: unknown, options: T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

function sanitizePlayers(players: unknown): ChampionshipPlayer[] {
  const rows = new Map<string, ChampionshipPlayer>();
  for (const item of Array.isArray(players) ? (players as ChampionshipPlayer[]) : []) {
    const id = text(item?.id);
    const name = text(item?.name);
    if (!id || !name) continue;
    const player: ChampionshipPlayer = {
      id,
      name,
      nickname: text(item.nickname),
      number: Math.max(0, int(item.number)),
      position: oneOf(item.position, POSITIONS, "Atacante"),
      photo: text(item.photo),
      ...(text(item.sourcePlayerId) ? { sourcePlayerId: text(item.sourcePlayerId) } : {}),
    };
    const adjust = sanitizeChampionshipAdjust({ ...player, adjust: item.adjust });
    rows.set(id, adjust ? { ...player, adjust } : player);
  }
  return Array.from(rows.values());
}

function sanitizeMatches(matches: unknown, playerIds: Set<string>): ChampionshipMatch[] {
  const rows = new Map<string, ChampionshipMatch>();
  for (const item of Array.isArray(matches) ? (matches as ChampionshipMatch[]) : []) {
    const id = text(item?.id);
    const opponent = text(item?.opponent);
    if (!id || !opponent) continue;
    const highlightPlayerId = text(item.highlightPlayerId);
    rows.set(id, {
      id,
      opponent,
      opponentLogo: text(item.opponentLogo),
      date: text(item.date),
      location: text(item.location),
      phase: text(item.phase),
      status: oneOf(item.status, MATCH_STATUSES, "agendada"),
      scoreHome: score(item.scoreHome),
      scoreAway: score(item.scoreAway),
      penaltiesHome: score(item.penaltiesHome),
      penaltiesAway: score(item.penaltiesAway),
      events: (Array.isArray(item.events) ? item.events : [])
        .filter((event) => EVENT_TYPES.includes(event?.type))
        .map((event) => ({
          minute: Math.max(0, int(event.minute)),
          type: event.type,
          playerId: playerIds.has(text(event.playerId)) ? text(event.playerId) : "",
          playerName: text(event.playerName),
          team: event.team === "adversario" ? "adversario" : "bravura",
          ...(text(event.description) ? { description: text(event.description) } : {}),
        })),
      lineup: Array.from(new Set((Array.isArray(item.lineup) ? item.lineup : []).filter((playerId) => playerIds.has(playerId)))),
      ...(playerIds.has(highlightPlayerId) ? { highlightPlayerId } : {}),
    });
  }
  return Array.from(rows.values()).sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

function sanitizeChampionship(input: Championship): Championship {
  const players = sanitizePlayers(input.players);
  const playerIds = new Set(players.map((player) => player.id));
  const name = text(input.name);
  const season = text(input.season) || String(new Date().getFullYear());

  return {
    id: text(input.id),
    slug: slugify(text(input.slug) || `${name} ${season}`),
    name,
    season,
    logo: text(input.logo),
    cover: text(input.cover),
    description: text(input.description),
    status: oneOf(input.status, STATUSES, "em_andamento"),
    startDate: text(input.startDate),
    endDate: text(input.endDate),
    finalPosition: text(input.finalPosition),
    players,
    matches: sanitizeMatches(input.matches, playerIds),
  };
}

function fromRow(row: ChampionshipRow): Championship {
  const players = row.players as unknown as ChampionshipPlayer[];
  const matches = row.matches as unknown as ChampionshipMatch[];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    season: row.season,
    logo: assetUrl(row.logo),
    cover: assetUrl(row.cover),
    description: row.description,
    status: row.status as ChampionshipStatus,
    startDate: row.startDate,
    endDate: row.endDate,
    finalPosition: row.finalPosition,
    players: players.map((player) => ({ ...player, photo: assetUrl(player.photo) })),
    matches: matches.map((match) => ({ ...match, opponentLogo: assetUrl(match.opponentLogo) })),
  };
}

function toRow(championship: Championship) {
  return {
    slug: championship.slug,
    name: championship.name,
    season: championship.season,
    logo: championship.logo,
    cover: championship.cover,
    description: championship.description,
    status: championship.status,
    startDate: championship.startDate,
    endDate: championship.endDate,
    finalPosition: championship.finalPosition,
    players: json(championship.players),
    matches: json(championship.matches),
  };
}

export async function listChampionships(): Promise<Championship[]> {
  await connection();
  const rows = await withDatabaseRetry(() =>
    prisma.championship.findMany({ orderBy: [{ season: "desc" }, { startDate: "desc" }, { createdAt: "desc" }] })
  );
  return rows.map(fromRow);
}

export async function getChampionshipBySlug(slug: string): Promise<Championship | null> {
  await connection();
  const row = await withDatabaseRetry(() => prisma.championship.findUnique({ where: { slug } }));
  return row ? fromRow(row) : null;
}

/** Slug do jogador do elenco (amistosos) para linkar o perfil, se o inscrito foi importado de lá. */
export async function getClubPlayerSlug(playerId?: string) {
  if (!playerId) return null;
  const row = await withDatabaseRetry(() => prisma.player.findUnique({ where: { id: playerId }, select: { slug: true } }));
  return row?.slug || null;
}

async function uniqueSlug(base: string, id: string) {
  const fallback = base || "campeonato";
  let slug = fallback;
  for (let suffix = 2; ; suffix++) {
    const existing = await prisma.championship.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === id) return slug;
    slug = `${fallback}-${suffix}`;
  }
}

export class ChampionshipValidationError extends Error {}

export async function saveChampionship(input: Championship): Promise<Championship> {
  const championship = sanitizeChampionship(input);
  if (!championship.id) throw new ChampionshipValidationError("Campeonato sem ID");
  if (!championship.name) throw new ChampionshipValidationError("Informe o nome do campeonato");

  return withDatabaseRetry(async () => {
    championship.slug = await uniqueSlug(championship.slug, championship.id);
    const data = toRow(championship);
    const row = await prisma.championship.upsert({
      where: { id: championship.id },
      update: data,
      create: { id: championship.id, ...data },
    });
    return fromRow(row);
  });
}

export async function deleteChampionship(id: string) {
  await withDatabaseRetry(() => prisma.championship.deleteMany({ where: { id } }));
}
