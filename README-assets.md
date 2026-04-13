# Assets placeholder do Bravura FC

Este projeto foi gerado com **placeholders** no lugar das imagens reais. Você precisa substituir os arquivos listados abaixo por fotos e artes oficiais do Bravura FC — muitas delas podem ser baixadas do Instagram oficial do clube:

**Fonte recomendada:** https://www.instagram.com/bravura_esporte_clube

> Baixe manualmente as imagens do Instagram (não é possível fazer isso automaticamente em tempo de build). Mantenha os nomes de arquivo abaixo para que o site continue funcionando sem alterações no código.

## Escudo do clube

- `public/logo/bravura.svg` — escudo provisório (círculo preto, borda vermelha, letra "B" dourada). Substitua pelo escudo oficial em SVG (ou adapte o código para usar PNG se preferir).

## Foto dos jogadores (`public/players/*.jpg`)

Dimensão recomendada: 900×1200 (retrato 3:4), fundo escuro, jogador enquadrado do peito para cima.

- `mateus-fera.jpg` — Mateus "Fera" (goleiro #1)
- `lucas-muralha.jpg` — Lucas "Muralha" (zagueiro #2)
- `rodrigo-tank.jpg` — Rodrigo "Tank" (zagueiro/capitão #3)
- `diego-raposa.jpg` — Diego "Raposa" (lateral-direito #4)
- `henrique-flecha.jpg` — Henrique "Flecha" (lateral-esquerdo #6)
- `caio-general.jpg` — Caio "General" (volante #5)
- `bruno-mago.jpg` — Bruno "Mago" (meia #8)
- `pedro-motor.jpg` — Pedro "Motor" (meia #10)
- `thiago-pirata.jpg` — Thiago "Pirata" (atacante #11)
- `felipe-artilheiro.jpg` — Felipe "Artilheiro" (centroavante #9)
- `gabriel-raio.jpg` — Gabriel "Raio" (atacante #7)
- `enzo-torre.jpg` — Enzo "Torre" (zagueiro #13)
- `igor-sombra.jpg` — Igor "Sombra" (meia #14)
- `leo-polvo.jpg` — Léo "Polvo" (goleiro reserva #12)
- `marcos-trator.jpg` — Marcos "Trator" (volante #15)
- `alex-bomba.jpg` — Alex "Bomba" (atacante #19)
- `vitor-parede.jpg` — Vítor "Parede" (zagueiro #16)
- `samuel-tempestade.jpg` — Samuel "Tempestade" (meia #20)

## Galeria (`public/gallery/*.jpg`)

Dimensão recomendada: 1600×900 (paisagem 16:9) ou 1200×1200 (quadrado).

### Jogos
- `jogo-01-a.jpg`, `jogo-01-b.jpg`, `jogo-01-c.jpg` — vitória 3×1 sobre Serra Azul FC
- `jogo-02-a.jpg`, `jogo-02-b.jpg` — vitória 2×1 sobre Unidos do Sul
- `jogo-03-a.jpg`, `jogo-03-b.jpg` — empate 2×2 com Vila Nova
- `jogo-04-a.jpg`, `jogo-04-b.jpg` — goleada 4×0 sobre Real Bairro Alto
- `jogo-05-a.jpg`, `jogo-05-b.jpg` — vitória 2×0 sobre Tigres do Morro
- `jogo-06-a.jpg`, `jogo-06-b.jpg` — derrota 2×1 para Atlético Industrial
- `jogo-07-a.jpg`, `jogo-07-b.jpg` — 3×0 sobre Unidos da Vila
- `jogo-08-a.jpg`, `jogo-08-b.jpg` — 1×1 com Serra Azul FC
- `jogo-09-a.jpg`, `jogo-09-b.jpg` — 4×2 sobre Vila Nova
- `jogo-10-a.jpg`, `jogo-10-b.jpg` — 2×1 sobre Real Bairro Alto

### Elenco
- `elenco-01.jpg`, `elenco-02.jpg`, `elenco-03.jpg`, `elenco-04.jpg` — fotos oficiais do elenco

### Bastidores
- `bastidores-01.jpg` a `bastidores-04.jpg` — vestiário, aquecimento, conversas

### Treinos
- `treinos-01.jpg` a `treinos-03.jpg` — treinos físicos e táticos

### Artes
- `artes-01.jpg` a `artes-04.jpg` — artes oficiais, cartazes de jogos, posts do Instagram

## Patrocinadores (`public/sponsors/*.svg`)

Os logos abaixo são **SVGs provisórios** (texto estilizado). Substitua pelos logos vetoriais reais dos patrocinadores.

- `padaria-central.svg`
- `auto-pecas-uniao.svg`
- `posto-bandeirantes.svg`
- `construtora-bravo.svg`
- `mercado-bairro-alto.svg`
- `barbearia-do-ze.svg`

## Escudos dos adversários (`public/sponsors/adv-*.svg`)

Também provisórios (texto estilizado). Substitua pelos escudos reais.

- `adv-serra-azul.svg`, `adv-unidos-sul.svg`, `adv-vila-nova.svg`, `adv-bairro-alto.svg`, `adv-tigres.svg`, `adv-industrial.svg`, `adv-unidos-vila.svg`, `adv-generico.svg`

## Produtos da loja (`public/products/*.jpg`)

Dimensão recomendada: 1200×1200 (quadrado), fundo neutro.

- `camisa-i-1.jpg`, `camisa-i-2.jpg` — Camisa Oficial I 2025
- `camisa-ii-1.jpg`, `camisa-ii-2.jpg` — Camisa Oficial II 2025
- `camisa-iii-1.jpg` — Camisa Oficial III 2025
- `treino-1.jpg` — Camisa de treino
- `jaqueta-1.jpg` — Jaqueta oficial
- `short-1.jpg` — Short oficial
- `meiao-1.jpg` — Meião oficial
- `bone-1.jpg` — Boné oficial
- `caneca-1.jpg` — Caneca escudo
- `chaveiro-1.jpg` — Chaveiro metálico
- `moletom-1.jpg` — Moletom oficial
- `retro-1.jpg` — Camisa retrô 2010

## OG image

- `public/og.jpg` — imagem compartilhada em redes sociais (1200×630 recomendado).

---

## Como substituir

1. Baixe as imagens reais do Instagram `@bravura_esporte_clube` (ou de onde preferir).
2. Renomeie para os nomes exatos da lista acima.
3. Substitua os arquivos placeholders em `public/`.
4. Se precisar trocar formato (JPG ↔ PNG ↔ WebP), atualize também as referências em `src/data/*.ts` e `src/types/*`.
5. Rode `npm run dev` para ver o resultado.

> Dica: se não quiser fazer isso manualmente, use o admin do próprio site (`/admin`) para subir imagens via formulário. Os uploads funcionam apenas em memória (sem persistência) até que você plugue um backend real.
