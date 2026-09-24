// Leads from the site's forms. They land in the same `leads` table as the
// bot's, get the same letter and the same card with status buttons in the
// admin chat, so the administrator has one list, not two.
//
//   POST /api/lead   { form, fields: { "Имя": "...", ... }, consent: true, directionId? }
//   POST /api/event  { kind: "mascot", data: { ... } }   what people open in the
//                    site's cat; no personal data, only for learning what is asked
//
// Nothing a browser sends is trusted: the form must be a known one, the fields
// short strings, consent explicit, and one address gets a handful of tries an
// hour. The site checks the same things first; this is the check that counts.

import { leadLetter } from './mail.mjs'

const FORMS = {
  course: { what: (f) => 'Курсы' + (f['Курс'] ? ' (' + f['Курс'].toLowerCase() + ')' : ''), phone: true },
  festival: { what: () => 'Фестиваль «Действующие лица»', phone: true, direction: 'festival' },
  audience: { what: () => 'Новости театра', phone: false, direction: 'newsletter' },
  direction: { what: null, phone: false },
}
const NAME_KEYS = ['Имя', 'Контактное лицо', 'Ваше имя']
const SKIP_KEYS = new Set([...NAME_KEYS, 'Телефон', 'Согласие', 'website'])

const LIMITS = { perIpHour: 6, perDay: 300, eventsPerIpHour: 120 }

function rateLimiter() {
  const hits = new Map()
  return function allow(key, max, windowMs, nowMs) {
    const list = (hits.get(key) || []).filter((t) => nowMs - t < windowMs)
    if (list.length >= max) { hits.set(key, list); return false }
    list.push(nowMs)
    hits.set(key, list)
    if (hits.size > 5000) hits.delete(hits.keys().next().value)
    return true
  }
}

export function createSiteApi({ env, lib, store, getKnowledge, send, log, now = () => Date.now() }) {
  const ADMIN = env.ADMIN_CHAT_ID ? String(env.ADMIN_CHAT_ID) : ''
  const allow = rateLimiter()

  function bad(status, error) {
    return { status, body: { ok: false, error } }
  }

  function cleanFields(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const out = {}
    const keys = Object.keys(raw)
    if (keys.length > 20) return null
    for (const k of keys) {
      const v = raw[k]
      if (v == null || v === '') continue
      if (typeof v !== 'string' && typeof v !== 'number') return null
      const key = String(k).trim().slice(0, 60)
      const val = String(v).replace(/\s+/g, ' ').trim()
      if (val.length > 500) return null
      if (key && val) out[key] = val
    }
    return out
  }

  async function lead(body, ip) {
    const t = now()
    if (!body || typeof body !== 'object') return bad(400, 'пустая заявка')
    const form = FORMS[body.form] ? body.form : null
    if (!form) return bad(400, 'неизвестная форма')
    const fields = cleanFields(body.fields)
    if (!fields) return bad(400, 'поля заявки в неверном виде')
    // a hidden field people never see; a form-filling robot fills it
    if (fields.website) return { status: 200, body: { ok: true } }
    if (body.consent !== true) return bad(400, 'нужно согласие на обработку персональных данных')

    const name = NAME_KEYS.map((k) => fields[k]).find(Boolean) || ''
    if (!name || name.length > 100) return bad(400, 'укажите имя')
    const rawPhone = fields['Телефон'] || ''
    const phone = rawPhone ? lib.normPhone(rawPhone) || rawPhone : ''
    if (FORMS[form].phone && !phone) return bad(400, 'укажите телефон')

    let what
    if (form === 'direction') {
      const d = (getKnowledge().directions || []).find((x) => x.id === body.directionId)
      if (!d) return bad(400, 'такого направления нет')
      if (d.open === false) return bad(409, 'приём заявок закрыт')
      if (d.askPhone !== false && !phone) return bad(400, 'укажите телефон')
      what = d.title
    } else {
      const d = FORMS[form].direction && (getKnowledge().directions || []).find((x) => x.type === FORMS[form].direction)
      if (d && d.open === false) return bad(409, 'приём заявок закрыт')
      what = d ? d.title : FORMS[form].what(fields)
    }

    if (!allow('ip:' + ip, LIMITS.perIpHour, 3600e3, t)) return bad(429, 'слишком много заявок подряд, попробуйте позже или позвоните')
    if (!allow('all', LIMITS.perDay, 86400e3, t)) {
      log('ВНИМАНИЕ: дневной предел заявок с сайта исчерпан, похоже на спам')
      return bad(429, 'сейчас не получается принять заявку, позвоните нам')
    }

    const at = new Date(t).toISOString()
    const l = {
      id: 'S' + t.toString(36).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase(),
      createdAt: at,
      chatId: '',
      source: 'сайт',
      name,
      phone,
      children: [],
      questions: [],
      direction: what,
      answers: Object.entries(fields).filter(([k]) => !SKIP_KEYS.has(k)).map(([k, v]) => k + ': ' + v),
    }
    const plan = {
      chats: [],
      statuses: [],
      unanswered: [],
      leads: [{
        lead_id: l.id, created_at: at, updated_at: at, status: 'новая', status_by: '', chat_id: '',
        source: 'сайт', name, phone, children: '', questions: '', nudges: '0', direction: what, answers: l.answers.join(' | '),
      }],
      mail: [{ at, ...leadLetter(l, 'new', at) }],
      tg: ADMIN ? [{ method: 'sendMessage', payload: lib.msg(ADMIN, '🆕 Заявка с сайта\n\n' + lib.adminLeadText(l), lib.adminLeadKeyboard(l.id)) }] : [],
    }
    store.commit(plan)
    log('заявка с сайта:', what, '·', l.id)
    for (const item of plan.tg) await send(item)
    return { status: 200, body: { ok: true, id: l.id } }
  }

  function event(body, ip) {
    if (!body || body.kind !== 'mascot') return bad(400, 'неизвестное событие')
    const data = cleanFields(body.data)
    if (!data) return bad(400, 'неверные данные')
    if (!allow('ev:' + ip, LIMITS.eventsPerIpHour, 3600e3, now())) return { status: 204, body: null }
    store.addEvent('mascot', data)
    return { status: 204, body: null }
  }

  return { lead, event }
}
