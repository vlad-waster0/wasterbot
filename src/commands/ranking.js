import { getDatabase } from '../database.js'

export const rankingCommand = {
  name: 'ranking',
  aliases: ['rank', 'topgold'],
  description: 'Mostra o ranking de Gold.',

  async execute({ reply, message }) {
    const groupJid = message.key.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    const db = await getDatabase()

    const usuarios = Object.values(db.data.users || {})
      .map(user => ({
        jid: user.jid,
        gold: Number(user.gold || 0),
      }))
      .filter(user => user.jid && user.gold > 0)
      .sort((a, b) => b.gold - a.gold)
      .slice(0, 10)

    if (!usuarios.length) {
      return reply(`🏆 *RANKING DE GOLD*

Ainda não há usuários com Gold suficiente para aparecer no ranking.

🪙 Use *${'!'}gold* para consultar seu saldo.`)
    }

    const medalhas = ['🥇', '🥈', '🥉']

    const linhas = usuarios.map((user, index) => {
      const medalha = medalhas[index] || `🏅`
      return `${medalha} *${index + 1}º* — @${user.jid.split('@')[0]} — 🪙 *${user.gold} Gold*`
    })

    return reply(`╭━━━━━━「 🏆 RANKING 」━━━━━━╮

💰 *TOP 10 — GOLD*

${linhas.join('\n')}

╰━━━━━━━━━━━━━━━━━━━━━━╯`)
  },
}
