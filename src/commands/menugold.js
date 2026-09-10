import { config } from '../config.js'
import { hasPermission } from '../permissions.js'
import { getDatabase } from '../database.js'

export const menuGoldCommand = {
  name: 'menugold',
  aliases: ['goldmenu', 'menuouro'],
  description: 'Exibe o menu de Gold.',

  async execute({ reply, sender, message }) {
    if (!(await hasPermission(sender, 'premium'))) {
      return reply('❌ Este menu é exclusivo para usuários Premium.')
    }

    const groupJid = message?.key?.remoteJid
    const db = await getDatabase()
    const personalizado = groupJid?.endsWith('@g.us')
      ? (db.data.groups[groupJid]?.menu || {})
      : {}
    const botName = personalizado.botName || 'Waster Bot'

    const p = config.prefix

    return reply(`╭━━━━━━「 🪙 GOLD 」━━━━━━╮

💰 *SISTEMA DE GOLD*

▸ ${p}gold
▸ ${p}doargold @usuário quantidade
▸ ${p}roubargold @usuário

🛡️ *COMANDOS DE ADMINISTRAÇÃO*

▸ ${p}addgold @usuário quantidade
▸ ${p}tirargold @usuário quantidade
▸ ${p}setgold @usuário quantidade

🏆 *RANKING E NÍVEL*

▸ ${p}ranking
▸ ${p}level

💡 O Gold pode ser utilizado nos
recursos e jogos do ${botName}.

╰━━━━━━━━━━━━━━━━━━━━━━╯`)
  },
}
