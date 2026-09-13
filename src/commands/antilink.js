import { getDatabase } from '../database.js'
import { config } from '../config.js'
import { isGroupAdmin } from './admin.js'

const antiLinkContagem = new Map()

const LINK_REGEX = /(?:https?:\/\/|www\.|(?:chat\.whatsapp\.com|wa\.me|instagram\.com|youtube\.com|youtu\.be|tiktok\.com|facebook\.com|twitter\.com|x\.com|t\.me|bit\.ly)\/?)\S*/i

export const antilinkCommands = [
  {
    name: 'antilink',
    aliases: ['anti-link'],
    description: 'Ativa ou desativa o Anti-Link do grupo.',
    async execute({ sock, message, args, reply, sender }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
        return reply('❌ Apenas administradores do grupo podem configurar o Anti-Link.')
      }

      const db = await getDatabase()

      db.data.groups[groupJid] ||= {}

      const opcao = String(args[0] || '').toLowerCase()

      if (!['on', 'off', 'ativar', 'desativar'].includes(opcao)) {
        const ativo = db.data.groups[groupJid].antilink?.enabled === true

        return reply(
          `🔗 *ANTI-LINK*\n\n` +
          `Status: ${ativo ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n` +
          `Use:\n` +
          `▸ !antilink on — ativar\n` +
          `▸ !antilink off — desativar`
        )
      }

      const ativar = opcao === 'on' || opcao === 'ativar'

      db.data.groups[groupJid].antilink = {
        enabled: ativar,
      }

      await db.write()

      return reply(
        ativar
          ? '🔗 *ANTI-LINK ATIVADO!*\n\n🚫 Links enviados por membros serão removidos.'
          : '🔗 *ANTI-LINK DESATIVADO!*\n\n✅ Links voltarão a ser permitidos.'
      )
    },
  },
]

export async function deveBloquearLink(sock, groupJid, sender, message, text) {
  if (!groupJid?.endsWith('@g.us')) return false

  if (!LINK_REGEX.test(String(text || ''))) return false

  // O dono principal nunca é bloqueado.
  if (config.ownerNumbers.includes(sender?.split('@')[0])) {
    return false
  }

  // Administradores do grupo nunca são bloqueados.
  if (await isGroupAdmin(sock, groupJid, sender, message)) {
    return false
  }

  try {
    const db = await getDatabase()
    if (db.data.groups[groupJid]?.antilink?.enabled !== true) return false

    const chave = `${groupJid}:${sender}`
    const quantidade = (antiLinkContagem.get(chave) || 0) + 1
    antiLinkContagem.set(chave, quantidade)

    if (quantidade <= 3) return true

    try {
      const participante =
        (await sock.groupMetadata(groupJid)).participants?.find((p) =>
          [p.id, p.lid, p.phoneNumber].filter(Boolean).map(String).some(
            (id) => id.split('@')[0].split(':')[0] === String(sender).split('@')[0].split(':')[0]
          )
        )

      const idRemover =
        participante?.phoneNumber ||
        participante?.id ||
        sender

      const idMencao =
        participante?.id ||
        participante?.phoneNumber ||
        sender

      await sock.sendMessage(groupJid, {
        text:
          `🚨 *ANTI-LINK — USUÁRIO REMOVIDO!*

` +
          `👤 Usuário: @${String(sender).split('@')[0]}
` +
          `⚠️ Motivo: enviou *4 links* após o Anti-Link estar ativado.
` +
          `🔨 Ação: *USUÁRIO REMOVIDO DO GRUPO*`,
        mentions: [idMencao],
      })

      await sock.groupParticipantsUpdate(groupJid, [idRemover], 'remove')
      antiLinkContagem.delete(chave)
    } catch (error) {
      console.error('ERRO AO REMOVER POR ANTI-LINK:', error)
    }

    return true
  } catch (error) {
    console.error('ERRO AO VERIFICAR ANTI-LINK:', error)
    return false
  }
}
