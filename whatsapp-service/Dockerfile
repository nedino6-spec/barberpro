FROM node:20-slim

# Instalar dependências necessárias para o Puppeteer (Chrome) rodar no Linux
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Definir caminho do Chrome para o Puppeteer não baixar o Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# O Render usa a raiz do projeto como contexto do Docker
COPY whatsapp-service/package.json ./
RUN npm install

# Copia apenas os arquivos do robô
COPY whatsapp-service/ ./

EXPOSE 3001

# O comando para iniciar
CMD ["node", "index.js"]
