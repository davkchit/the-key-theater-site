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

# phone photos from the admin are shrunk in place, and the smaller files are
# saved as a commit, so the repository and the site both stay light. A failed
# commit (the admin saving at that very moment) is not fatal: the next
# rebuild tries again, and the site is built from the shrunk files anyway.
shrunk=$(node deploy/cms/shrink-uploads.mjs)
if [ -n "$shrunk" ]; then
  echo "$shrunk"
  git add public/uploads && git commit -q -m "Фото уменьшены для сайта" || echo "не закоммитил уменьшенные фото, попробую в следующий раз"
fi

# shows over three months old leave the afisha list (the same way, a commit)
pruned=$(node deploy/cms/prune-afisha.mjs)
if [ -n "$pruned" ]; then
  echo "убраны старые показы: $pruned"
  git add src/content/afisha.json && git commit -q -m "Старые показы убраны из афиши" || echo "не закоммитил афишу, попробую в следующий раз"
fi

while :; do
  head=$(git rev-parse HEAD)
  rm -rf dist
  # the bot reads knowledge.json from the site, so it is rebuilt together
  node bot/scripts/publish-knowledge.mjs
  VITE_BASE=/ node node_modules/vite/bin/vite.js build --logLevel warn
  # a page of its own for each address, sitemap.xml and robots.txt; if that
  # fails the site still works as before, just without the ready-made pages
  VITE_BASE=/ node scripts/prerender.mjs || echo "пререндер не удался, сайт собран без готовых страниц"
  # something saved while we were building? build that too
  [ "$(git rev-parse HEAD)" = "$head" ] && break
  echo "новые правки во время сборки, собираю ещё раз"
done
test -f dist/index.html
echo "собрано: $(git log -1 --format='%h %s')"
