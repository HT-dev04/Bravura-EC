-- Fotos dos reforços do Municipal 2026, recortadas das artes de apresentação do Instagram @bravura_esporte_clube.

-- Só preenche quem ainda está sem foto; fotos já enviadas pelo admin não são trocadas.

UPDATE "Championship" AS c SET
  "players" = COALESCE((
    SELECT jsonb_agg(
      CASE WHEN COALESCE(atual.p->>'photo', '') = '' AND foto.photo IS NOT NULL
        THEN jsonb_set(atual.p, '{photo}', to_jsonb(foto.photo))
        ELSE atual.p
      END
      ORDER BY atual.ord
    )
    FROM jsonb_array_elements(c."players") WITH ORDINALITY AS atual(p, ord)
    LEFT JOIN (VALUES
      ('cp-municipal-taffarel', '/jogadores/municipal-2026/taffarel.jpg'),
      ('cp-municipal-jefim', '/jogadores/municipal-2026/jefim.jpg'),
      ('cp-municipal-lucas-sergio', '/jogadores/municipal-2026/lucas-sergio.jpg'),
      ('cp-municipal-alex', '/jogadores/municipal-2026/alex.jpg'),
      ('cp-municipal-savio', '/jogadores/municipal-2026/savio.jpg'),
      ('cp-municipal-danilo', '/jogadores/municipal-2026/danilo.jpg'),
      ('cp-municipal-ju', '/jogadores/municipal-2026/ju.jpg'),
      ('cp-municipal-ere', '/jogadores/municipal-2026/ere.jpg'),
      ('cp-municipal-ney-sampaio', '/jogadores/municipal-2026/ney-sampaio.jpg'),
      ('cp-municipal-carlim', '/jogadores/municipal-2026/carlim.jpg'),
      ('cp-municipal-rafael-parrao', '/jogadores/municipal-2026/rafael-parrao.jpg')
    ) AS foto(id, photo) ON foto.id = atual.p->>'id'
  ), '[]'::jsonb),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE c."slug" = 'campeonato-municipal-bugre-iapu-2026';
