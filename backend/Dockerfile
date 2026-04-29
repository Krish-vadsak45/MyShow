FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app /app

EXPOSE 4000

CMD ["server.js"]
