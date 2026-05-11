# Bravura Fut

Portal Next.js do Bravura com área pública, loja e painel administrativo.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL no Supabase
- Supabase Storage para uploads do painel admin

## Ambiente

Configure todas as variáveis em um único arquivo `.env`.

```bash
npm install
npm run db:setup
npm run dev
```

## Banco De Dados

O projeto usa Prisma sobre PostgreSQL. A migration inicial está em `prisma/migrations/20260511120000_init_supabase_postgres`.

Na primeira leitura do CMS, o banco é semeado automaticamente com os dados estáticos de `src/data/*` caso ainda não exista o registro de metadata `default`.

## Uploads

Uploads do admin são enviados para o bucket definido em `SUPABASE_STORAGE_BUCKET`. O bucket deve existir no Supabase Storage e estar público se as imagens precisarem ser acessadas diretamente pelo navegador.
