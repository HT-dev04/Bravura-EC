-- 1ª rodada do 2º Campeonato Municipal Bugre-Iapu 2026: os jogos entre os outros times (classificação publicada pela @campeonatomunicipal em 06/11).
--   04/11, Iapu:  Portugueses 1 x 3 São Lourenço
--   05/11, Bugre: Mancha Verde 3 x 3 Barcelona
-- O jogo do Bravura (1 x 1 União/Barra) já entra sozinho pela partida; aqui vão só os campos manuais (V, E, D, GP, GC) de cada grupo.

-- Preenche só o time que ainda não tem nada lançado à mão: se o admin já tiver mexido, nada é alterado.

DO $$
DECLARE
  c RECORD;
  grupos JSONB;
  g JSONB;
  gi INT;
  novos JSONB;
  r RECORD;
  atual JSONB;
BEGIN
  SELECT * INTO c FROM "Championship" WHERE "slug" = 'campeonato-municipal-bugre-iapu-2026';
  IF NOT FOUND THEN RETURN; END IF;
  grupos := c."groups";

  novos := $q${
    "ct-municipal-sao-lourenco": {"wins": 1, "draws": 0, "losses": 0, "goalsFor": 3, "goalsAgainst": 1},
    "ct-municipal-portugueses":  {"wins": 0, "draws": 0, "losses": 1, "goalsFor": 1, "goalsAgainst": 3},
    "ct-municipal-mancha-verde": {"wins": 0, "draws": 1, "losses": 0, "goalsFor": 3, "goalsAgainst": 3},
    "ct-municipal-barcelona":    {"wins": 0, "draws": 1, "losses": 0, "goalsFor": 3, "goalsAgainst": 3}
  }$q$::jsonb;

  FOR r IN SELECT key AS team_id, value AS stats FROM jsonb_each(novos) LOOP
    -- Grupo em que o time está hoje.
    SELECT m.ord - 1, m.g INTO gi, g
    FROM jsonb_array_elements(grupos) WITH ORDINALITY AS m(g, ord)
    WHERE m.g->'teamIds' ? r.team_id
    LIMIT 1;
    IF gi IS NULL THEN CONTINUE; END IF;

    atual := COALESCE(g->'manual'->r.team_id, '{}'::jsonb);
    IF EXISTS (SELECT 1 FROM jsonb_each_text(atual) AS s(k, v) WHERE v ~ '^\s*[0-9]+' AND v::numeric > 0) THEN CONTINUE; END IF;

    grupos := jsonb_set(
      grupos,
      ARRAY[gi::text, 'manual'],
      COALESCE(g->'manual', '{}'::jsonb) || jsonb_build_object(r.team_id, r.stats)
    );
  END LOOP;

  UPDATE "Championship" SET "groups" = grupos, "updatedAt" = CURRENT_TIMESTAMP
  WHERE "id" = c."id" AND "groups" IS DISTINCT FROM grupos;
END $$;
