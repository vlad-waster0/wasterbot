import { getDatabase } from './database.js'

function horaAtualSaoPaulo() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function dataAtualSaoPaulo() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function iniciarAgendadorHorarios(sock) {
  const verificar = async () => {
    try {
      const db = await getDatabase()
      const grupos = db.data.groups || {}
      const hora = horaAtualSaoPaulo()
      const data = dataAtualSaoPaulo()

      for (const [groupJid, grupo] of Object.entries(grupos)) {
        const horario = grupo?.horarioGrupo

        if (!groupJid.endsWith('@g.us') || !horario?.ativo) continue

        if (hora === horario.fechar && horario.ultimaAcao !== `fechar-${data}`) {
          try {
            await sock.groupSettingUpdate(groupJid, 'announcement')

            await sock.sendMessage(groupJid, {
              text:
                `🌙 *BOA NOITE!*\n\n` +
                `🔒 O grupo foi *FECHADO* automaticamente.\n\n` +
                `🌅 O grupo será aberto novamente às *${horario.abrir}*.\n\n` +
                `⚠️ Durante esse período, somente administradores poderão enviar mensagens.`,
            })

            horario.ultimaAcao = `fechar-${data}`
            await db.write()

            console.log(`🔒 GRUPO FECHADO AUTOMATICAMENTE: ${groupJid}`)
          } catch (error) {
            console.error(`ERRO AO FECHAR GRUPO ${groupJid}:`, error.message)
          }
        }

        if (hora === horario.abrir && horario.ultimaAcao !== `abrir-${data}`) {
          try {
            await sock.groupSettingUpdate(groupJid, 'not_announcement')

            await sock.sendMessage(groupJid, {
              text:
                `🌅 *BOM DIA!*\n\n` +
                `🔓 O grupo foi *ABERTO* automaticamente.\n\n` +
                `🌙 O grupo será fechado novamente às *${horario.fechar}*.\n\n` +
                `💬 Todos os membros já podem enviar mensagens.`,
            })

            horario.ultimaAcao = `abrir-${data}`
            await db.write()

            console.log(`🔓 GRUPO ABERTO AUTOMATICAMENTE: ${groupJid}`)
          } catch (error) {
            console.error(`ERRO AO ABRIR GRUPO ${groupJid}:`, error.message)
          }
        }
      }
    } catch (error) {
      console.error('ERRO NO AGENDADOR DE HORÁRIOS:', error)
    }
  }

  verificar()
  return setInterval(verificar, 30 * 1000)
}
