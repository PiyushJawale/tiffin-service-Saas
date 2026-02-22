# Multi-stage build for Tiffin Service Application

# Stage 1: Build the React client
FROM node:18-alpine AS client-build

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm install

# Copy client source code
COPY client/ ./

# Build the React app with production API URL (relative path for same-origin)
ENV REACT_APP_API_URL=/api
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies (production only)
WORKDIR /app/server
RUN npm install --only=production

# Copy server source code
COPY server/ ./

# Copy built client from the build stage
WORKDIR /app
COPY --from=client-build /app/client/build ./client/build

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Working directory for server
WORKDIR /app/server

# Start the application
CMD ["node", "server.js"]
