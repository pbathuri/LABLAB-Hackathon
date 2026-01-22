# Multi-stage build for Captain Whiskers
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY contracts/package.json ./contracts/

RUN npm install -g pnpm
RUN pnpm install

# Copy all source
COPY . .

# Build
RUN pnpm build

# Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app .
EXPOSE 3000 3001 8000
CMD ["pnpm", "start"]
