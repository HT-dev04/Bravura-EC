-- Estreia do Bravura no 2º Campeonato Municipal Bugre-Iapu 2026: Bravura 1 x 1 União (Barra), 03/11 às 19h30.
-- Gol de Eraldo com assistência de Erê (lance divulgado pela @varzeatvcombuiu). O craque do jogo não foi do Bravura.

-- Atualiza a partida contra a Barra/União que ainda não estiver encerrada (a cadastrada no admin estava em 03/10);
-- se não houver nenhuma, cria a partida. Se o jogo já estiver encerrado no site, nada é alterado.

DO $$
DECLARE
  c RECORD;
  eraldo_id TEXT;
  ere_id TEXT;
  alvo INT;
  eventos JSONB;
  partida JSONB;
BEGIN
  SELECT * INTO c FROM "Championship" WHERE "slug" = 'campeonato-municipal-bugre-iapu-2026';
  IF NOT FOUND THEN RETURN; END IF;

  -- Já registrada (por esta migração ou pelo admin): não mexe.
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(c."matches") AS m(p)
    WHERE m.p->>'status' = 'encerrada'
      AND (m.p->>'opponentTeamId' = 'ct-municipal-barra' OR m.p->>'opponent' ILIKE ANY (ARRAY['%barra%', '%uni%']))
  ) THEN RETURN; END IF;

  SELECT p->>'id' INTO eraldo_id FROM jsonb_array_elements(c."players") AS j(p) WHERE lower(p->>'nickname') = 'eraldo' OR p->>'id' = 'cp-municipal-eraldo' LIMIT 1;
  SELECT p->>'id' INTO ere_id FROM jsonb_array_elements(c."players") AS j(p) WHERE lower(p->>'nickname') IN ('erê', 'ere') OR p->>'id' = 'cp-municipal-ere' LIMIT 1;

  eventos := jsonb_build_array(
    jsonb_build_object('minute', 0, 'type', 'gol', 'playerId', COALESCE(eraldo_id, ''), 'playerName', 'Eraldo', 'team', 'bravura'),
    jsonb_build_object('minute', 0, 'type', 'assistencia', 'playerId', COALESCE(ere_id, ''), 'playerName', 'Erê', 'team', 'bravura')
  );

  SELECT m.ord - 1 INTO alvo
  FROM jsonb_array_elements(c."matches") WITH ORDINALITY AS m(p, ord)
  WHERE m.p->>'opponentTeamId' = 'ct-municipal-barra' OR m.p->>'opponent' ILIKE ANY (ARRAY['%barra%', '%uni%'])
  ORDER BY m.p->>'date'
  LIMIT 1;

  IF alvo IS NOT NULL THEN
    partida := (c."matches"->alvo) - 'highlightPlayerId' || jsonb_build_object(
      'date', '2026-11-03T22:30:00.000Z',
      'status', 'encerrada',
      'scoreHome', 1,
      'scoreAway', 1,
      'groupStage', true,
      'events', eventos
    );
    IF COALESCE(partida->>'location', '') = '' THEN partida := partida || '{"location": "Campo do Bugre"}'::jsonb; END IF;
    IF COALESCE(partida->>'phase', '') = '' THEN partida := partida || '{"phase": "Fase de grupos"}'::jsonb; END IF;
    UPDATE "Championship" SET "matches" = jsonb_set("matches", ARRAY[alvo::text], partida), "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = c."id";
  ELSE
    partida := jsonb_build_object(
      'id', 'cm-municipal-2026-bravura-x-uniao',
      'opponent', 'Barra',
      'opponentTeamId', 'ct-municipal-barra',
      'groupStage', true,
      'opponentLogo', '',
      'date', '2026-11-03T22:30:00.000Z',
      'location', 'Campo do Bugre',
      'phase', 'Fase de grupos',
      'status', 'encerrada',
      'scoreHome', 1,
      'scoreAway', 1,
      'penaltiesHome', NULL,
      'penaltiesAway', NULL,
      'events', eventos,
      'lineup', '[]'::jsonb
    );
    UPDATE "Championship" SET "matches" = "matches" || jsonb_build_array(partida), "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = c."id";
  END IF;
END $$;
