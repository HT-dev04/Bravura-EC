---
name: create-bravura-site
description: Cria o projeto completo do site oficial do Bravura FC (portal de time de futebol amador baseado no Instagram @bugre_e.clube) em uma única execução. Use sempre que o usuário pedir para "criar o site do Bravura", "gerar o portal do Bravura", "montar o projeto do time", "criar site de futebol do Bravura" ou qualquer variação que envolva gerar do zero o portal, loja e área admin do Bravura FC. Deve ser acionada mesmo quando o usuário não mencionar explicitamente o nome "Bravura" mas estiver pedindo um portal de clube de futebol com a estrutura descrita (home, elenco, jogos, estatísticas, loja e admin).
---

# Create Bravura Site

Gera o projeto completo do portal oficial do **Bravura FC** em uma única execução, a partir de um único prompt do usuário. O objetivo é entregar um projeto pronto para rodar (`npm run dev`), com todas as páginas, loja e área admin descritas no briefing — usando dados mockados mas com estrutura pronta para backend real.

## Identidade do clube

- **Nome:** Bravura FC
- **Fonte de inspiração visual:** Instagram oficial `@bugre_e.clube` (https://www.instagram.com/bugre_e.clube)
- **Paleta obrigatória:**
  - Preto `#0A0A0A` (fundo principal)
  - Vermelho `#C8102E` (cor primária / destaques)
  - Dourado `#D4AF37` (acentos premium)
  - Branco `#FFFFFF` (texto / contraste)
- **Tom visual:** moderno, esportivo, premium, "cara de clube oficial". Tipografia impactante em títulos (condensed/uppercase), layouts com fotos grandes, diagonais sutis, números grandes em estatísticas.

> Sobre o Instagram: você **não** tem como baixar as imagens reais do Instagram em tempo de execução. Em vez disso, crie placeholders semânticos nomeados (`/public/players/<slug>.jpg`, `/public/gallery/<slug>.jpg`, `/public/sponsors/<slug>.svg`, `/public/logo/bravura.svg`) e gere um `README-assets.md` listando exatamente quais arquivos o usuário deve substituir pelas imagens reais do `@bugre_e.clube`. Para o escudo, gere um SVG simples provisório usando as cores do clube (círculo preto, inicial "B" dourada, borda vermelha) e deixe claro no README que é temporário.

## Stack obrigatória

- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS** (configurado com as cores do clube como tokens: `brand.black`, `brand.red`, `brand.gold`, `brand.white`)
- **shadcn/ui** para componentes base (button, card, input, select, dialog, tabs, table)
- **lucide-react** para ícones
- **recharts** para os gráficos simples de estatísticas
- **zustand** para estado do carrinho da loja
- Sem backend real: dados em `src/data/*.ts` com tipos fortes em `src/types/*.ts`

Justificativa: é a stack mais produtiva para entregar 12+ páginas públicas, loja e admin rodando localmente sem dependências externas.

## O que gerar (em uma execução)

Crie a árvore completa na pasta atual do projeto (`/Users/alefevt/Documentos/fut-portal`). Se já existir um `package.json`, confirme com o usuário antes de sobrescrever. Caso contrário, inicialize do zero.

### Estrutura de pastas

```
src/
  app/
    layout.tsx                 # layout raiz com header + footer, fontes, metadata
    page.tsx                   # Home
    o-clube/page.tsx
    elenco/page.tsx
    elenco/[slug]/page.tsx     # perfil do jogador
    jogos/page.tsx
    jogos/[id]/page.tsx        # detalhe da partida
    estatisticas/page.tsx
    galeria/page.tsx
    noticias/page.tsx
    noticias/[slug]/page.tsx
    patrocinadores/page.tsx
    contato/page.tsx
    loja/page.tsx
    loja/[slug]/page.tsx       # detalhe do produto
    loja/carrinho/page.tsx
    loja/checkout/page.tsx
    loja/pedido/[id]/page.tsx  # pedido finalizado
    admin/layout.tsx           # layout do admin com sidebar
    admin/page.tsx             # dashboard
    admin/jogadores/page.tsx
    admin/partidas/page.tsx
    admin/noticias/page.tsx
    admin/galeria/page.tsx
    admin/patrocinadores/page.tsx
    admin/produtos/page.tsx
    admin/pedidos/page.tsx
  components/
    site/Header.tsx
    site/Footer.tsx
    site/HeroBanner.tsx
    site/NextMatchCard.tsx
    site/LastResultCard.tsx
    site/PlayerCard.tsx
    site/MatchCard.tsx
    site/NewsCard.tsx
    site/SponsorGrid.tsx
    site/StatCard.tsx
    site/Lightbox.tsx
    shop/ProductCard.tsx
    shop/CartDrawer.tsx
    admin/Sidebar.tsx
    admin/DataTable.tsx
    ui/*                       # shadcn/ui
  data/
    players.ts
    matches.ts
    news.ts
    gallery.ts
    sponsors.ts
    products.ts
    stats.ts
    club.ts                    # história, missão, valores, linha do tempo
  types/
    index.ts
  lib/
    utils.ts
    cart-store.ts              # zustand
public/
  logo/bravura.svg             # escudo provisório
  players/*.jpg                # placeholders nomeados
  gallery/*.jpg
  sponsors/*.svg
  og.jpg
README-assets.md               # lista de assets a trocar pelos reais do Instagram
```

### Conteúdo mínimo obrigatório por página pública

Toda página deve herdar `Header` + `Footer` e ter metadata específica (`title`, `description`, `openGraph`). O footer deve conter: links principais, redes sociais, endereço/contato, copyright, e uma frase de efeito do clube.

**Home:** banner com escudo + claim, card "próximo jogo" (adversário, data, local, CTA), card "último resultado", faixa de destaques da temporada (3-4 stat cards), mini-ranking dos 5 melhores jogadores (goleadores), prévia da galeria (grid 2×3 com lightbox), 3 notícias recentes, grid de patrocinadores, banner CTA para loja, footer.

**O Clube:** história em bloco longo, cards de missão/visão/valores, linha do tempo vertical (`<ol>` estilizado), seção de identidade com escudo, lema, paleta de cores e mascote.

**Elenco:** header com contagem total, filtros por posição (Goleiro, Defensor, Meia, Atacante) em pills clicáveis, input de busca por nome/apelido com filtragem client-side, grid responsivo de `PlayerCard` (foto, número grande, nome, apelido, posição, mini-stats jogos/gols/assist). Link para perfil.

**Perfil do Jogador `[slug]`:** foto grande à esquerda, bloco à direita com nome, apelido, número (grande), posição, bio curta, tabela de estatísticas individuais, histórico dos últimos 5 jogos (lista), gráfico de linha por temporada (recharts).

**Jogos:** filtros (temporada, competição, resultado: V/E/D/todos) e lista vertical de `MatchCard` (escudos, data, local, placar, status). Clicável para detalhe.

**Detalhe da Partida `[id]`:** placar gigante, meta (data/local/competição), timeline vertical dos eventos (gols, assistências, cartões), bloco de escalação titular 11 + reservas utilizados, galeria da partida (grid + lightbox), card "destaque do jogo" (jogador + frase).

**Estatísticas:** stat cards no topo (jogos, V/E/D, gols pró/contra, aproveitamento %), quatro rankings lado a lado (artilheiros, assistências, mais jogos, participações em gol), dois gráficos simples recharts (gols por mês, aproveitamento por competição).

**Galeria:** filtros por álbum (Jogos, Elenco, Bastidores, Treinos, Artes) e temporada; grid masonry/responsive; lightbox ao clicar.

**Notícias:** notícia em destaque (card grande) + grid de notícias, filtro por categoria e input de busca.

**Detalhe da Notícia `[slug]`:** capa larga, título, data, categoria, conteúdo formatado (prose), bloco "notícias relacionadas" ao final.

**Patrocinadores:** grid com logos, bloco "benefícios de patrocinar o Bravura", cards de planos de parceria (Bronze/Prata/Ouro), botão CTA para contato.

**Contato:** cards com WhatsApp, Instagram, e-mail; formulário (nome, e-mail, assunto-select com [amistoso, patrocínio, contato geral, peneira, imprensa], mensagem). O submit pode apenas dar `toast` de sucesso — é mock.

### Loja

- **Listagem `/loja`:** seções "Em destaque", "Lançamentos", "Mais vendidos", grid por categoria (uniformes de jogo, treino, acessórios, promoções).
- **Detalhe `/loja/[slug]`:** galeria do produto, descrição, preço, seletor de tamanho (P/M/G/GG), indicador de estoque, botão "Adicionar ao carrinho".
- **Carrinho `/loja/carrinho`:** lista de itens, controle de quantidade, subtotal, botão finalizar.
- **Checkout `/loja/checkout`:** formulário (dados + endereço) + resumo do pedido. Submit mock.
- **Pedido finalizado `/loja/pedido/[id]`:** confirmação visual, número do pedido, resumo, CTA voltar à loja.
- `CartDrawer` acessível do header em todas as páginas da loja.

### Admin

Layout próprio com sidebar fixa (links: Dashboard, Jogadores, Partidas, Notícias, Galeria, Patrocinadores, Produtos, Pedidos). Sem autenticação real (deixar um TODO no topo do `admin/layout.tsx` explicando onde plugar autenticação depois).

- **Dashboard:** cards resumo (total de jogadores, próximas partidas, pedidos do mês, receita mockada) e gráfico simples.
- **Cada CRUD:** `DataTable` com colunas relevantes, botões "Novo" / "Editar" / "Excluir" abrindo um `Dialog` com formulário. As mutações alteram apenas o estado local (useState/zustand) — dados voltam ao mock no reload. Deixar comentário claro: `// TODO: substituir por chamada à API quando o backend for integrado`.
- **Partidas** deve permitir cadastrar gols, assistências e cartões dentro do form de edição (array editável).
- **Upload de imagens:** input `<input type="file">` que gera preview via `URL.createObjectURL` — não persiste.

### Responsividade

Todos os layouts devem funcionar em mobile (`sm`), tablet (`md`) e desktop (`lg+`). Teste mental obrigatório antes de finalizar: o header colapsa em menu hambúrguer, os grids reduzem colunas, as tabelas do admin ganham scroll horizontal.

## Dados mockados — volume mínimo

Para o site parecer real desde o primeiro `npm run dev`:

- **18 jogadores** (mix de posições, números únicos, apelidos, stats variadas)
- **12 partidas** (mistura de passadas com placar e futuras sem placar)
- **8 notícias** em 3 categorias (Bastidores, Jogos, Mercado)
- **24 fotos** na galeria (usar placeholders nomeados, distribuídos entre os álbuns)
- **6 patrocinadores**
- **12 produtos** na loja (camisas, treino, shorts, meiões, bonés, moletons)
- **estatísticas** derivadas dos jogos e jogadores

Os dados devem ser tipados (`src/types/index.ts`) e coerentes entre si — se um jogador tem 5 gols, esses gols aparecem nos eventos das partidas e no ranking de artilheiros.

## Passo a passo de execução

1. **Confirmar escopo.** Avise ao usuário que você vai gerar o projeto inteiro agora com a stack acima e que as imagens reais do Instagram precisarão ser baixadas manualmente depois (e por quê). Pergunte apenas se há algo a ajustar antes de começar. Se o usuário já foi claro ("faça"), siga direto.
2. **Inicializar Next.js** se `package.json` não existir: `npx create-next-app@latest . --ts --tailwind --app --src-dir --import-alias "@/*" --eslint --no-turbopack` (sem executar interativo — passe as flags). Confirme antes se houver arquivos existentes no diretório.
3. **Instalar dependências extras:** `npm install zustand recharts lucide-react clsx tailwind-merge class-variance-authority` e `npx shadcn@latest init` + `npx shadcn@latest add button card input select dialog tabs table badge` (não-interativo via flags quando possível, senão crie os componentes manualmente com base no shadcn).
4. **Configurar Tailwind** com as cores do clube como tokens em `tailwind.config.ts` (`brand.black/red/gold/white`) e fontes via `next/font` (sugestão: `Oswald` para títulos, `Inter` para corpo).
5. **Criar tipos e mocks** em `src/types` e `src/data` antes das páginas — isso evita retrabalho de refatoração.
6. **Criar componentes compartilhados** (`Header`, `Footer`, cards) antes das páginas.
7. **Gerar as páginas públicas** na ordem listada acima. Uma página de cada vez, completa. Não deixe `TODO` em páginas públicas — todas devem ter conteúdo visível.
8. **Gerar a loja e o admin.** Para o admin é aceitável deixar `// TODO: integração de backend` nos pontos de persistência, mas as telas precisam existir e navegar.
9. **Criar `README-assets.md`** listando exatamente os arquivos de `public/` que o usuário precisa substituir por imagens do `@bugre_e.clube`, com o nome e propósito de cada um.
10. **Rodar verificação final:** `npm run build` (ou `npm run lint` + `tsc --noEmit` se o build demorar). Corrija qualquer erro antes de declarar pronto.
11. **Relatório final ao usuário** em 5-8 linhas: o que foi gerado, como rodar (`npm run dev`), onde trocar as imagens reais, e quais TODOs ficaram para o backend.

## Regras importantes

- **Uma execução, projeto inteiro.** Não gere metade e pergunte "quer que eu continue?" — siga até o fim. Só pare se `npm run build` quebrar e precisar de decisão do usuário.
- **Dados coerentes.** Stats dos jogadores devem bater com os eventos das partidas. Se preguiça, gere as partidas primeiro e derive os stats a partir delas.
- **Sem emoji no código.** O usuário prefere sem emojis salvo quando pedir.
- **Sem comentários óbvios.** Só comente `// TODO: backend` nos pontos de integração real.
- **Paths dos placeholders devem existir.** Se você referencia `/players/joao.jpg`, crie um arquivo placeholder real no `public/players/` (pode ser um `.jpg` 1×1 ou um `.svg` com as iniciais). Caso contrário o Next.js vai quebrar no build de imagens.
- **Escudo provisório:** gere um SVG com borda vermelha, fundo preto e inicial "B" dourada centralizada. Deixe claro no `README-assets.md` que é temporário.
- **Não invente informação do Instagram.** Não escreva nomes de jogadores reais nem datas reais como se fossem verdadeiros — deixe claro nos mocks que são de exemplo (pode usar nomes fictícios tipo "João Bravura", "Ricardo Silva" etc.).

## Critério de pronto

- `npm run dev` sobe sem erro.
- `npm run build` passa sem erro.
- Todas as 12 rotas públicas renderizam com conteúdo visível.
- Loja permite adicionar item ao carrinho, ir ao checkout e ver página de pedido.
- Admin renderiza todas as telas com dados mockados.
- `README-assets.md` existe e lista os arquivos a trocar.
- Visual é coerente com a paleta preto/vermelho/dourado/branco em todas as telas.
