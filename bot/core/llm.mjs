// One way to call a model, whoever hosts it.
//
// Yandex, Groq and most others speak the same OpenAI-compatible shape, so the
// provider is three settings rather than three code paths: where to send it,
// how to sign it, and what the model is called. That matters beyond tidiness --
// the theatre should eventually pay for its own model on its own account, while
// development happens on whatever is free this month.
//
// Settings live in .env.bot:
//   LLM_BASE          https://api.groq.com/openai/v1
//   LLM_AUTH          Bearer            (Yandex uses Api-Key)
//   LLM_KEY           the token
//   LLM_MODEL         model that writes the answers
//   LLM_PARSER_MODEL  model that labels the turn; may be a cheaper one
//   LLM_EXTRA_HEADER  optional "Name: value" (Yandex needs x-folder-id)

export const PROVIDERS = {
  groq: {
    base: 'https://api.groq.com/openai/v1',
    auth: 'Bearer',
    // what is actually on the account varies -- check /v1/models before trusting a default
    model: 'openai/gpt-oss-120b',
    parserModel: 'openai/gpt-oss-20b',
    // rubles per 1000 tokens; free tier costs nothing but has daily caps
    price: 0,
    priceParser: 0,
  },
  yandex: {
    base: 'https://llm.api.cloud.yandex.net/v1',
    auth: 'Api-Key',
    model: 'yandexgpt/latest',
    parserModel: 'yandexgpt/latest',
    price: 1.2,
    priceParser: 1.2,
    // the model name has to carry the folder for Yandex
    qualify: (m, env) => (m.startsWith('gpt://') ? m : `gpt://${env.YANDEX_FOLDER_ID}/${m}`),
    header: (env) => ['x-folder-id', env.YANDEX_FOLDER_ID],
  },
}

// The provider is usually obvious from the address, so nobody has to remember
// a fourth setting -- and getting it wrong silently mangles the model name.
function guessProvider(env) {
  const base = String(env.LLM_BASE || '')
  for (const key of Object.keys(PROVIDERS)) if (base.includes(key)) return key
  return 'yandex'
}

export function llmConfig(env, opts = {}) {
  const name = (opts.provider || env.LLM_PROVIDER || guessProvider(env)).toLowerCase()
  const p = PROVIDERS[name] || PROVIDERS.yandex
  // Scripts (eval, parse, simulate) run on their own key when there is one, so
  // a test run cannot spend the daily limit of the bot someone is trying out.
  const key = env.EVAL_LLM_KEY || env.LLM_KEY || (name === 'groq' ? env.GROQ_API_KEY : env.YANDEX_API_KEY)
  const model = opts.parser ? (env.LLM_PARSER_MODEL || p.parserModel) : (env.LLM_MODEL || p.model)
  return {
    name,
    base: env.LLM_BASE || p.base,
    auth: env.LLM_AUTH || p.auth,
    key,
    model: p.qualify ? p.qualify(model, env) : model,
    header: p.header ? p.header(env) : null,
    price: opts.parser ? p.priceParser : p.price,
  }
}

// Plain text answer. `messages` use { role, content }.
export async function callModel(env, messages, opts = {}) {
  const cfg = llmConfig(env, opts)
  const body = {
    model: cfg.model,
    messages,
    max_tokens: opts.maxTokens || 500,
    temperature: opts.temperature == null ? 0.2 : opts.temperature,
    stream: false,
  }
  if (opts.schema) body.response_format = { type: 'json_schema', json_schema: opts.schema }
  else if (opts.json) body.response_format = { type: 'json_object' }

  if (!cfg.key) throw new Error(`нет ключа для провайдера «${cfg.name}» — впишите LLM_KEY в .env.bot`)
  const headers = { Authorization: `${cfg.auth} ${cfg.key}`, 'Content-Type': 'application/json' }
  if (cfg.header) headers[cfg.header[0]] = cfg.header[1]

  // Free tiers cap tokens per minute and say how long to wait. Waiting and
  // retrying beats failing the turn: a person would rather get the answer
  // twenty seconds later than an error.
  let r, j
  for (let attempt = 0; attempt < 5; attempt++) {
    r = await fetch(cfg.base + '/chat/completions', { method: 'POST', headers, body: JSON.stringify(body) })
    j = await r.json().catch(() => ({}))
    if (r.status !== 429) break
    const m = String(j.error?.message || '').match(/try again in ([\d.]+)s/i)
    const waitMs = Math.min(60000, Math.ceil((m ? Number(m[1]) : 10) * 1000) + 500)
    await new Promise((res) => setTimeout(res, waitMs))
  }
  if (!r.ok) throw new Error(`${cfg.name} ${r.status}: ${j.error?.message ?? JSON.stringify(j).slice(0, 200)}`)
  return {
    text: j.choices?.[0]?.message?.content ?? '',
    tokens: Number(j.usage?.total_tokens || 0),
    price: cfg.price,
    model: cfg.model,
  }
}
