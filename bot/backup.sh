#!/usr/bin/env sh
# Daily copy of the bot's database (leads, chats). For cron on the server:
#
#   15 3 * * *  /opt/kluch/bot/backup.sh
#
# Keeps the last 14 days in bot/data/backups. The copy is made with SQLite's
# own backup (VACUUM INTO), which is safe while the bot is writing.
set -eu
cd "$(dirname "$0")/.."
mkdir -p bot/data/backups
day=$(date +%F)
docker compose exec -T bot node -e "
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync('/data/kluch.sqlite')
  db.exec(\"VACUUM INTO '/data/backups/kluch-$day.sqlite'\")
  db.close()
"
find bot/data/backups -name 'kluch-*.sqlite' -mtime +14 -delete
echo "бэкап: bot/data/backups/kluch-$day.sqlite"
