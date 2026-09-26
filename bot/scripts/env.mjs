// Reads .env.bot from the repo root without ever printing it.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export function loadEnv() {
  const file = path.join(repoRoot, '.env.bot')
  const env = {}
  if (!fs.existsSync(file)) return env
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  // one-off runs on another model without editing the file:
  //   LLM_BASE=https://foundation-models.api.cloud.ru/v1 node bot/scripts/eval.mjs ...
  for (const k of ['LLM_BASE', 'LLM_MODEL', 'LLM_PARSER_MODEL', 'LLM_PROVIDER', 'LLM_AUTH']) if (process.env[k]) env[k] = process.env[k]
  return env
}

export function redactor(env) {
  const secrets = Object.entries(env)
    .filter(([k, v]) => v && /TOKEN|KEY|SECRET|PASSWORD/.test(k))
    .map(([, v]) => v)
  return (s) => secrets.reduce((acc, v) => acc.split(v).join('***'), String(s))
}
