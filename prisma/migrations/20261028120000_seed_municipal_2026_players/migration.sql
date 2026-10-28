-- Reforços do Bravura apresentados no Instagram @bravura_esporte_clube, inscritos no 2º Campeonato Municipal Bugre-Iapu 2026.
-- Faim, Diegão, Clebinho, Gean Pico e Claudinho, também apresentados, já estavam inscritos.

-- Só acrescenta quem ainda não estiver inscrito (mesmo id ou mesmo apelido); inscritos existentes não são tocados.

UPDATE "Championship" AS c SET
  "players" = c."players" || COALESCE((
    SELECT jsonb_agg(novo.p ORDER BY novo.ord)
    FROM jsonb_array_elements($q$[
      {"id": "cp-municipal-taffarel", "name": "Taffarel", "nickname": "Taffarel", "number": 1, "position": "Goleiro", "photo": ""},
      {"id": "cp-municipal-jefim", "name": "Jefim", "nickname": "Jefim", "number": 12, "position": "Goleiro", "photo": ""},
      {"id": "cp-municipal-lucas-sergio", "name": "Lucas Sérgio", "nickname": "Lucas Sérgio", "number": 13, "position": "Defensor", "photo": ""},
      {"id": "cp-municipal-alex", "name": "Alex", "nickname": "Alex", "number": 14, "position": "Defensor", "photo": ""},
      {"id": "cp-municipal-savio", "name": "Sávio", "nickname": "Sávio", "number": 5, "position": "Meia", "photo": ""},
      {"id": "cp-municipal-danilo", "name": "Danilo", "nickname": "Danilo", "number": 8, "position": "Meia", "photo": ""},
      {"id": "cp-municipal-ju", "name": "Ju", "nickname": "Ju", "number": 10, "position": "Meia", "photo": ""},
      {"id": "cp-municipal-ere", "name": "Erê", "nickname": "Erê", "number": 7, "position": "Atacante", "photo": ""},
      {"id": "cp-municipal-ney-sampaio", "name": "Ney Sampaio", "nickname": "Ney Sampaio", "number": 15, "position": "Atacante", "photo": ""},
      {"id": "cp-municipal-carlim", "name": "Carlim Papa-Léguas", "nickname": "Carlim Papa-Léguas", "number": 16, "position": "Atacante", "photo": ""},
      {"id": "cp-municipal-rafael-parrao", "name": "Rafael Parrão", "nickname": "Rafael Parrão", "number": 17, "position": "Atacante", "photo": ""}
    ]$q$::jsonb) WITH ORDINALITY AS novo(p, ord)
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(c."players") AS atual(p)
      WHERE atual.p->>'id' = novo.p->>'id' OR lower(atual.p->>'nickname') = lower(novo.p->>'nickname')
    )
  ), '[]'::jsonb),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE c."slug" = 'campeonato-municipal-bugre-iapu-2026';
