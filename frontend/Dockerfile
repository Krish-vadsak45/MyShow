# Only multi-stage build can make sure Nginx has the right files and config

# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Arguments for build time env
ARG VITE_BASE_URL=/api
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_TMDB_IMAGE_BASE_URL
ARG VITE_CURRENCY

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_TMDB_IMAGE_BASE_URL=$VITE_TMDB_IMAGE_BASE_URL
ENV VITE_CURRENCY=$VITE_CURRENCY

RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
