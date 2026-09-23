# Temporary Railway preview host -- lets the theatre look at the real site from
# a phone while Beget isn't wired up yet. The permanent home is still Beget
# (see PROJECT_CONTEXT.md); delete this file and Caddyfile when the preview is
# no longer needed. Nothing else in the project depends on them.

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# --legacy-peer-deps for the same reason as the GitHub Actions workflow:
# eslint-plugin-jsx-a11y's peer range caps at eslint 9 while the project is on 10.
RUN npm ci --legacy-peer-deps
COPY . .
# Railway serves from the domain root, unlike GitHub Pages -- see vite.config.ts
ENV VITE_BASE=/
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
