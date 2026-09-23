// Starts a local n8n with the bot's secrets taken from .env.bot (never printed).
//
//   node bot/scripts/n8n-local.mjs --mock   -- Telegram calls go to the local mock (e2e tests)
//   node bot/scripts/n8n-local.mjs          -- real Telegram
//
// N8N_BIN and N8N_HOME can point at any n8n install; defaults suit the dev box.

import { spawn } from 'node:child_process'
import { loadEnv } from './env.mjs'

const mock = process.argv.includes('--mock')
const env = loadEnv()

const child = spawn(process.execPath, [process.env.N8N_BIN, 'start'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    N8N_USER_FOLDER: process.env.N8N_HOME,
    N8N_PORT: '5678',
    N8N_DIAGNOSTICS_ENABLED: 'false',
    N8N_PERSONALIZATION_ENABLED: 'false',
    N8N_SECURE_COOKIE: 'false',
    N8N_BLOCK_ENV_ACCESS_IN_NODE: 'false',
    GENERIC_TIMEZONE: 'Europe/Moscow',
    // where the bot pulls the knowledge the site published
    SITE_URL: process.env.SITE_URL || 'http://127.0.0.1:4173',
    YANDEX_API_KEY: env.YANDEX_API_KEY,
    YANDEX_FOLDER_ID: env.YANDEX_FOLDER_ID,
    // provider is three settings, not three code paths -- see bot/core/llm.mjs
    LLM_BASE: env.LLM_BASE || '',
    LLM_AUTH: env.LLM_AUTH || '',
    LLM_KEY: env.LLM_KEY || env.YANDEX_API_KEY || '',
    // spare keys: the bot moves on to the next one when a key's daily limit is spent
    ...Object.fromEntries([2, 3, 4, 5, 6, 7, 8, 9].map((n) => ['LLM_KEY_' + n, env['LLM_KEY_' + n] || ''])),
    LLM_MODEL: env.LLM_MODEL || '',
    LLM_PARSER_MODEL: env.LLM_PARSER_MODEL || '',
    TELEGRAM_BOT_TOKEN: mock ? 'MOCKTOKEN' : env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_API_BASE: mock ? 'http://127.0.0.1:8081' : '',
    TELEGRAM_WEBHOOK_SECRET: mock ? 'local-secret' : env.TELEGRAM_WEBHOOK_SECRET || '',
    ADMIN_CHAT_ID: mock ? '-100777' : env.ADMIN_CHAT_ID || '',
  },
})
child.on('exit', (code) => process.exit(code ?? 0))
