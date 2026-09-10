import { getDatabase } from '../database.js'

function calcularNivel(gold) {
  return Math.floor(Math.sqrt(gold / 100)) + 1
}

function goldParaProximoNivel(nivel) {
  return (nivel * nivel) * 100
}

export const levelCommand = {
  name: 'level',
  aliases: ['nivel', 'lvl'],
  description: 'Mostra seu nível.',

  async execute({ reply, sender }) {
    const db = await getDatabase()
    const user = db.data.users[sender] || {}
    const gold = Number(user.gold || 0)

    const nivel = calcularNivel(gold)
    const necessario = goldParaProximoNivel(nivel)
    const faltam = Math.max(0, necessario - gold)

    return reply(`╭━━━━━━「 ⭐ LEVEL 」━━━━━━╮

👤 Usuário: @${sender.split('@')[0]}
⭐ Nível: *${nivel}*
🪙 Gold acumulado: *${gold}*

${faltam > 0
  ? `📈 Faltam *${faltam} Gold* para alcançar o nível *${nivel + 1}*.`
  : `🔥 Você já alcançou o nível *${nivel}*!`}

╰━━━━━━━━━━━━━━━━━━━━━━╯`)
  },
}
