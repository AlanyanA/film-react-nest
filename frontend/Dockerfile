FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts index.html ./
COPY src ./src
COPY public ./public

RUN npm run build

FROM alpine:latest AS runtime

WORKDIR /app

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "rm -rf /output/* && cp -r /app/dist/. /output/ && tail -f /dev/null"]
