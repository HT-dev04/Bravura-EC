"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { StatCard } from "@/components/site/StatCard";
import { fetchAdminChampionships, saveAdminChampionship } from "@/lib/admin-client";
import { getChampionshipSummary } from "@/lib/championship-stats";
import { cn } from "@/lib/utils";
import type { Championship, ChampionshipStatus, Player } from "@/types";
import { ImageField } from "./ImageField";
import { ChampionshipPlayersTab } from "./ChampionshipPlayersTab";
import { ChampionshipMatchesTab } from "./ChampionshipMatchesTab";
import { ChampionshipStandingsTab } from "./ChampionshipStandingsTab";
import { ChampionshipTeamsTab } from "./ChampionshipTeamsTab";

type Tab = "info" | "teams" | "standings" | "players" | "matches";

const tabs: { key: Tab; label: string }[] = [
  { key: "info", label: "Informações" },
  { key: "teams", label: "Times" },
  { key: "standings", label: "Classificação" },
  { key: "players", label: "Elenco" },
  { key: "matches", label: "Partidas" },
];

export default function AdminCampeonatoEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [clubPlayers, setClubPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("players");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminChampionships()
      .then((rows) => setChampionship(rows.find((row) => row.id === id) || null))
      .catch((error) => setError(error instanceof Error ? error.message : "Falha ao carregar campeonato"))
      .finally(() => setLoading(false));
    // Elenco dos amistosos: usado só para importar nome/foto/posição ao inscrever no campeonato.
    fetch("/api/admin/cms", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.players && setClubPlayers(data.players));
  }, [id]);

  async function persist(next: Championship) {
    setError(null);
    try {
      const saved = await saveAdminChampionship(next);
      setChampionship(saved);
      return saved;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Falha ao salvar campeonato");
      throw error;
    }
  }

  if (loading) return <p className="p-10 text-center text-brand-gray">Carregando campeonato...</p>;
  if (!championship) {
    return (
      <div className="p-4 md:p-10">
        <p className="mb-4 text-brand-gray">{error || "Campeonato não encontrado."}</p>
        <Link href="/admin/campeonatos" className="text-sm text-brand-gold hover:underline">
          Voltar para campeonatos
        </Link>
      </div>
    );
  }

  const summary = getChampionshipSummary(championship);

  return (
    <div className="p-4 md:p-10">
      <Link
        href="/admin/campeonatos"
        className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-brand-gray hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Campeonatos
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-brand-gold">Temporada {championship.season}</p>
          <h1 className="break-words font-display text-2xl uppercase md:text-4xl">{championship.name}</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/campeonatos/${championship.slug}`} target="_blank">
            <ExternalLink className="h-4 w-4" /> Ver no site
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Inscritos" value={championship.players.length} />
        <StatCard label="Jogos" value={summary.games} />
        <StatCard label="Vitórias" value={summary.wins} accent="gold" />
        <StatCard label="Empates" value={summary.draws} />
        <StatCard label="Derrotas" value={summary.losses} accent="red" />
        <StatCard label="Gols pró" value={summary.goalsFor} hint={`${summary.goalsAgainst} sofridos`} />
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-brand-border">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
              tab === item.key ? "border-brand-red text-white" : "border-transparent text-brand-gray hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-brand-red">{error}</p>}

      {tab === "teams" && <ChampionshipTeamsTab championship={championship} onSave={persist} onError={setError} />}
      {tab === "standings" && <ChampionshipStandingsTab championship={championship} onSave={persist} />}
      {tab === "info" && <InfoForm key={championship.id} championship={championship} onSave={persist} onError={setError} />}
      {tab === "players" && (
        <ChampionshipPlayersTab championship={championship} clubPlayers={clubPlayers} onSave={persist} onError={setError} />
      )}
      {tab === "matches" && <ChampionshipMatchesTab championship={championship} onSave={persist} onError={setError} />}
    </div>
  );
}

function InfoForm({
  championship,
  onSave,
  onError,
}: {
  championship: Championship;
  onSave: (next: Championship) => Promise<Championship>;
  onError: (message: string) => void;
}) {
  const [draft, setDraft] = useState(championship);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        try {
          // Elenco e partidas vêm do estado salvo para não sobrescrever o que foi lançado nas outras abas.
          const next = await onSave({
            ...draft,
            teams: championship.teams,
            groups: championship.groups,
            players: championship.players,
            matches: championship.matches,
          });
          setDraft(next);
          setSaved(true);
        } catch {
          // Mensagem já exibida pela página.
        } finally {
          setSaving(false);
        }
      }}
      className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <Label>Nome</Label>
        <Input required className="mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </div>
      <div>
        <Label>Temporada</Label>
        <Input required className="mt-1" value={draft.season} onChange={(e) => setDraft({ ...draft, season: e.target.value })} />
      </div>
      <div>
        <Label>Status</Label>
        <Select
          className="mt-1"
          value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value as ChampionshipStatus })}
        >
          <option value="planejado">Em breve</option>
          <option value="em_andamento">Em andamento</option>
          <option value="encerrado">Encerrado</option>
        </Select>
      </div>
      <div>
        <Label>Início</Label>
        <Input type="date" className="mt-1" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
      </div>
      <div>
        <Label>Fim</Label>
        <Input type="date" className="mt-1" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
      </div>
      <div>
        <Label>Colocação final</Label>
        <Input
          className="mt-1"
          placeholder="Ex: Campeão, Vice, 3º lugar"
          value={draft.finalPosition}
          onChange={(e) => setDraft({ ...draft, finalPosition: e.target.value })}
        />
      </div>
      <div>
        <Label>Endereço da página (slug)</Label>
        <Input
          className="mt-1"
          placeholder="gerado pelo nome"
          value={draft.slug}
          onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Descrição</Label>
        <Textarea
          rows={4}
          className="mt-1"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>
      <ImageField
        label="Logo do campeonato"
        value={draft.logo}
        onChange={(logo) => setDraft((prev) => ({ ...prev, logo }))}
        onError={onError}
        onUploadingChange={setUploading}
      />
      <ImageField
        label="Capa do card"
        value={draft.cover}
        onChange={(cover) => setDraft((prev) => ({ ...prev, cover }))}
        onError={onError}
        onUploadingChange={setUploading}
      />
      <div className="flex flex-wrap items-center justify-end gap-3 sm:col-span-2">
        {saved && <span className="text-xs text-green-500">Salvo!</span>}
        <Button type="submit" variant="primary" disabled={saving || uploading}>
          {saving ? "Salvando..." : "Salvar informações"}
        </Button>
      </div>
    </form>
  );
}
