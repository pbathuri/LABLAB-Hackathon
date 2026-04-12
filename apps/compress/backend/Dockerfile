# ======================
# Stage 1: Build Stage
# ======================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (argon2)
RUN apk add --no-cache python3 make g++ gcc musl-dev

# Copy package files first (for better caching)
COPY package.json ./

# Install ALL dependencies (including devDependencies for building)
# Use npm install since package-lock.json may not exist in monorepo subfolders
RUN npm install --legacy-peer-deps

# Copy source code
COPY tsconfig.json nest-cli.json ./
COPY src ./src

# Build the TypeScript code
RUN npm run build

# ======================
# Stage 2: Production Stage
# ======================
FROM node:20-alpine AS production

WORKDIR /app

# Install build dependencies for native modules (argon2 needs to be rebuilt)
RUN apk add --no-cache python3 make g++ gcc musl-dev

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

# Start the application
CMD ["node", "dist/main.js"]
