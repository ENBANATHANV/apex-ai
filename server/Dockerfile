# FitTrack Production Dockerfile (Backend + Static Client)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package & install
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy server prisma schema & generate
COPY server/prisma ./server/prisma
RUN cd server && npx prisma generate

# Copy server code and build
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN cd server && npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY server/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/server/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
