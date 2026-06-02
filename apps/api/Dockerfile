FROM node:20-slim

WORKDIR /app

# Install dependencies for Puppeteer/Chromium and OpenSSL
RUN apt-get update -y && apt-get install -y \
    openssl \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy package files and install ALL deps
COPY package*.json ./
RUN npm install --include=dev

# Copy source
COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate && node ./node_modules/@nestjs/cli/bin/nest.js build

# Expose API port
EXPOSE 4000

# Run node directly to bypass Prisma migrate deploy hang
CMD ["sh", "-c", "node dist/src/main"]
