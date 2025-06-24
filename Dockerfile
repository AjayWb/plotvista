# Simple single-stage build
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Copy frontend files
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

# Copy backend source
WORKDIR /app
COPY backend/ ./backend/

# Expose port
EXPOSE 3001

# Set working directory for start
WORKDIR /app/backend

# Start the application
CMD ["node", "server-railway.js"]