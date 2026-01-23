# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for argon2
RUN apk add --no-cache python3 make g++ gcc musl-dev

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm install --production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify dist was created
RUN ls -la dist/ && ls -la dist/main.js

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies for argon2
RUN apk add --no-cache python3 make g++ gcc musl-dev

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
