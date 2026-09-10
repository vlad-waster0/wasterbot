import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { JSONFilePreset } from 'lowdb/node'
import { config } from './config.js'

const defaults = {
  settings: {
    prefix: config.prefix,
    fonte: 'normal',
  },
  users: {},
  groups: {},
}

let database

export async function getDatabase() {
  if (!database) {
    await mkdir(dirname(config.dbFile), { recursive: true })
    database = await JSONFilePreset(config.dbFile, defaults)

    database.data.settings ||= {}
    database.data.settings.prefix ||= config.prefix
    database.data.users ||= {}
    database.data.groups ||= {}

    await database.write()
  }

  return database
}

export async function saveUser(jid, patch = {}) {
  const db = await getDatabase()

  const current = db.data.users[jid] || {}

  db.data.users[jid] = {
    ...current,
    ...patch,
    jid,
  }

  await db.write()

  return db.data.users[jid]
}

export async function getUser(jid) {
  const db = await getDatabase()
  return db.data.users[jid] || null
}

export async function isAdmin(jid) {
  if (config.ownerNumbers.includes(jid.split('@')[0])) {
    return true
  }

  const db = await getDatabase()
  return Boolean(db.data.users[jid]?.admin)
}

export async function isOwner(jid) {
  return config.ownerNumbers.includes(jid.split('@')[0])
}

export async function isPremium(jid) {
  const db = await getDatabase()
  return Boolean(db.data.users[jid]?.premium)
}

export async function setPrefix(prefix) {
  const db = await getDatabase()

  db.data.settings.prefix = prefix

  await db.write()
}
