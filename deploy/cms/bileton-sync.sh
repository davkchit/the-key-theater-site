#!/bin/sh
# Hourly (kluch-bileton.timer): the afisha follows the shows' Bileton widgets.
# Runs as kluch-cms; a change is committed like an admin edit, which starts
# the usual rebuild (kluch-rebuild.path), and shows in the admin's history.
# A failed commit (an admin save at that very moment) is not fatal: the next
# hour tries again.
set -eu
cd /opt/kluch/src

changed=$(node deploy/cms/sync-bileton.mjs /opt/kluch/cms/bileton-status.json)
if [ -n "$changed" ]; then
  echo "$changed"
  git add src/content/afisha.json &&
    git commit -q -m "Афиша обновлена с Билетона" -m "$changed" ||
    echo "не закоммитил афишу, попробую через час"
fi
