#!/bin/sh
# Rebuilds the site after the admin saved something (every save is a commit).
# Runs as kluch-cms with a memory cap (kluch-rebuild.service); the root step
# that puts the result live is kluch-site-publish (ExecStartPost).
#
# A broken build leaves the site as it was: dist is published only on success.
set -eu
cd /opt/kluch/src

# saves come in bursts (a text and its photo): let them settle
sleep 3

while :; do
  head=$(git rev-parse HEAD)
  rm -rf dist
  # the bot reads knowledge.json from the site, so it is rebuilt together
  node bot/scripts/publish-knowledge.mjs
  VITE_BASE=/ node node_modules/vite/bin/vite.js build --logLevel warn
  # something saved while we were building? build that too
  [ "$(git rev-parse HEAD)" = "$head" ] && break
  echo "новые правки во время сборки, собираю ещё раз"
done
test -f dist/index.html
echo "собрано: $(git log -1 --format='%h %s')"
