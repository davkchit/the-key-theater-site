# The bot's service (bot/server): Telegram, leads from the site, mail.
# Node 22.13+ for the built-in node:sqlite.

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
# only runtime dependencies (nodemailer); the site's build tools stay out
RUN npm ci --omit=dev --ignore-scripts --legacy-peer-deps
COPY bot/core ./bot/core
COPY bot/server ./bot/server
COPY bot/scripts/env.mjs ./bot/scripts/env.mjs
# the site's content: a knowledge snapshot for the first minutes after a
# start, before the first fetch of knowledge.json from the site container
COPY src/content ./src/content
ENV BOT_HOST=0.0.0.0 BOT_DATA_DIR=/data NODE_ENV=production
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=60s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:8787/health || exit 1
CMD ["node", "--no-warnings", "bot/server/index.mjs"]
