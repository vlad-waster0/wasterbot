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


const afkPorGrupo = new Map()

function obterJidMencionado(message) {
  const contexto =
    message?.message?.extendedTextMessage?.contextInfo ||
    message?.message?.imageMessage?.contextInfo ||
    message?.message?.videoMessage?.contextInfo ||
    {}

  return contexto.mentionedJid?.[0] || null
}

export const afkCommand = {
  name: 'afk',
  aliases: ['away'],

  async execute({ sock, message, args, textoCompleto, sender, reply }) {
    const groupJid = message?.key?.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ O comando AFK só pode ser usado em grupos.')
    }

    const motivo = String(textoCompleto || args?.join(' ') || '').trim()

    if (!motivo) {
      return reply('❌ Use: *!afk motivo*\n\nExemplo: *!afk dormindo*')
    }

    if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
      return reply('❌ Apenas administradores podem ativar o AFK.')
    }

    if (!afkPorGrupo.has(groupJid)) {
      afkPorGrupo.set(groupJid, new Map())
    }

    afkPorGrupo.get(groupJid).set(sender, {
      ativo: true,
      motivo,
    })

    return reply(
      `😴 *AFK ativado!*\n\n` +
      `👤 Usuário: @${String(sender).split('@')[0]}\n` +
      `💬 Motivo: ${motivo}`,
      { mentions: [sender] }
    )
  },
}

export const afkMotivoCommand = {
  name: 'afkmotivo',
  aliases: ['mudarafk', 'alterarafk'],

  async execute({ sock, message, args, textoCompleto, sender, reply }) {
    const groupJid = message?.key?.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Esse comando só pode ser usado em grupos.')
    }

    if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
      return reply('❌ Apenas administradores podem alterar o AFK.')
    }

    const motivo = String(textoCompleto || args?.join(' ') || '').trim()

    if (!motivo) {
      return reply('❌ Use: *!afkmotivo novo motivo*')
    }

    const grupo = afkPorGrupo.get(groupJid)
    const atual = grupo?.get(sender)

    if (!atual?.ativo) {
      return reply('❌ Você não está com AFK ativado.')
    }

    atual.motivo = motivo
    return reply(`✅ Motivo do seu AFK alterado para: ${motivo}`)
  },
}

export const desativarAfkCommand = {
  name: 'offafk',
  aliases: ['desafk', 'afkoff'],

  async execute({ sock, message, sender, reply }) {
    const groupJid = message?.key?.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Esse comando só pode ser usado em grupos.')
    }

    if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
      return reply('❌ Apenas administradores podem desativar o AFK.')
    }

    const grupo = afkPorGrupo.get(groupJid)
    const atual = grupo?.get(sender)

    if (!atual?.ativo) {
      return reply('❌ Você não está com AFK ativado.')
    }

    grupo.delete(sender)
    return reply('✅ Seu AFK foi desativado.')
  },
}

export async function verificarAfk(sock, message, reply) {
  const groupJid = message?.key?.remoteJid
  if (!groupJid?.endsWith('@g.us')) return false

  const mencionado = obterJidMencionado(message)
  if (!mencionado) return false

  const grupo = afkPorGrupo.get(groupJid)
  if (!grupo) return false

  const normalizar = (id) => String(id || '').split('@')[0].split(':')[0]

  let entrada = [...grupo.entries()].find(([jid]) =>
    normalizar(jid) === normalizar(mencionado)
  )

  if (!entrada && mencionado.endsWith('@lid')) {
    try {
      const metadata = await obterMetadataGrupo(sock, groupJid)
      const participante = (metadata.participants || []).find((p) =>
        [p.id, p.lid, p.phoneNumber, p.jid]
          .filter(Boolean)
          .some((id) => String(id) === String(mencionado))
      )

      if (participante) {
        const ids = [
          participante.phoneNumber,
          participante.id,
          participante.jid,
          participante.lid,
        ].filter(Boolean)

        entrada = [...grupo.entries()].find(([jid]) =>
          ids.some((id) => normalizar(jid) === normalizar(id))
        )
      }
    } catch (error) {
      console.error('ERRO AO RESOLVER MENÇÃO DO AFK:', error)
    }
  }

  if (!entrada) return false

  const [jid, dados] = entrada

  if (!dados?.ativo) return false

  await reply(
    `😴 Usuário @${normalizar(jid)} está AFK.\n` +
    `💬 Motivo: ${dados.motivo}`,
    { mentions: [jid] }
  )

  return true
}

export const ativarMensagemAutoCommand = {
  name: 'ativarmensagemauto',
  aliases: ['mensagemautoon'],
  description: 'Ativa as mensagens automáticas do bot.',
  async execute({ reply, sender, sock, message }) {
    const groupJid = message?.key?.remoteJid
    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
      return reply('❌ Apenas administradores podem usar este comando.')
    }

    const db = await getDatabase()
    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].mensagemAutoBot = true
    await db.write()

    return reply('✅ Mensagens automáticas do bot ativadas neste grupo.')
  },
}

export const desativarMensagemAutoCommand = {
  name: 'desativarmensagemauto',
  aliases: ['mensagemautooff'],
  description: 'Desativa as mensagens automáticas do bot.',
  async execute({ reply, sender, sock, message }) {
    const groupJid = message?.key?.remoteJid
    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
      return reply('❌ Apenas administradores podem usar este comando.')
    }

    const db = await getDatabase()
    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].mensagemAutoBot = false
    await db.write()

    return reply('✅ Mensagens automáticas do bot desativadas neste grupo.')
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
