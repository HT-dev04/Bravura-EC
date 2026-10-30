-- Novos reforços do Bravura apresentados no Instagram @bravura_esporte_clube para o 2º Campeonato Municipal Bugre-Iapu 2026, já com foto.
-- Warley Boi entrou na comissão técnica (auxiliar técnico) e por isso não é inscrito como jogador.

-- Só acrescenta quem ainda não estiver inscrito (mesmo id ou mesmo apelido); inscritos existentes não são tocados.

UPDATE "Championship" AS c SET
  "players" = c."players" || COALESCE((
    SELECT jsonb_agg(novo.p ORDER BY novo.ord)
    FROM jsonb_array_elements($q$[
      {"id": "cp-municipal-jhon-jhon", "name": "Jhon Jhon", "nickname": "Jhon Jhon", "number": 6, "position": "Meia", "photo": "/jogadores/municipal-2026/jhon-jhon.jpg"},
      {"id": "cp-municipal-kaka", "name": "Kaká", "nickname": "Kaká", "number": 18, "position": "Atacante", "photo": "/jogadores/municipal-2026/kaka.jpg"},
      {"id": "cp-municipal-alan-camarao", "name": "Alan Camarão", "nickname": "Alan Camarão", "number": 19, "position": "Meia", "photo": "/jogadores/municipal-2026/alan-camarao.jpg"},
      {"id": "cp-municipal-casemiro", "name": "Casemiro", "nickname": "Casemiro", "number": 20, "position": "Defensor", "photo": "/jogadores/municipal-2026/casemiro.jpg"}
    ]$q$::jsonb) WITH ORDINALITY AS novo(p, ord)
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(c."players") AS atual(p)
      WHERE atual.p->>'id' = novo.p->>'id' OR lower(atual.p->>'nickname') = lower(novo.p->>'nickname')
    )
  ), '[]'::jsonb),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE c."slug" = 'campeonato-municipal-bugre-iapu-2026';
