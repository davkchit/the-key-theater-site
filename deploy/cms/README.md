# Админка сайта на своём сервере

Без GitHub и без чужих аккаунтов: театр входит в `/admin` по паролю, правка
сохраняется на сервер коммитом в git, сайт сам пересобирается за 10–20 секунд.

```
браузер → Caddy (пароль) → /admin/api → decap-server :8081 (MODE=git)
                                              ↓ коммит в /opt/kluch/src
                         kluch-rebuild.path замечает коммит
                                              ↓
                  rebuild.sh (vite build, лимит памяти) → kluch-site-publish
                                              ↓
                                     /opt/kluch/site (живой сайт)
```

| Файл | Где на сервере |
|---|---|
| `rebuild.sh` | `/opt/kluch/cms/rebuild.sh` |
| `kluch-site-publish` | `/usr/local/sbin/kluch-site-publish` |
| `kluch-cms.service`, `kluch-rebuild.service`, `kluch-rebuild.path` | `/etc/systemd/system/` |
| `Caddyfile.snippet` | блок сайта в `/etc/caddy/Caddyfile` |

Установка на новый сервер (Ubuntu, Node 22, Caddy уже стоят; сайт и бот — см.
`bot/DEPLOY.md`): `sudo sh deploy/cms/install.sh <адрес сайта>` из копии
репозитория в `/opt/kluch/src`. Скрипт спросит пароль для админки.

Полезное:
- кто что правил: `git -C /opt/kluch/src log --oneline`
- откатить последнюю правку: `sudo -u kluch-cms git -C /opt/kluch/src revert --no-edit HEAD`
  (сайт пересоберётся сам)
- журнал сборок: `journalctl -u kluch-rebuild -n 50`
- сменить пароль: `caddy hash-password`, вставить хэш в Caddyfile, `systemctl reload caddy`
- память: сборка ~270 МБ в пике, decap-server ~60 МБ; сервера на 1 ГБ хватает
