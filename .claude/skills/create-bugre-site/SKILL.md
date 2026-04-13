---
name: create-bugre-site
description: Cria o projeto completo do site oficial do Bugre Esporte Clube MG (portal do time de futebol amador do Instagram @bugre_e.clube) em uma única execução. Use sempre que o usuário pedir para "criar o site do Bugre", "gerar o portal do Bugre", "montar o site do Bugre EC", "fazer o portal do bugre_e.clube" ou qualquer variação que envolva gerar do zero o portal, loja e área admin do clube Bugre. Deve ser acionada mesmo quando o usuário não citar "Bugre" explicitamente, mas pedir um portal de clube amador baseado no Instagram @bugre_e.clube com estrutura de home, elenco, jogos, estatísticas, galeria, loja e admin.
---

# Create Bugre Site

Gera o projeto completo do portal oficial do **Bugre Esporte Clube MG** em uma única execução, a partir de um único prompt do usuário. Entrega um projeto pronto para rodar (`npm run dev`), com todas as páginas, loja e área admin — usando dados mockados mas com estrutura pronta para backend real, e tentando buscar assets reais (logo e fotos) do Instagram `@bugre_e.clube` antes de cair em placeholders.

## Identidade do clube

- **Nome oficial:** Bugre Esporte Clube MG
- **Apelido curto:** Bugre EC (ou apenas Bugre)
- **Estado:** Minas Gerais (MG), Brasil
- **Fonte oficial:** Instagram `@bugre_e.clube` — https://www.instagram.com/bugre_e.clube
- **Tom visual:** moderno, esportivo, "cara de clube oficial amador forte". Tipografia impactante em títulos (condensed/uppercase), fotos grandes, números gigantes em estatísticas, diagonais sutis.

### Paleta

Use a paleta do clube detectada a partir do Instagram. Se não conseguir detectar com confiança, use este fallback neutro-esportivo e **registre no `README-assets.md`** que a paleta precisa ser conferida pelo usuário:

- Preto `#0A0A0A` (fundo principal)
- Vermelho `#C8102E` (cor primária / destaques)
- Dourado `#D4AF37` (acentos premium)
- Branco `#FFFFFF` (texto / contraste)

Configure-as em `tailwind.config.ts` como tokens `brand.black`, `brand.red`, `brand.gold`, `brand.white` para facilitar troca posterior.

### Busca de assets reais do Instagram

Instagram bloqueia scraping direto, então trate captura de assets como **melhor esforço**, nunca como bloqueio:

1. Tente `WebFetch` em `https://www.instagram.com/bugre_e.clube` pedindo: bio, localização, ano de fundação, cores predominantes, lema, nomes destacados. Use o que conseguir extrair para popular `src/data/club.ts`. Se não vier nada útil, deixe os campos com valores genéricos plausíveis marcados com `// TODO: confirmar com usuário`.
2. **Não invente** nomes reais de jogadores, datas de partidas reais ou placares reais. Se não tiver confirmação, os mocks devem usar nomes claramente fictícios (ex.: "João Bugre", "Ricardo Silva", "Pedro Monte").
3. Para **logo/escudo**: gere um SVG provisório (círculo preto, borda vermelha, letra "B" dourada centralizada) em `public/logo/bugre.svg`. Liste no `README-assets.md` como temporário.
4. Para fotos de jogadores, galeria e patrocinadores: crie placeholders nomeados semanticamente (`public/players/<slug>.jpg`, `public/gallery/<slug>.jpg`, `public/sponsors/<slug>.svg`) — podem ser SVGs 1:1 com iniciais ou cor sólida da paleta. O Next.js precisa que o arquivo exista no build.
5. Gere `README-assets.md` na raiz listando **cada arquivo** a ser substituído pela imagem real do `@bugre_e.clube`, explicando o propósito de cada um e como baixar (salvar a imagem do post do Instagram e renomear para o path indicado).

## Stack obrigatória

- **Next.js 14+** (App Router, TypeScript, `src/` directory)
- **Tailwind CSS** (tokens `brand.*`)
- **shadcn/ui** (button, card, input, select, dialog, tabs, table, badge)
- **lucide-react** (ícones)
- **recharts** (gráficos de estatísticas)
- **zustand** (estado do carrinho)
- Sem backend real: dados em `src/data/*.ts` tipados em `src/types/index.ts`

> Antes de escrever código, leia `node_modules/next/dist/docs/` (o projeto usa uma versão recente com possíveis breaking changes) caso o `package.json` já exista.

## O que gerar (em uma execução)

Crie a árvore completa na pasta atual do projeto (`/Users/alefevt/Documentos/fut-portal`). Se já existir `package.json`, confirme com o usuário antes de sobrescrever. Caso contrário, inicialize do zero.

### Estrutura de pastas

```
src/
  app/
    layout.tsx                 # layout raiz (header + footer, fontes, metadata)
    page.tsx                   # Home
    o-clube/page.tsx
    elenco/page.tsx
    elenco/[slug]/page.tsx
    jogos/page.tsx
    jogos/[id]/page.tsx
    estatisticas/page.tsx
    galeria/page.tsx
    noticias/page.tsx
    noticias/[slug]/page.tsx
    patrocinadores/page.tsx
    contato/page.tsx
    loja/page.tsx
    loja/[slug]/page.tsx
    loja/carrinho/page.tsx
    loja/checkout/page.tsx
    loja/pedido/[id]/page.tsx
    admin/layout.tsx           # sidebar
    admin/page.tsx             # dashboard
    admin/jogadores/page.tsx
    admin/partidas/page.tsx
    admin/noticias/page.tsx
    admin/galeria/page.tsx
    admin/patrocinadores/page.tsx
    admin/produtos/page.tsx
    admin/pedidos/page.tsx
  components/
    site/{Header,Footer,HeroBanner,NextMatchCard,LastResultCard,PlayerCard,MatchCard,NewsCard,SponsorGrid,StatCard,Lightbox}.tsx
    shop/{ProductCard,CartDrawer}.tsx
    admin/{Sidebar,DataTable}.tsx
    ui/*                       # shadcn/ui
  data/
    club.ts                    # história, missão, valores, linha do tempo, identidade
    players.ts
    matches.ts
    news.ts
    gallery.ts
    sponsors.ts
    products.ts
    stats.ts
  types/index.ts
  lib/
    utils.ts
    cart-store.ts              # zustand
public/
  logo/bugre.svg               # escudo provisório
  players/*.jpg                # placeholders nomeados
  gallery/*.jpg
  sponsors/*.svg
  og.jpg
README-assets.md               # lista de assets a trocar pelos reais do @bugre_e.clube
```

### Conteúdo mínimo por página pública

Toda página herda `Header` + `Footer` e tem metadata específica (`title`, `description`, `openGraph`). Footer: links principais, Instagram `@bugre_e.clube`, contato, copyright e frase de efeito do clube.

**Home:** banner com escudo + claim, card "próximo jogo" (adversário, data, local, CTA), card "último resultado", faixa de 3-4 stat cards da temporada, mini-ranking dos 5 maiores goleadores, prévia da galeria (grid 2×3 com lightbox), 3 notícias recentes, grid de patrocinadores, banner CTA para a loja.

**O Clube:** história em bloco longo, cards de missão/visão/valores, linha do tempo vertical (`<ol>` estilizado), seção de identidade com escudo, lema, paleta de cores e mascote.

**Elenco:** header com contagem total; filtros por posição (Goleiro, Defensor, Meia, Atacante) em pills clicáveis; busca client-side por nome/apelido; grid responsivo de `PlayerCard` (foto, número grande, nome, apelido, posição, mini-stats jogos/gols/assist); link para perfil.

**Perfil do Jogador `[slug]`:** foto grande, bloco com nome, apelido, número gigante, posição, bio curta, tabela de estatísticas, histórico dos últimos 5 jogos, gráfico de linha por temporada (recharts).

**Jogos:** filtros (temporada, competição, resultado V/E/D) e lista vertical de `MatchCard` (escudos, data, local, placar, status). Clicável.

**Detalhe da Partida `[id]`:** placar gigante, meta (data/local/competição), timeline vertical de eventos (gols, assistências, cartões), escalação titular + reservas, galeria da partida (grid + lightbox), card "destaque do jogo".

**Estatísticas:** stat cards no topo (jogos, V/E/D, gols pró/contra, aproveitamento %), quatro rankings lado a lado (artilheiros, assistências, mais jogos, participações em gol), dois gráficos recharts (gols por mês, aproveitamento por competição).

**Galeria:** filtros por álbum (Jogos, Elenco, Bastidores, Treinos, Artes) e temporada; grid responsivo; lightbox ao clicar.

**Notícias:** notícia em destaque (card grande) + grid, filtro por categoria e busca.

**Detalhe da Notícia `[slug]`:** capa larga, título, data, categoria, conteúdo `prose`, "notícias relacionadas" no fim.

**Patrocinadores:** grid com logos, bloco "benefícios de patrocinar o Bugre", cards de planos (Bronze/Prata/Ouro), CTA para contato.

**Contato:** cards com Instagram `@bugre_e.clube`, WhatsApp, e-mail; formulário (nome, e-mail, assunto `[amistoso, patrocínio, contato geral, peneira, imprensa]`, mensagem). Submit → `toast` mock.

### Loja

- `/loja`: seções "Em destaque", "Lançamentos", "Mais vendidos"; grid por categoria (uniformes de jogo, treino, acessórios, promoções).
- `/loja/[slug]`: galeria do produto, descrição, preço, seletor de tamanho (P/M/G/GG), estoque, "Adicionar ao carrinho".
- `/loja/carrinho`: lista, quantidade, subtotal, finalizar.
- `/loja/checkout`: formulário + resumo. Submit mock.
- `/loja/pedido/[id]`: confirmação, número do pedido, resumo, CTA voltar à loja.
- `CartDrawer` acessível do header em todas as páginas da loja.

### Admin

Layout próprio com sidebar fixa (Dashboard, Jogadores, Partidas, Notícias, Galeria, Patrocinadores, Produtos, Pedidos). Sem autenticação real — deixar TODO no topo do `admin/layout.tsx`.

- **Dashboard:** cards resumo (total jogadores, próximas partidas, pedidos do mês, receita mockada) + gráfico simples.
- **CRUDs:** `DataTable` com colunas relevantes, botões Novo/Editar/Excluir abrindo `Dialog` com formulário. Mutações só no estado local (zustand/useState) — voltam ao mock no reload. Comentar: `// TODO: substituir por chamada à API quando o backend for integrado`.
- **Partidas:** form de edição permite adicionar gols, assistências e cartões (array editável).
- **Upload:** `<input type="file">` com preview via `URL.createObjectURL` — não persiste.

### Responsividade

Todos os layouts funcionam em mobile (`sm`), tablet (`md`) e desktop (`lg+`). Antes de finalizar, verificar: header vira hambúrguer, grids reduzem colunas, tabelas do admin ganham scroll horizontal.

## Dados mockados — volume mínimo

Para o site parecer vivo desde o primeiro `npm run dev`:

- **18 jogadores** (mix de posições, números únicos, apelidos, stats variadas) — nomes fictícios
- **12 partidas** (passadas com placar + futuras sem placar)
- **8 notícias** em 3 categorias (Bastidores, Jogos, Mercado)
- **24 fotos** na galeria distribuídas entre os álbuns
- **6 patrocinadores**
- **12 produtos** na loja (camisas, treino, shorts, meiões, bonés, moletons)
- **estatísticas** derivadas dos jogos e jogadores

Tipos fortes em `src/types/index.ts`. Os dados devem ser coerentes entre si: se um jogador tem 5 gols, esses gols aparecem nos eventos das partidas e no ranking de artilheiros. Se for preciso, gere partidas primeiro e derive stats.

## Passo a passo de execução

1. **Confirmar escopo.** Diga ao usuário que vai gerar o projeto inteiro agora com a stack acima e que os assets reais (logo + fotos do `@bugre_e.clube`) serão melhor-esforço via `WebFetch`, caindo em placeholders listados no `README-assets.md`. Se o usuário já foi claro ("faça"), siga direto.
2. **Tentar enriquecer identidade.** Fazer um `WebFetch` em `https://www.instagram.com/bugre_e.clube` pedindo bio, localização, cores, lema. Use o que vier; não bloqueie se falhar.
3. **Inicializar Next.js** se `package.json` não existir: `npx create-next-app@latest . --ts --tailwind --app --src-dir --import-alias "@/*" --eslint --no-turbopack` (não-interativo, todas as flags). Se houver arquivos no diretório, confirmar antes.
4. **Instalar dependências extras:** `npm install zustand recharts lucide-react clsx tailwind-merge class-variance-authority` e `npx shadcn@latest init` + `npx shadcn@latest add button card input select dialog tabs table badge` (não-interativo; senão crie os componentes manualmente seguindo o shadcn).
5. **Configurar Tailwind** com os tokens `brand.*` em `tailwind.config.ts` e fontes via `next/font` (sugestão: `Oswald` para títulos, `Inter` para corpo).
6. **Criar tipos e mocks** em `src/types` e `src/data` antes das páginas — evita retrabalho.
7. **Criar componentes compartilhados** (`Header`, `Footer`, cards) antes das páginas.
8. **Gerar as páginas públicas** na ordem listada. Uma de cada vez, completa. Nenhuma página pública pode ficar com `TODO` visível — todas com conteúdo.
9. **Gerar loja e admin.** No admin é aceitável `// TODO: integração de backend` nos pontos de persistência, mas as telas precisam existir e navegar.
10. **Criar `README-assets.md`** listando cada arquivo de `public/` a substituir pelas imagens reais do `@bugre_e.clube`, com nome, propósito e instrução de download.
11. **Verificação final:** `npm run build` (ou `npm run lint` + `tsc --noEmit` se o build demorar). Corrigir qualquer erro antes de declarar pronto.
12. **Relatório final ao usuário** em 5-8 linhas: o que foi gerado, como rodar (`npm run dev`), onde trocar os assets reais e quais TODOs ficaram para o backend.

## Regras importantes

- **Uma execução, projeto inteiro.** Não gere metade e pergunte "quer que eu continue?" — siga até o fim. Só pare se `npm run build` quebrar e precisar de decisão do usuário.
- **Dados coerentes.** Stats dos jogadores batem com eventos das partidas.
- **Sem emoji no código** salvo se o usuário pedir.
- **Sem comentários óbvios.** Só comente `// TODO: backend` nos pontos de integração real.
- **Placeholders devem existir fisicamente.** Se referencia `/players/joao.jpg`, crie o arquivo real em `public/players/` (pode ser `.svg` com iniciais ou `.jpg` 1×1). Senão o Next.js quebra no build.
- **Escudo provisório:** SVG com fundo preto, borda vermelha, inicial "B" dourada centralizada. Deixar claro no `README-assets.md` que é temporário.
- **Não inventar informação.** Nada de nomes de jogadores reais, datas reais ou placares reais como se fossem verdadeiros. Mocks devem ser obviamente fictícios.
- **Instagram é melhor-esforço.** Se `WebFetch` não retornar bio/cores, não trave — siga com fallback e anote no `README-assets.md`.

## Critério de pronto

- `npm run dev` sobe sem erro.
- `npm run build` passa sem erro.
- Todas as 12+ rotas públicas renderizam com conteúdo visível.
- Loja permite adicionar item ao carrinho, ir ao checkout e ver página de pedido.
- Admin renderiza todas as telas com dados mockados.
- `README-assets.md` existe e lista cada arquivo a trocar, incluindo o escudo provisório.
- Visual coerente com a paleta do clube (detectada ou fallback) em todas as telas.
- Rodapé e página de contato referenciam `@bugre_e.clube` como canal oficial.
