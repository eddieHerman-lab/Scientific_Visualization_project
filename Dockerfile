# =======================================================
# Estágio 1: Build do Frontend Vite e Backend TypeScript
# =======================================================
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# =======================================================
# Estágio 2: Runner com Node.js + Python 3 (SymPy & Pint)
# =======================================================
FROM node:20-slim AS runner
WORKDIR /app

# Instalação do Python 3 e Pip para o motor de verificação analítica
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalação das bibliotecas determinísticas de computação algébrica e dimensional
RUN pip3 install --no-cache-dir sympy pint --break-system-packages

ENV NODE_ENV=production
ENV PORT=3000

# Copia as dependências já instaladas no estágio de build (evita reinstalar
# via Bun ou npm no runner)
COPY --from=builder /app/node_modules ./node_modules

# Copia a aplicação compilada e os scripts de auditoria simbólica
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# Execução do servidor empacotado em CJS
CMD ["node", "dist/server.cjs"]