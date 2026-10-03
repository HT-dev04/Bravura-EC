# Imagem de produção do site do Bravura (deploy no Coolify do servidor hub da Avontz).
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=3072
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund
COPY . .
# Migrations rodam no start do container (o banco não existe na hora do build).
# A URL abaixo só satisfaz a checagem de import do Prisma; nenhuma conexão é feita no build.
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npx next build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /app ./
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && exec npx next start"]
