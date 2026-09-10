import { formatarMenuPrivado, montarMenuPrivado, obterEstilo } from './menu.js'
import { config } from '../config.js'
import { getDatabase } from '../database.js'

const groupMetadataCache = new Map()
const GROUP_METADATA_CACHE_MS = 60 * 1000

async function obterMetadataGrupo(sock, groupJid) {
  const agora = Date.now()
  const cache = groupMetadataCache.get(groupJid)

  if (cache && agora - cache.timestamp < GROUP_METADATA_CACHE_MS) {
    return cache.metadata
  }

  const metadata = await sock.groupMetadata(groupJid)

  groupMetadataCache.set(groupJid, {
    metadata,
    timestamp: agora,
  })

  return metadata
}

export async function isGroupAdmin(sock, groupJid, sender, message) {
  if (!groupJid?.endsWith('@g.us')) return false

  try {
    const metadata = await obterMetadataGrupo(sock, groupJid)
    const participantes = metadata.participants || []

    const participant = String(
      message?.key?.participant || ''
    )

    const participantAlt = String(
      message?.key?.participantAlt || ''
    )

    const senderId = String(sender || '')

    const normalizar = (id) =>
      String(id || '')
        .split('@')[0]
        .split(':')[0]

    // Primeiro tenta o identificador exato.
    let member = participantes.find((p) =>
      [p.id, p.lid, p.phoneNumber]
        .filter(Boolean)
        .map(String)
        .includes(participant)
    )

    // Depois tenta o número real (participantAlt).
    if (!member && participantAlt) {
      member = participantes.find((p) =>
        [p.id, p.lid, p.phoneNumber]
          .filter(Boolean)
          .map(String)
          .includes(participantAlt)
      )
    }

    // Depois tenta o sender.
    if (!member && senderId) {
      member = participantes.find((p) =>
        [p.id, p.lid, p.phoneNumber]
          .filter(Boolean)
          .map(String)
          .includes(senderId)
      )
    }

    // Último recurso: compara somente a parte numérica.
    if (!member) {
      const numeros = [
        normalizar(participant),
        normalizar(participantAlt),
        normalizar(senderId),
      ].filter(Boolean)

      member = participantes.find((p) => {
        const ids = [
          p.id,
          p.lid,
          p.phoneNumber,
        ]
          .filter(Boolean)
          .map(normalizar)

        return ids.some((id) => numeros.includes(id))
      })
    }

    const ehAdmin =
      member?.admin === 'admin' ||
      member?.admin === 'superadmin'

    console.log(
      `👮 VERIFICAÇÃO ADMIN: ` +
      `sender=${senderId} ` +
      `participant=${participant} ` +
      `participantAlt=${participantAlt} ` +
      `encontrado=${member?.id || 'NÃO'} ` +
      `admin=${ehAdmin}`
    )

    return ehAdmin
  } catch (error) {
    console.error('ERRO AO VERIFICAR ADMIN:', error)
    return false
  }
}


export const ativarGoldDiarioCommand = {
  name: 'ongolddiario',
  aliases: ['golddiarioon'],
  description: 'Ativa o Gold diário no grupo.',
  async execute({ reply, sender, sock, message }) {
    const groupJid = message.key.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    const admin = await isGroupAdmin(sock, groupJid, sender, message)

    if (!admin) {
      return reply('❌ Apenas administradores podem usar este comando.')
    }

    const db = await getDatabase()
    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].goldDailyEnabled = true

    await db.write()

    return reply('✅ Gold diário ativado neste grupo.')
  },
}

export const desativarGoldDiarioCommand = {
  name: 'offgolddiario',
  aliases: ['golddiariooff'],
  description: 'Desativa o Gold diário no grupo.',
  async execute({ reply, sender, sock, message }) {
    const groupJid = message.key.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    const admin = await isGroupAdmin(sock, groupJid, sender, message)

    if (!admin) {
      return reply('❌ Apenas administradores podem usar este comando.')
    }

    const db = await getDatabase()
    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].goldDailyEnabled = false

    await db.write()

    return reply('✅ Gold diário desativado neste grupo.')
  },
}

export const adminMenuCommand = {
  name: 'menuadm',
  aliases: ['adm', 'admin'],
  description: 'Exibe o menu de administração.',

  async execute({ reply, sender, sock, message }) {
    const groupJid = message.key.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    const admin = await isGroupAdmin(sock, groupJid, sender, message)

    if (!admin) {
      return reply('❌ Este menu é exclusivo para administradores.')
    }

    const p = config.prefix

    const db = await getDatabase()
    const personalizado = db.data.groups[groupJid]?.menu || {}
    const estilo = obterEstilo(db, groupJid)
    const textoMenu = montarMenuPrivado('adm', estilo, p, personalizado)
    return reply(await formatarMenuPrivado(textoMenu, groupJid))
    },
  }
