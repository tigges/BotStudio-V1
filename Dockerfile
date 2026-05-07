FROM node:22-slim
WORKDIR /app

# Install build tools needed by googleapis / native deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY api/package*.json ./
RUN npm install --production --no-audit --no-fund

COPY api/ ./
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "server.js"]
