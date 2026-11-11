# FitTrack Production Dockerfile (Backend API Server)
# Build context: ./server (Render Root Directory = server)
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Generate Prisma Client using PostgreSQL production schema
COPY prisma ./prisma
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma && npx prisma generate

# Compile TypeScript source
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/seed/seed.js && node dist/server.js"]
