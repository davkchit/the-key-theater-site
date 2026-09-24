#!/usr/bin/env sh
# Update the site and the bot on the server to the latest commit:
#
#   ./deploy.sh
#
# Leads and chats (bot/data) are outside the containers and survive this.
set -eu
cd "$(dirname "$0")"

if [ ! -f .env.bot ]; then
  echo "нет .env.bot: скопируйте bot/env.example в .env.bot и впишите настройки" >&2
  exit 1
fi

git pull --ff-only
docker compose up -d --build
# old image layers pile up on a small disk otherwise
docker image prune -f >/dev/null

sleep 5
if docker compose exec -T bot wget -qO- http://127.0.0.1:8787/health >/dev/null 2>&1; then
  echo "готово: бот отвечает"
else
  echo "бот не отвечает, смотрите: docker compose logs --tail=50 bot" >&2
  exit 1
fi
