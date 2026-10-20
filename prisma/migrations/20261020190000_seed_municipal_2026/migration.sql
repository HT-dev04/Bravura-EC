-- Dados do 2º Campeonato Municipal Bugre-Iapu 2026 (times, grupos e notícias), tirados do Instagram @campeonatomunicipal.

-- Só preenche o campeonato se ele ainda não tiver times; notícias já existentes não são tocadas.

UPDATE "Championship" SET
  "teams" = $q$[{"id": "ct-municipal-bravura", "name": "Bravura", "logo": "/bravura-logo.svg", "isBravura": true}, {"id": "ct-municipal-mancha-verde", "name": "Mancha Verde", "logo": "/escudos/municipal-2026/mancha-verde.png"}, {"id": "ct-municipal-sao-lourenco", "name": "São Lourenço", "logo": "/escudos/municipal-2026/sao-lourenco.png"}, {"id": "ct-municipal-portugueses", "name": "Portugueses", "logo": "/escudos/municipal-2026/portugueses.png"}, {"id": "ct-municipal-barcelona", "name": "Barcelona", "logo": "/escudos/municipal-2026/barcelona.png"}, {"id": "ct-municipal-barra", "name": "Barra", "logo": "/escudos/municipal-2026/uniao.png"}]$q$::jsonb,
  "groups" = $q$[{"id": "cg-municipal-a", "name": "Grupo A", "teamIds": ["ct-municipal-bravura", "ct-municipal-mancha-verde", "ct-municipal-sao-lourenco"], "manual": {}}, {"id": "cg-municipal-b", "name": "Grupo B", "teamIds": ["ct-municipal-portugueses", "ct-municipal-barcelona", "ct-municipal-barra"], "manual": {}}]$q$::jsonb,
  "logo" = CASE WHEN "logo" = '' THEN '/escudos/municipal-2026/campeonato.png' ELSE "logo" END,
  "cover" = CASE WHEN "cover" = '' THEN '/escudos/municipal-2026/capa.jpg' ELSE "cover" END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'campeonato-municipal-bugre-iapu-2026' AND "teams" = '[]'::jsonb;

INSERT INTO "NewsItem" ("id", "slug", "title", "excerpt", "category", "author", "publishedAt", "cover", "content", "updatedAt")
VALUES ($q$n-municipal-2026-equipes$q$, $q$conheca-as-equipes-confirmadas-no-campeonato-municipal-bugre-iapu-2026$q$, $q$Conheça as equipes confirmadas no Campeonato Municipal Bugre-Iapu 2026$q$, $q$Bravura, Mancha Verde, São Lourenço, Portugueses, Barcelona e União Esporte Clube, o time da Barra: as seis equipes do Municipal estão confirmadas.$q$, $q$Bastidores$q$, 'Redação Bravura', $q$2026-10-20T19:40:00.000Z$q$, $q$/capas/municipal-2026/equipes-confirmadas.jpg$q$, $q$A organização do Campeonato Municipal Bugre-Iapu 2026 vem anunciando, uma a uma, as equipes confirmadas na segunda edição da competição.

Tiveram a participação oficializada: Bravura Futebol Clube, Mancha Verde Futebol Clube, São Lourenço Futebol Clube, Portugueses Futebol Clube, Barcelona I FC e União Esporte Clube, que representa a Barra e aparece como Barra na tabela de grupos.

Todas as equipes e seus escudos estão reunidos na aba Times da página do campeonato, aqui no site do Bravura.

Realizado pelas Prefeituras Municipais de Bugre e Iapu, o campeonato busca valorizar os talentos locais e promover a integração entre as comunidades dos dois municípios.$q$, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "NewsItem" ("id", "slug", "title", "excerpt", "category", "author", "publishedAt", "cover", "content", "updatedAt")
VALUES ($q$n-municipal-2026-grupos$q$, $q$grupos-definidos-bravura-no-grupo-a-do-campeonato-municipal-bugre-iapu-2026$q$, $q$Grupos definidos: Bravura está no Grupo A do 2º Campeonato Municipal Bugre-Iapu$q$, $q$Bravura, Mancha Verde e São Lourenço formam o Grupo A; Portugueses, Barcelona e Barra, o Grupo B. Na primeira fase, os times de um grupo enfrentam os do outro.$q$, $q$Jogos$q$, 'Redação Bravura', $q$2026-10-20T19:50:00.000Z$q$, $q$/capas/municipal-2026/grupos-definidos.jpg$q$, $q$A organização do 2º Campeonato Municipal 2026 de Bugre e Iapu divulgou a divisão das equipes da primeira fase. São dois grupos com três times cada.

Grupo A: Bravura, Mancha Verde e São Lourenço.

Grupo B: Portugueses, Barcelona e Barra (União Esporte Clube).

Na primeira fase, os grupos se cruzam: cada time do Grupo A enfrenta os três times do Grupo B. Os pontos conquistados contam na classificação do grupo de cada equipe.

Com isso, o Bravura terá pela frente Portugueses, Barcelona e Barra, enquanto Mancha Verde e São Lourenço, companheiros de grupo, disputam com o Leão as posições do Grupo A.

A classificação dos dois grupos fica na página do campeonato aqui no site e será atualizada a cada rodada, com pontos, jogos, vitórias, empates e derrotas de todas as equipes.

As datas e horários dos jogos ainda serão anunciados pela organização. O campeonato é uma realização das Prefeituras Municipais de Bugre e Iapu. Acompanhe as novidades também pelo Instagram oficial da competição, @campeonatomunicipal.$q$, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "NewsItem" ("id", "slug", "title", "excerpt", "category", "author", "publishedAt", "cover", "content", "updatedAt")
VALUES ($q$n-municipal-2026-adversarios$q$, $q$portugueses-barcelona-e-barra-os-adversarios-do-bravura-na-primeira-fase$q$, $q$Portugueses, Barcelona e Barra: os adversários do Bravura na primeira fase$q$, $q$No formato cruzado do Municipal, o Bravura, do Grupo A, enfrenta os três times do Grupo B. Veja como acompanhar a campanha do Leão.$q$, $q$Jogos$q$, 'Redação Bravura', $q$2026-10-20T20:00:00.000Z$q$, $q$/capas/municipal-2026/adversarios-bravura.jpg$q$, $q$Com os grupos definidos, o Bravura já conhece os adversários da primeira fase do 2º Campeonato Municipal Bugre-Iapu. Pelo formato da competição, os times do Grupo A enfrentam os do Grupo B, e o Leão vai encarar Portugueses, Barcelona e Barra.

Os três adversários já estão oficialmente confirmados: Portugueses Futebol Clube, Barcelona I FC e o União Esporte Clube, que representa a Barra.

Mesmo sem se enfrentarem na primeira fase, Bravura, Mancha Verde e São Lourenço disputam as posições do Grupo A: os pontos de cada um contra os times do Grupo B definem a classificação.

Aqui no site, a página do campeonato reúne a classificação dos grupos, os times participantes, as partidas do Bravura, a artilharia e as estatísticas de cada jogador inscrito na competição.

As datas dos jogos serão divulgadas pela organização. Fique de olho nas redes do Bravura e no Instagram @campeonatomunicipal.$q$, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
