FROM node:20-slim

# Instala Chrome e dependências para Puppeteer/WhatsApp
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
       fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-freefont-ttf \
       libxss1 libatk-bridge2.0-0 libgtk-3-0 libgbm1 libnss3 libxrandr2 libasound2 \
       --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PORT=10000

WORKDIR /app

# Copia apenas o necessário para rodar o bot
COPY package*.json ./
RUN npm install --omit=dev
COPY whatsapp-service/ ./whatsapp-service/

EXPOSE 10000

CMD ["node", "whatsapp-service/index.js"]
