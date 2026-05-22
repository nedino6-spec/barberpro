FROM node:20-slim

# Sem Chrome! Baileys é puro Node.js
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY whatsapp-service/package*.json ./whatsapp-service/
RUN npm install --prefix whatsapp-service

COPY whatsapp-service/ ./whatsapp-service/

ENV PORT=10000
EXPOSE 10000

CMD ["node", "whatsapp-service/index.js"]
