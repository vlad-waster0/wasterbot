import { config } from "../config.js"
import { getDatabase } from '../database.js'
import { isGroupAdmin } from './admin.js'

function getMention(message) {
  return message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null
}

async function exigirAdmin({ sock, message, sender, reply }) {
  const groupJid = message.key.remoteJid

  if (!groupJid?.endsWith('@g.us')) {
    await reply('❌ Este comando só pode ser usado em grupos.')
    return null
  }

  if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
    await reply('❌ Apenas administradores do grupo podem usar este comando.')
    return null
  }

  return groupJid
}

export const blacklistCommands = [
  {
    name: 'lista_negra',
    aliases: ['listanegra', 'blacklist'],
    description: 'Adiciona um membro à lista negra.',
    async execute({ sock, message, reply, sender }) {
      const groupJid = await exigirAdmin({ sock, message, sender, reply })
      if (!groupJid) return

      const alvo = getMention(message)

      if (!alvo) {
        return reply(
          '⚠️ Mencione a pessoa que deseja colocar na lista negra.\n\n' +
          'Exemplo:\n!lista_negra @usuário'
        )
      }

      if (alvo === sender) {
        return reply('❌ Você não pode colocar a si mesmo na lista negra.')
      }

      const db = await getDatabase()

      db.data.groups[groupJid] ||= {}
      db.data.groups[groupJid].blacklist ||= {}

      if (db.data.groups[groupJid].blacklist[alvo]) {
        return reply(
          `⚠️ @${alvo.split('@')[0]} já está na lista negra.`,
          { mentions: [alvo] }
        )
      }

      db.data.groups[groupJid].blacklist[alvo] = {
        addedBy: sender,
        addedAt: Date.now(),
      }

      await db.write()

      return reply(
        `🚫 *LISTA NEGRA*\n\n` +
        `👤 Usuário: @${alvo.split('@')[0]}\n` +
        `✅ Usuário adicionado à lista negra deste grupo.`,
        { mentions: [alvo] }
      )
    },
  },

  {
    name: 'remover_lista_negra',
    aliases: ['removerlistanegra', 'delblacklist'],
    description: 'Remove um membro da lista negra.',
    async execute({ sock, message, reply, sender }) {
      const groupJid = await exigirAdmin({ sock, message, sender, reply })
      if (!groupJid) return

      const alvo = getMention(message)

      if (!alvo) {
        return reply(
          '⚠️ Mencione a pessoa que deseja remover da lista negra.\n\n' +
          'Exemplo:\n!remover_lista_negra @usuário'
        )
      }

      const db = await getDatabase()
      const blacklist = db.data.groups[groupJid]?.blacklist || {}

      let chaveRemover = alvo

      if (!blacklist[chaveRemover]) {
        const metadata = await sock.groupMetadata(groupJid)

        const participante = (metadata.participants || []).find((p) => {
          const ids = [p.id, p.lid, p.phoneNumber]
            .filter(Boolean)
            .map(String)

          return ids.includes(String(alvo))
        })

        const possiveisChaves = [
          alvo,
          participante?.id,
          participante?.lid,
          participante?.phoneNumber,
        ].filter(Boolean)

        chaveRemover = possiveisChaves.find((chave) => blacklist[chave]) || null
      }

      if (!chaveRemover) {
        return reply(
          `⚠️ @${alvo.split('@')[0]} não está na lista negra.`,
          { mentions: [alvo] }
        )
      }

      delete blacklist[chaveRemover]
      await db.write()

      return reply(
        `✅ *LISTA NEGRA*\n\n` +
        `👤 Usuário: @${alvo.split('@')[0]}\n` +
        `🟢 Usuário removido da lista negra.`,
        { mentions: [alvo] }
      )
    },
  },

  {
    name: 'ver_lista_negra',
    aliases: ['listanegra2', 'listanegrausuarios'],
    description: 'Mostra os membros da lista negra.',
    async execute({ sock, message, reply, sender }) {
      const groupJid = await exigirAdmin({ sock, message, sender, reply })
      if (!groupJid) return

      const db = await getDatabase()
      const blacklist = db.data.groups[groupJid]?.blacklist || {}
      const usuarios = Object.keys(blacklist)

      if (!usuarios.length) {
        return reply('✅ A lista negra deste grupo está vazia.')
      }

      const metadata = await sock.groupMetadata(groupJid)

      const resolvidos = usuarios.map((jid) => {
        if (!jid.endsWith('@lid')) {
          return { original: jid, real: jid }
        }

        const participante = (metadata.participants || []).find(
          p => p.id === jid || p.lid === jid
        )

        return {
          original: jid,
          real: participante?.phoneNumber || jid,
        }
      })

      const texto = resolvidos
        .map(({ real }, index) => `${index + 1}. @${real.split('@')[0]}`)
        .join('\n')

      const mentions = resolvidos.map(({ real }) => real)

      return reply(
        `🚫 *LISTA NEGRA DO GRUPO*\n\n${texto}`,
        { mentions }
      )
    },
  },
]

export async function estaNaListaNegra(sock, groupJid, sender, message) {
  if (!groupJid?.endsWith('@g.us')) return false

  try {
    const db = await getDatabase()
    const blacklist = db.data.groups[groupJid]?.blacklist || {}

    const ids = [
      sender,
      message?.key?.participant,
      message?.key?.participantAlt,
    ].filter(Boolean)

    return ids.some(id => Boolean(blacklist[id]))
  } catch (error) {
    console.error('ERRO AO VERIFICAR LISTA NEGRA:', error)
    return false
  }
}
