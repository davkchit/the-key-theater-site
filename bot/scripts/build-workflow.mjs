// Generates the n8n workflows from bot/core. The Code nodes get lib.js inlined
// verbatim, so n8n runs exactly the logic the simulator tested.
//
//   node bot/scripts/build-workflow.mjs
//
// Output: bot/workflows/*.json -- import with `n8n import:workflow`.
// Re-run after any change to bot/core (logic, faq.md) or to the site content.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { buildKnowledge } from '../core/knowledge.mjs'
import { repoRoot } from './env.mjs'

const OUT = path.join(repoRoot, 'bot/workflows')
const LIB = fs.readFileSync(path.join(repoRoot, 'bot/core/lib.js'), 'utf8')
const KNOWLEDGE = buildKnowledge(repoRoot)

const IDS = { main: 'kluchBotMain0001', errors: 'kluchErrors00001', setup: 'kluchSetup000001', sync: 'kluchSync0000001' }
const TABLES = {
  chats: ['chat_id', 'state', 'updated_at'],
  leads: ['lead_id', 'created_at', 'updated_at', 'status', 'status_by', 'chat_id', 'source', 'name', 'phone', 'children', 'questions', 'nudges'],
  unanswered: ['asked_at', 'chat_id', 'question'],
  // one row, always id=1: the knowledge the site published, refreshed on a timer
  knowledge: ['slot', 'built_at', 'fetched_at', 'json'],
}
const tableName = (k) => `kluch_${k}`

// deterministic ids keep re-imports from piling up duplicate nodes
const uuid = (seed) => {
  const h = crypto.createHash('sha1').update(seed).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`
}

const withLib = (body) =>
  [
    '// ═════ Библиотека бота — сгенерирована из bot/core/lib.js. Здесь не править: ═════',
    '// ═════ изменения вносятся в bot/core и пересобираются build-workflow.mjs      ═════',
    LIB,
    '',
    '// ═════ Код этого узла ═════',
    body,
  ].join('\n')

const node = (name, type, typeVersion, position, parameters, extra = {}) => ({
  id: uuid(`${type}:${name}`),
  name,
  type,
  typeVersion,
  position,
  parameters,
  ...extra,
})

const code = (name, position, body, { lib = false } = {}) =>
  node(name, 'n8n-nodes-base.code', 2, position, { jsCode: lib ? withLib(body) : body })

const table = (key) => ({ __rl: true, mode: 'name', value: tableName(key) })
const cond = (column, expr) => ({ conditions: [{ keyName: column, condition: 'eq', keyValue: expr }] })

const telegramCall = (name, position, extra = {}) =>
  node(
    name,
    'n8n-nodes-base.httpRequest',
    4.2,
    position,
    {
      method: 'POST',
      url: "={{ ($env.TELEGRAM_API_BASE || 'https://api.telegram.org') + '/bot' + $env.TELEGRAM_BOT_TOKEN + '/' + $json.method }}",
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.payload) }}',
      options: { batching: { batch: { batchSize: 1, batchInterval: 0 } }, timeout: 15000 },
    },
    { onError: 'continueRegularOutput', ...extra },
  )

const link = (connections, from, to, output = 0) => {
  connections[from] ??= { main: [] }
  while (connections[from].main.length <= output) connections[from].main.push([])
  connections[from].main[output].push({ node: to, type: 'main', index: 0 })
}

// ─────────────────────────────────────────────────────────────── main workflow

function mainWorkflow() {
  const n = {
    webhook: node(
      'Telegram',
      'n8n-nodes-base.webhook',
      2.1,
      [0, 300],
      { httpMethod: 'POST', path: 'kluch-bot', responseMode: 'onReceived', options: {} },
      { webhookId: uuid('kluch-bot-webhook') },
    ),
    parse: code(
      'Разобрать апдейт',
      [220, 300],
      [
        'const item = $input.first().json',
        '// Telegram sends this header with every update once the webhook is set with a secret',
        "const got = (item.headers || {})['x-telegram-bot-api-secret-token']",
        'if ($env.TELEGRAM_WEBHOOK_SECRET && got !== $env.TELEGRAM_WEBHOOK_SECRET) return []',
        'const ev = normalizeUpdate(item.body)',
        "if (ev.kind === 'ignore') return []",
        'return [{ json: { ev, chatKey: String(ev.chatId) } }]',
      ].join('\n'),
      { lib: true },
    ),
    loadState: node(
      'Состояние диалога',
      'n8n-nodes-base.dataTable',
      1.1,
      [440, 300],
      { resource: 'row', operation: 'get', dataTableId: table('chats'), matchType: 'allConditions', filters: cond('chat_id', '={{ $json.chatKey }}'), limit: 1 },
      { alwaysOutputData: true },
    ),
    loadKnowledge: node(
      'Знание с сайта',
      'n8n-nodes-base.dataTable',
      1.1,
      [550, 300],
      { resource: 'row', operation: 'get', dataTableId: table('knowledge'), matchType: 'allConditions', filters: cond('slot', 'current'), limit: 1 },
      { alwaysOutputData: true },
    ),
    decide: code(
      'Решить',
      [660, 300],
      [
        `const BAKED = ${JSON.stringify(KNOWLEDGE)}`,
        "const { ev } = $('Разобрать апдейт').first().json",
        '// the synced copy is what the site currently shows; BAKED is only the',
        '// starting point for a fresh install, before the first sync has run',
        'let KNOWLEDGE = BAKED',
        "try { const kr = $('Знание с сайта').first().json; if (kr && kr.json) { const k = JSON.parse(kr.json); if (k && Array.isArray(k.afisha)) KNOWLEDGE = k } } catch (e) {}",
        "const row = $('Состояние диалога').first().json",
        'let saved = null',
        'try { if (row && row.state) saved = JSON.parse(row.state) } catch (e) { saved = null }',
        "const store = $getWorkflowStaticData('global')",
        'const res = decide(ev, saved, store.usage || null, KNOWLEDGE, { nowMs: Date.now(), adminChatId: $env.ADMIN_CHAT_ID, useParser: $env.BOT_PARSER !== "0" })',
        'if (res.global) store.usage = res.global',
        'return [{ json: { ev, res, saved } }]',
      ].join('\n'),
      { lib: true },
    ),
    needParse: node('Нужен разбор?', 'n8n-nodes-base.switch', 3.2, [880, 160], {
      mode: 'expression',
      numberOutputs: 2,
      output: '={{ $json.res.parse ? 1 : 0 }}',
    }),
    // The parser speaks the OpenAI-compatible endpoint: it is the only one where
    // response_format / json_schema is honoured. A failure here is not fatal --
    // the second decide() call simply gets parsed = null and falls back to the
    // keyword rules, which is exactly today's behaviour.
    // A Code node, not an HTTP Request: the call has to see WHICH limit it hit
    // ("per day" -> next key, "per minute" -> wait), and the HTTP node only
    // reports "429". A failure is still not fatal: the item carries no choices,
    // decide() gets parsed = null and falls back to the keyword rules.
    parseIntent: node(
      'Разобрать намерение',
      'n8n-nodes-base.code',
      2,
      [1100, 120],
      {
        jsCode: withLib(
          [
            'const p = $input.first().json.res.parse',
            "const store = $getWorkflowStaticData('global')",
            "const body = { model: $env.LLM_PARSER_MODEL || $env.LLM_MODEL, messages: p.messages, max_tokens: 200, temperature: 0, response_format: { type: 'json_schema', json_schema: p.schema } }",
            '// the parser is a helper: better a quick keyword fallback than a long wait',
            'const r = await callLlm(this.helpers, $env, store, body, 15000)',
            'return [{ json: r }]',
          ].join('\n'),
        ),
      },
      { onError: 'continueRegularOutput' },
    ),
    decideParsed: code(
      'Решить с разбором',
      [1320, 120],
      [
        `const BAKED = ${JSON.stringify(KNOWLEDGE)}`,
        'let KNOWLEDGE = BAKED',
        "try { const kr = $('Знание с сайта').first().json; if (kr && kr.json) { const k = JSON.parse(kr.json); if (k && Array.isArray(k.afisha)) KNOWLEDGE = k } } catch (e) {}",
        "const { ev, res: first, saved } = $('Решить').first().json",
        'const raw = $input.first().json',
        'let parsed = null',
        'try { parsed = parseTurnReply(raw.choices && raw.choices[0] && raw.choices[0].message ? raw.choices[0].message.content : "", first.parse.userText) } catch (e) { parsed = null }',
        "const store = $getWorkflowStaticData('global')",
        'const res = decide(ev, saved, store.usage || null, KNOWLEDGE, { nowMs: Date.now(), adminChatId: $env.ADMIN_CHAT_ID, useParser: true, parsed })',
        'if (res.global) store.usage = res.global',
        'return [{ json: { ev, res, parsed } }]',
      ].join('\n'),
      { lib: true },
    ),
    needModel: node('Нужна модель?', 'n8n-nodes-base.switch', 3.2, [880, 300], {
      mode: 'expression',
      numberOutputs: 2,
      output: '={{ $json.res.model ? 1 : 0 }}',
    }),
    yandex: node(
      'Спросить модель',
      'n8n-nodes-base.code',
      2,
      [1100, 420],
      {
        jsCode: withLib(
          [
            'const m = $input.first().json.res.model',
            "const store = $getWorkflowStaticData('global')",
            'const body = { model: $env.LLM_MODEL, messages: m.messages.map((x) => ({ role: x.role, content: x.text })), max_tokens: 1000, temperature: 0.2, stream: false }',
            '// up to 50 s: a person would rather wait than get "не получается ответить"',
            'const r = await callLlm(this.helpers, $env, store, body, 50000)',
            'return [{ json: r }]',
          ].join('\n'),
        ),
      },
      { onError: 'continueErrorOutput' },
    ),
    afterModel: code(
      'Ответ модели',
      [1320, 360],
      [
        "let src = null; try { src = $('Решить с разбором').first().json } catch (e) { src = null }",
        "if (!src || !src.res) src = $('Решить').first().json",
        'const { ev, res } = src',
        "let knowledge = null; try { const kr = $('Знание с сайта').first().json; if (kr && kr.json) knowledge = JSON.parse(kr.json) } catch (e) { knowledge = null }",
        'const r = $input.first().json',
        "const text = r && r.choices && r.choices[0] && r.choices[0].message ? (r.choices[0].message.content || '') : ''",
        'const fin = afterModel(res, text, Date.now(), knowledge)',
        'res.out = res.out.concat(fin.out)',
        'res.effects = res.effects.concat(fin.effects)',
        'res.model = null',
        'return [{ json: { ev, res } }]',
      ].join('\n'),
      { lib: true },
    ),
    modelDown: code(
      'Модель недоступна',
      [1320, 520],
      [
        "let src = null; try { src = $('Решить с разбором').first().json } catch (e) { src = null }",
        "if (!src || !src.res) src = $('Решить').first().json",
        'const { ev, res } = src',
        'const chatId = res.state.chatId',
        "res.out.push({ chat_id: chatId, text: 'Я сейчас перегружен и не успеваю ответить, простите. Спросите, пожалуйста, через пару минут. Или позвоните: +7 906 120-22-62 (пн–пт, 15:00–21:00).' })",
        'const ctx = (res.model && res.model.ctx) || {}',
        'if (ctx.reprompt) res.out.push(Object.assign({ chat_id: chatId, text: ctx.reprompt }, ctx.repromptMarkup ? { reply_markup: ctx.repromptMarkup } : {}))',
        'const err = $input.first().json.error',
        "res.effects.push({ type: 'devAlert', text: 'Модель не ответила: ' + String((err && (err.message || err.description)) || JSON.stringify(err || '')).slice(0, 300) })",
        'res.model = null',
        'return [{ json: { ev, res } }]',
      ].join('\n'),
    ),
    plan: code(
      'Итог хода',
      [1540, 300],
      [
        'const { res } = $input.first().json',
        "const ADMIN = $env.ADMIN_CHAT_ID ? String($env.ADMIN_CHAT_ID) : ''",
        'const now = new Date().toISOString()',
        'const plan = { chats: [], leads: [], statuses: [], unanswered: [], tg: [] }',
        "if (res.answerCallback) plan.tg.push({ method: 'answerCallbackQuery', payload: res.answerCallback })",
        "for (const m of res.out) plan.tg.push({ method: 'sendMessage', payload: m })",
        'if (res.state) plan.chats.push({ chat_id: String(res.state.chatId), state: JSON.stringify(res.state), updated_at: now })',
        'for (const e of res.effects) {',
        "  if (e.type === 'leadSave') {",
        '    const l = e.lead',
        "    const row = { lead_id: l.id, updated_at: now, chat_id: String(l.chatId), source: l.source || 'бот', name: l.name || '', phone: l.phone || '', children: (l.children || []).join('; '), questions: (l.questions || []).join(' | '), nudges: String(l.nudges || 0) }",
        "    if (e.isNew) { row.created_at = l.createdAt || now; row.status = 'новая'; row.status_by = '' }",
        '    plan.leads.push(row)',
        "    if (ADMIN) plan.tg.push({ method: 'sendMessage', payload: msg(ADMIN, (e.notice ? e.notice + '\\n\\n' : '') + adminLeadText(l), adminLeadKeyboard(l.id)) })",
        "  } else if (e.type === 'leadCancel') {",
        "    plan.statuses.push({ lead_id: e.lead.id, status: 'отменена клиентом', status_by: 'клиент', updated_at: now })",
        "    if (ADMIN) plan.tg.push({ method: 'sendMessage', payload: msg(ADMIN, '❌ Клиент отменил заявку — звонить не нужно\\n\\n' + adminLeadText(e.lead)) })",
        "  } else if (e.type === 'leadStatus') {",
        "    plan.statuses.push({ lead_id: e.leadId, status: e.status, status_by: e.by || '', updated_at: now })",
        "    plan.tg.push({ method: 'editMessageText', payload: { chat_id: e.adminChatId, message_id: e.adminMessageId, text: e.text, reply_markup: adminLeadKeyboard(e.leadId) } })",
        "  } else if (e.type === 'unanswered') {",
        '    plan.unanswered.push({ asked_at: e.at, chat_id: String(e.chatId), question: e.question })',
        "  } else if (e.type === 'devAlert' && ADMIN) {",
        "    plan.tg.push({ method: 'sendMessage', payload: msg(ADMIN, '⚠️ ' + esc(e.text)) })",
        '  }',
        '}',
        'return [{ json: plan }]',
      ].join('\n'),
      { lib: true },
    ),
    // fan-out, top to bottom = execution order: storage first, Telegram last,
    // so a message is never sent for a turn whose state failed to save
    pickChats: code('→ диалог', [1760, 100], 'return $input.first().json.chats.map((json) => ({ json }))'),
    saveChat: node('Сохранить диалог', 'n8n-nodes-base.dataTable', 1.1, [1980, 100], {
      resource: 'row', operation: 'upsert', dataTableId: table('chats'), matchType: 'allConditions',
      filters: cond('chat_id', '={{ $json.chat_id }}'), columns: { mappingMode: 'autoMapInputData', value: null },
    }),
    pickLeads: code('→ заявки', [1760, 240], 'return $input.first().json.leads.map((json) => ({ json }))'),
    saveLead: node('Сохранить заявку', 'n8n-nodes-base.dataTable', 1.1, [1980, 240], {
      resource: 'row', operation: 'upsert', dataTableId: table('leads'), matchType: 'allConditions',
      filters: cond('lead_id', '={{ $json.lead_id }}'), columns: { mappingMode: 'autoMapInputData', value: null },
    }),
    pickStatuses: code('→ статусы', [1760, 380], 'return $input.first().json.statuses.map((json) => ({ json }))'),
    saveStatus: node('Обновить статус', 'n8n-nodes-base.dataTable', 1.1, [1980, 380], {
      resource: 'row', operation: 'update', dataTableId: table('leads'), matchType: 'allConditions',
      filters: cond('lead_id', '={{ $json.lead_id }}'), columns: { mappingMode: 'autoMapInputData', value: null },
    }),
    pickUnanswered: code('→ без ответа', [1760, 520], 'return $input.first().json.unanswered.map((json) => ({ json }))'),
    saveUnanswered: node('Вопрос без ответа', 'n8n-nodes-base.dataTable', 1.1, [1980, 520], {
      resource: 'row', operation: 'insert', dataTableId: table('unanswered'), columns: { mappingMode: 'autoMapInputData', value: null },
    }),
    pickTg: code('→ Telegram', [1760, 660], 'return $input.first().json.tg.map((json) => ({ json }))'),
    sendTg: telegramCall('Отправить в Telegram', [1980, 660]),
  }

  const c = {}
  link(c, n.webhook.name, n.parse.name)
  link(c, n.parse.name, n.loadState.name)
  link(c, n.loadState.name, n.loadKnowledge.name)
  link(c, n.loadKnowledge.name, n.decide.name)
  link(c, n.decide.name, n.needParse.name)
  link(c, n.needParse.name, n.needModel.name, 0)
  link(c, n.needParse.name, n.parseIntent.name, 1)
  link(c, n.parseIntent.name, n.decideParsed.name)
  link(c, n.decideParsed.name, n.needModel.name)
  link(c, n.needModel.name, n.plan.name, 0)
  link(c, n.needModel.name, n.yandex.name, 1)
  link(c, n.yandex.name, n.afterModel.name, 0)
  link(c, n.yandex.name, n.modelDown.name, 1)
  link(c, n.afterModel.name, n.plan.name)
  link(c, n.modelDown.name, n.plan.name)
  for (const [pick, save] of [['pickChats', 'saveChat'], ['pickLeads', 'saveLead'], ['pickStatuses', 'saveStatus'], ['pickUnanswered', 'saveUnanswered'], ['pickTg', 'sendTg']]) {
    link(c, n.plan.name, n[pick].name)
    link(c, n[pick].name, n[save].name)
  }

  return {
    id: IDS.main,
    name: 'Ключ · Telegram-бот',
    nodes: Object.values(n),
    connections: c,
    settings: { executionOrder: 'v1', errorWorkflow: IDS.errors, saveManualExecutions: true },
    active: false,
    pinData: {},
    versionId: uuid(`main:${LIB.length}:${KNOWLEDGE.builtAt}`),
  }
}

// ─────────────────────────────────────────────────────────────── errors workflow

function errorsWorkflow() {
  const trigger = node('Ошибка в боте', 'n8n-nodes-base.errorTrigger', 1, [0, 300], {})
  const prepare = code(
    'Текст тревоги',
    [220, 300],
    [
      'const j = $input.first().json',
      "const err = (j.execution && j.execution.error) || {}",
      "const text = ['⚠️ Бот «Ключ» упал', 'Узел: ' + ((j.execution && j.execution.lastNodeExecuted) || '?'), 'Ошибка: ' + String(err.message || '').slice(0, 400)].join('\\n')",
      "if (!$env.ADMIN_CHAT_ID) return []",
      "return [{ json: { method: 'sendMessage', payload: { chat_id: $env.ADMIN_CHAT_ID, text } } }]",
    ].join('\n'),
  )
  const send = telegramCall('Сообщить в чат', [440, 300])
  const c = {}
  link(c, trigger.name, prepare.name)
  link(c, prepare.name, send.name)
  return { id: IDS.errors, name: 'Ключ · ошибки', nodes: [trigger, prepare, send], connections: c, settings: { executionOrder: 'v1' }, active: false, pinData: {}, versionId: uuid('errors:v1') }
}

// ─────────────────────────────────────────────────────────────── setup workflow

// Triggered by a webhook, not by hand: the data-table module is only loaded by
// a running n8n server (the CLI `execute` command refuses it), so the setup has
// to be callable against the live instance. Safe to call repeatedly --
// createIfNotExists makes it a no-op once the tables are there.
// Keeps the bot's knowledge in step with the site without anyone rebuilding
// anything. The site's own build writes public/knowledge.json, this pulls it on
// a timer into a table, and the bot reads that table. Two properties matter:
// a failed fetch leaves the previous row untouched (the bot keeps answering from
// the last good copy), and a copy that goes stale raises an alarm instead of
// quietly rotting.
function syncWorkflow() {
  const trigger = node('Каждые 10 минут', 'n8n-nodes-base.scheduleTrigger', 1.2, [0, 220], {
    rule: { interval: [{ field: 'minutes', minutesInterval: 10 }] },
  })
  // The site's deploy can POST here to refresh immediately; the timer above is
  // then only the safety net for a ping that never arrived.
  const hook = node(
    'Сайт задеплоился',
    'n8n-nodes-base.webhook',
    2.1,
    [0, 380],
    { httpMethod: 'POST', path: 'kluch-knowledge', responseMode: 'lastNode', responseData: 'allEntries', options: {} },
    { webhookId: uuid('kluch-knowledge-webhook') },
  )
  const fetch = node(
    'Скачать знание с сайта',
    'n8n-nodes-base.httpRequest',
    4.2,
    [240, 300],
    {
      method: 'GET',
      url: "={{ ($env.SITE_URL || 'http://127.0.0.1:4173') + '/knowledge.json' }}",
      options: { timeout: 15000, response: { response: { neverError: true, responseFormat: 'json' } } },
    },
    { onError: 'continueRegularOutput', retryOnFail: true, maxTries: 2, waitBetweenTries: 2000 },
  )
  const check = code(
    'Проверить и сравнить',
    [480, 300],
    [
      'const k = $input.first().json',
      '// a half-downloaded or error page must never overwrite a working copy',
      "const ok = k && Array.isArray(k.afisha) && Array.isArray(k.shows) && Array.isArray(k.courses) && Array.isArray(k.faq) && k.faq.some((s) => s.always)",
      'if (!ok) return [{ json: { skip: true, reason: "скачанное знание не похоже на знание — прошлая копия оставлена" } }]',
      '// only real columns here: the row is written with autoMapInputData',
      'return [{ json: { slot: "current", built_at: String(k.builtAt || ""), fetched_at: new Date().toISOString(), json: JSON.stringify(k) } }]',
    ].join('\n'),
  )
  const gate = node('Годится?', 'n8n-nodes-base.switch', 3.2, [720, 300], {
    mode: 'expression',
    numberOutputs: 2,
    output: '={{ $json.skip ? 1 : 0 }}',
  })
  const save = node('Сохранить знание', 'n8n-nodes-base.dataTable', 1.1, [960, 220], {
    resource: 'row',
    operation: 'upsert',
    dataTableId: table('knowledge'),
    matchType: 'allConditions',
    filters: cond('slot', 'current'),
    columns: { mappingMode: 'autoMapInputData', value: {} },
  })
  const alarm = code(
    'Сигнал разработчику',
    [960, 380],
    [
      "const reason = $input.first().json.reason || 'не удалось скачать знание с сайта'",
      "const store = $getWorkflowStaticData('global')",
      'const now = Date.now()',
      '// one message per six hours, not one per failed attempt',
      'if (store.lastAlarm && now - store.lastAlarm < 6 * 60 * 60 * 1000) return []',
      'store.lastAlarm = now',
      "return [{ json: { chat_id: $env.ADMIN_CHAT_ID, text: '⚠️ Бот «Ключ»: знание не обновляется с сайта.\\n' + reason + '\\nОтвечаю по последней копии.' } }]",
    ].join('\n'),
  )
  const tell = node('Написать администратору', 'n8n-nodes-base.httpRequest', 4.2, [1200, 380], {
    method: 'POST',
    url: "={{ ($env.TELEGRAM_API_BASE || 'https://api.telegram.org') + '/bot' + $env.TELEGRAM_BOT_TOKEN + '/sendMessage' }}",
    sendBody: true,
    specifyBody: 'json',
    jsonBody: '={{ JSON.stringify($json) }}',
    options: { timeout: 10000 },
  }, { onError: 'continueRegularOutput' })

  const c = {}
  link(c, trigger.name, fetch.name)
  link(c, hook.name, fetch.name)
  link(c, fetch.name, check.name)
  link(c, check.name, gate.name)
  link(c, gate.name, save.name, 0)
  link(c, gate.name, alarm.name, 1)
  link(c, alarm.name, tell.name)
  return {
    id: IDS.sync,
    name: 'Ключ · знание с сайта',
    nodes: [trigger, hook, fetch, check, gate, save, alarm, tell],
    connections: c,
    settings: { executionOrder: 'v1', errorWorkflow: IDS.errors },
    active: false,
    pinData: {},
    versionId: uuid('sync:v1'),
  }
}

function setupWorkflow() {
  const trigger = node(
    'Запустить один раз',
    'n8n-nodes-base.webhook',
    2.1,
    [0, 300],
    { httpMethod: 'POST', path: 'kluch-setup', responseMode: 'lastNode', responseData: 'allEntries', options: {} },
    { webhookId: uuid('kluch-setup-webhook') },
  )
  const c = {}
  let prev = trigger.name
  const nodes = [trigger]
  Object.entries(TABLES).forEach(([key, columns], i) => {
    const t = node(`Таблица ${tableName(key)}`, 'n8n-nodes-base.dataTable', 1.1, [240 + i * 240, 300], {
      resource: 'table',
      operation: 'create',
      tableName: tableName(key),
      columns: { column: columns.map((name) => ({ name, type: 'string' })) },
      options: { createIfNotExists: true },
    })
    nodes.push(t)
    link(c, prev, t.name)
    prev = t.name
  })
  return { id: IDS.setup, name: 'Ключ · создать таблицы', nodes, connections: c, settings: { executionOrder: 'v1' }, active: false, pinData: {}, versionId: uuid('setup:v1') }
}

fs.mkdirSync(OUT, { recursive: true })
for (const [file, wf] of [['kluch-bot.json', mainWorkflow()], ['kluch-errors.json', errorsWorkflow()], ['kluch-setup.json', setupWorkflow()], ['kluch-sync.json', syncWorkflow()]]) {
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(wf, null, 2))
  console.log(`${file}: ${wf.nodes.length} узлов`)
}
console.log(`данные сайта: ${KNOWLEDGE.afisha.length} показов, ${KNOWLEDGE.shows.length} спектаклей, ${KNOWLEDGE.courses.length} курса`)
