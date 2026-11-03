-- Trio de reforços revelado no Instagram @bravura_esporte_clube (Magnum, Michelzinho e Eraldo) para o 2º Campeonato Municipal Bugre-Iapu 2026, já com foto.
-- Magnum aparece como "Magno" em uma das legendas; o nome usado é o da arte de apresentação.

-- Só acrescenta quem ainda não estiver inscrito (mesmo id ou mesmo apelido); inscritos existentes não são tocados.

UPDATE "Championship" AS c SET
  "players" = c."players" || COALESCE((
    SELECT jsonb_agg(novo.p ORDER BY novo.ord)
    FROM jsonb_array_elements($q$[
      {"id": "cp-municipal-magnum", "name": "Magnum", "nickname": "Magnum", "number": 21, "position": "Meia", "photo": "/jogadores/municipal-2026/magnum.jpg"},
      {"id": "cp-municipal-michelzinho", "name": "Michelzinho", "nickname": "Michelzinho", "number": 22, "position": "Meia", "photo": "/jogadores/municipal-2026/michelzinho.jpg"},
      {"id": "cp-municipal-eraldo", "name": "Eraldo", "nickname": "Eraldo", "number": 23, "position": "Atacante", "photo": "/jogadores/municipal-2026/eraldo.jpg"}
    ]$q$::jsonb) WITH ORDINALITY AS novo(p, ord)
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(c."players") AS atual(p)
      WHERE atual.p->>'id' = novo.p->>'id' OR lower(atual.p->>'nickname') IN (lower(novo.p->>'nickname'), CASE WHEN novo.p->>'id' = 'cp-municipal-magnum' THEN 'magno' END)
    )
  ), '[]'::jsonb),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE c."slug" = 'campeonato-municipal-bugre-iapu-2026';
