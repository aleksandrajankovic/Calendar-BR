# 1) Instalacija dependencija
FROM node:20 AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# 2) Build stage
FROM node:20 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 3) Finalni "runner" image
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
