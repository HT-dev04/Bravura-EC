"use client";

import { useMemo, useState } from "react";
import { Download, Hash, Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { createAdminId } from "@/lib/admin-id";
import {
  assignChampionshipNumbers,
  CHAMPIONSHIP_STAT_KEYS,
  CHAMPIONSHIP_STAT_LABELS,
  duplicatedChampionshipNumbers,
  getChampionshipPlayerStats,
  nextFreeChampionshipNumber,
} from "@/lib/championship-stats";
import type { Championship, ChampionshipPlayer, ChampionshipStatKey, Player, Position } from "@/types";
import { ImageField } from "./ImageField";

interface Props {
  championship: Championship;
  clubPlayers: Player[];
  onSave: (next: Championship) => Promise<Championship>;
  onError: (message: string) => void;
}

export function ChampionshipPlayersTab({ championship, clubPlayers, onSave, onError }: Props) {
  const [editing, setEditing] = useState<ChampionshipPlayer | null>(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const players = championship.players;
  const stats = useMemo(() => getChampionshipPlayerStats(championship), [championship]);
  const duplicates = duplicatedChampionshipNumbers(players);
  const missingNumbers = players.some((player) => player.number <= 0) || duplicates.size > 0;
  const rows = [...players].sort((a, b) => (a.number || 999) - (b.number || 999) || a.name.localeCompare(b.name));

  async function savePlayers(next: ChampionshipPlayer[]) {
    setSaving(true);
    try {
      await onSave({ ...championship, players: next });
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }

  function handleNew() {
    setEditing({
      id: createAdminId("cp"),
      name: "",
      nickname: "",
      number: nextFreeChampionshipNumber(players),
      position: "Atacante",
      photo: "",
    });
  }

  async function handleSave(player: ChampionshipPlayer) {
    const exists = players.some((row) => row.id === player.id);
    const next = exists ? players.map((row) => (row.id === player.id ? player : row)) : [...players, player];
    if (await savePlayers(next)) setEditing(null);
  }

  function handleDelete(selected: ChampionshipPlayer[]) {
    const ids = new Set(selected.map((player) => player.id));
    void savePlayers(players.filter((player) => !ids.has(player.id)));
  }

  const editingNumberTaken =
    editing && editing.number > 0 && players.some((player) => player.id !== editing.id && player.number === editing.number);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={handleNew}>
          <Plus className="h-4 w-4" /> Novo jogador
        </Button>
        <Button variant="outline" onClick={() => setImporting(true)} disabled={clubPlayers.length === 0}>
          <Download className="h-4 w-4" /> Importar do elenco
        </Button>
        <Button
          variant="outline"
          onClick={() => void savePlayers(assignChampionshipNumbers(players))}
          disabled={!missingNumbers || saving}
          title="Dá número a quem está sem número ou com número repetido"
        >
          <Hash className="h-4 w-4" /> Gerar números
        </Button>
      </div>
      <p className="mb-4 text-xs text-brand-gray">
        Jogadores inscritos só neste campeonato. Número e estatísticas daqui não mudam nada no elenco dos amistosos.
        {duplicates.size > 0 && (
          <span className="ml-1 font-semibold text-brand-red">Números repetidos: {Array.from(duplicates).join(", ")}.</span>
        )}
      </p>

      <DataTable
        columns={[
          {
            key: "number",
            label: "#",
            className: "w-12",
            render: (r) => (
              <span className={duplicates.has(r.number) ? "font-bold text-brand-red" : "font-bold text-brand-gold"}>
                {r.number > 0 ? r.number : "—"}
              </span>
            ),
          },
          { key: "name", label: "Nome" },
          { key: "nickname", label: "Apelido" },
          { key: "position", label: "Posição" },
          { key: "games", label: "J", render: (r) => stats.get(r.id)?.games ?? 0 },
          { key: "goals", label: "G", render: (r) => stats.get(r.id)?.goals ?? 0 },
          { key: "assists", label: "A", render: (r) => stats.get(r.id)?.assists ?? 0 },
          {
            key: "cards",
            label: "Cartões",
            render: (r) => `${stats.get(r.id)?.yellowCards ?? 0} / ${stats.get(r.id)?.redCards ?? 0}`,
          },
        ]}
        rows={rows}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => handleDelete([r])}
        onBulkDelete={handleDelete}
      />

      {editing && (
        <Dialog
          open
          onClose={() => setEditing(null)}
          title={players.some((row) => row.id === editing.id) ? "Editar inscrito" : "Novo inscrito"}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editing);
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <Label>Nome</Label>
              <Input required className="mt-1" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <Label>Apelido</Label>
              <Input className="mt-1" value={editing.nickname} onChange={(e) => setEditing({ ...editing, nickname: e.target.value })} />
            </div>
            <div>
              <Label>Número no campeonato</Label>
              <div className="mt-1 flex gap-2 [&>button]:shrink-0">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={editing.number || ""}
                  onChange={(e) => setEditing({ ...editing, number: e.target.value === "" ? 0 : +e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing({ ...editing, number: nextFreeChampionshipNumber(players.filter((p) => p.id !== editing.id)) })
                  }
                >
                  Gerar
                </Button>
              </div>
              {editingNumberTaken && <p className="mt-1 text-xs text-brand-red">Esse número já está com outro inscrito.</p>}
            </div>
            <div>
              <Label>Posição</Label>
              <Select
                className="mt-1"
                value={editing.position}
                onChange={(e) => setEditing({ ...editing, position: e.target.value as Position })}
              >
                <option>Goleiro</option>
                <option>Defensor</option>
                <option>Meia</option>
                <option>Atacante</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <ImageField
                label="Foto"
                value={editing.photo}
                onChange={(photo) => setEditing((prev) => (prev ? { ...prev, photo } : prev))}
                onError={onError}
                onUploadingChange={setUploading}
              />
            </div>

            <div className="rounded-sm border border-brand-border bg-brand-black p-3 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">Ajuste manual</p>
              <p className="mb-3 text-xs text-brand-gray">
                Somado ao que as partidas do campeonato já contam. Use para lances sem partida cadastrada (pode ser negativo).
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {CHAMPIONSHIP_STAT_KEYS.map((key) => (
                  <AdjustInput key={key} statKey={key} player={editing} onChange={setEditing} />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving || uploading}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {importing && (
        <ImportDialog
          players={players}
          clubPlayers={clubPlayers}
          saving={saving}
          onClose={() => setImporting(false)}
          onImport={async (imported) => {
            if (await savePlayers([...players, ...imported])) setImporting(false);
          }}
        />
      )}
    </div>
  );
}

function AdjustInput({
  statKey,
  player,
  onChange,
}: {
  statKey: ChampionshipStatKey;
  player: ChampionshipPlayer;
  onChange: (player: ChampionshipPlayer) => void;
}) {
  const value = player.adjust?.[statKey] || 0;
  return (
    <div>
      <Label className="text-[10px]">{CHAMPIONSHIP_STAT_LABELS[statKey]}</Label>
      <Input
        type="number"
        className="mt-1"
        placeholder="0"
        value={value || ""}
        onChange={(e) =>
          onChange({ ...player, adjust: { ...player.adjust, [statKey]: e.target.value === "" ? 0 : Math.trunc(+e.target.value) } })
        }
      />
    </div>
  );
}

function ImportDialog({
  players,
  clubPlayers,
  saving,
  onClose,
  onImport,
}: {
  players: ChampionshipPlayer[];
  clubPlayers: Player[];
  saving: boolean;
  onClose: () => void;
  onImport: (players: ChampionshipPlayer[]) => void;
}) {
  const alreadyIn = new Set(players.map((player) => player.sourcePlayerId).filter(Boolean));
  const available = clubPlayers.filter((player) => !alreadyIn.has(player.id));
  const [selected, setSelected] = useState<string[]>([]);
  const [keepNumbers, setKeepNumbers] = useState(true);

  function build() {
    const result: ChampionshipPlayer[] = [];
    for (const source of available.filter((player) => selected.includes(player.id))) {
      const taken = [...players, ...result];
      result.push({
        id: createAdminId("cp"),
        name: source.name,
        nickname: source.nickname,
        number: nextFreeChampionshipNumber(taken, keepNumbers ? source.number : undefined),
        position: source.position,
        photo: source.photo,
        sourcePlayerId: source.id,
      });
    }
    return result;
  }

  return (
    <Dialog open onClose={onClose} title="Importar do elenco">
      <p className="mb-3 text-xs text-brand-gray">
        Copia nome, apelido, posição e foto. O inscrito começa zerado no campeonato — gols e jogos dos amistosos não vêm junto.
      </p>
      {available.length === 0 ? (
        <p className="rounded-sm border border-dashed border-brand-border p-4 text-sm text-brand-gray">
          Todos os jogadores do elenco já estão inscritos.
        </p>
      ) : (
        <>
          <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-brand-gray">
            <input
              type="checkbox"
              checked={selected.length === available.length}
              onChange={() => setSelected(selected.length === available.length ? [] : available.map((player) => player.id))}
            />
            Selecionar todos
          </label>
          <div className="grid max-h-[45vh] gap-1 overflow-y-auto rounded-sm border border-brand-border p-2 sm:grid-cols-2">
            {available.map((player) => (
              <label key={player.id} className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={selected.includes(player.id)}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(player.id) ? current.filter((id) => id !== player.id) : [...current, player.id]
                    )
                  }
                />
                <span className="w-7 font-bold text-brand-gold">{player.number}</span>
                <span className="min-w-0 truncate">{player.nickname || player.name}</span>
              </label>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={keepNumbers} onChange={(e) => setKeepNumbers(e.target.checked)} />
            Manter o número do elenco quando estiver livre (senão, gera um novo)
          </label>
        </>
      )}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" variant="primary" disabled={saving || selected.length === 0} onClick={() => onImport(build())}>
          {saving ? "Importando..." : `Importar ${selected.length || ""}`.trim()}
        </Button>
      </div>
    </Dialog>
  );
}
