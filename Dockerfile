# The site: built once, served by Caddy, which also forwards /api to the bot.
# Used by docker-compose.yml together with bot/Dockerfile.

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# --legacy-peer-deps for the same reason as the GitHub Actions workflow:
# eslint-plugin-jsx-a11y's peer range caps at eslint 9 while the project is on 10.
RUN npm ci --legacy-peer-deps
COPY . .
# served from the domain root, unlike GitHub Pages -- see vite.config.ts
ENV VITE_BASE=/
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
