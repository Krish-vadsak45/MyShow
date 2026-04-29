FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM alpine:3.23 AS runtime

RUN apk add --no-cache nodejs

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app /app

EXPOSE 4000

CMD ["node", "server.js"]
