import { getDatabase } from '../database.js'
import { isGroupAdmin } from './admin.js'

export const antifloodCommands = [
  {
    name: 'antiflood',
    aliases: ['anti-flood'],
    description: 'Ativa ou desativa o Anti-Flood.',
    async execute({ sock, message, args, reply, sender }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
        return reply('❌ Apenas administradores do grupo podem configurar o Anti-Flood.')
      }

      const db = await getDatabase()
      db.data.groups[groupJid] ||= {}

      const opcao = String(args[0] || '').toLowerCase()

      if (!['on', 'off', 'ativar', 'desativar'].includes(opcao)) {
        const ativo = db.data.groups[groupJid].antiflood?.enabled === true

        return reply(
          `🌊 *ANTI-FLOOD*\n\n` +
          `Status: ${ativo ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n` +
          `🚨 Regra: 4 ou mais mensagens em menos de 10 segundos.\n\n` +
          `Use:\n` +
          `▸ !antiflood on\n` +
          `▸ !antiflood off`
        )
      }

      const ativar = opcao === 'on' || opcao === 'ativar'

      db.data.groups[groupJid].antiflood = {
        enabled: ativar,
      }

      await db.write()

      return reply(
        ativar
          ? '🌊 *ANTI-FLOOD ATIVADO!*\n\n🚨 4 ou mais mensagens em menos de 10 segundos = usuário removido.'
          : '🌊 *ANTI-FLOOD DESATIVADO!*\n\n✅ O grupo voltou ao normal.'
      )
    },
  },
]
