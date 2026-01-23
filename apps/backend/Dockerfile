# Simple production image with pre-built dist
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for argon2 (native module)
RUN apk add --no-cache python3 make g++ gcc musl-dev

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --production || npm install --production

# Copy pre-built dist folder
COPY dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

# Start the application
CMD ["node", "dist/main.js"]
