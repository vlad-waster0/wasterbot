import { getDatabase } from '../database.js'
import { isGroupAdmin } from './admin.js'

function horarioValido(horario) {
  return /^\d{2}:\d{2}$/.test(horario) &&
    Number(horario.slice(0, 2)) >= 0 &&
    Number(horario.slice(0, 2)) <= 23 &&
    Number(horario.slice(3, 5)) >= 0 &&
    Number(horario.slice(3, 5)) <= 59
}

export const horarioGrupoCommands = [
  {
    name: 'horariogrupo',
    aliases: ['horariogrupoauto', 'horarioauto'],
    description: 'Configura o horário automático do grupo.',
    async execute({ sock, message, reply, sender, args }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
        return reply('❌ Apenas administradores do grupo podem configurar o horário.')
      }

      const [fechar, abrir] = args || []

      if (!fechar || !abrir) {
        return reply(`⏰ *HORÁRIO AUTOMÁTICO*

Use:
!horariogrupo HH:MM HH:MM

Exemplo:
!horariogrupo 22:00 06:00

🌙 O primeiro horário é quando o grupo fecha.
🌅 O segundo horário é quando o grupo abre novamente.

⚠️ O horário é repetido automaticamente todos os dias.`)
      }

      if (!horarioValido(fechar) || !horarioValido(abrir)) {
        return reply('❌ Horário inválido. Use o formato HH:MM, por exemplo: 22:00 06:00.')
      }

      const db = await getDatabase()

      db.data.groups[groupJid] ||= {}
      db.data.groups[groupJid].horarioGrupo = {
        ativo: true,
        fechar,
        abrir,
        ultimaAcao: null,
      }

      await db.write()

      return reply(`✅ *HORÁRIO AUTOMÁTICO CONFIGURADO!*

🔒 Fechamento: *${fechar}*
🔓 Abertura: *${abrir}*

🌙 O grupo será fechado automaticamente às *${fechar}*.
🌅 O grupo será aberto automaticamente às *${abrir}*.

⚙️ A programação será repetida todos os dias.`)
    },
  },

  {
    name: 'cancelarhorario',
    aliases: ['cancelarhorariogrupo', 'desativarhorario'],
    description: 'Cancela o horário automático do grupo.',
    async execute({ sock, message, reply, sender }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
        return reply('❌ Apenas administradores do grupo podem cancelar o horário.')
      }

      const db = await getDatabase()

      db.data.groups[groupJid] ||= {}
      db.data.groups[groupJid].horarioGrupo ||= {}
      db.data.groups[groupJid].horarioGrupo.ativo = false

      await db.write()

      return reply('✅ *HORÁRIO AUTOMÁTICO CANCELADO!*\n\nO grupo não será mais fechado ou aberto automaticamente.')
    },
  },
]
