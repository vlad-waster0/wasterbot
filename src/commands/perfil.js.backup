import { getDatabase } from '../database.js'

function obterMencao(message) {
  return (
    message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.imageMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.videoMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.key?.participant ||
    message?.key?.remoteJid
  )
}

function numero(jid) {
  return String(jid || '').split('@')[0]
}

export const perfilCommands = [
  {
    name: 'perfil',
    aliases: ['meuperfil'],
    async execute({ sock, message, reply }) {
      const alvo = obterMencao(message)

      if (!alvo) {
        return reply('❌ Não consegui identificar o usuário.')
      }

      const db = await getDatabase()
      const usuario = db.data.users[alvo] || {}

      let foto = null

      try {
        foto = await sock.profilePictureUrl(alvo, 'image')
      } catch {
        foto = null
      }

      const nome =
        usuario.nome ||
        message?.pushName ||
        `Usuário ${numero(alvo)}`

      const gold = Number(usuario.gold || 0)

      const texto = `👤 *PERFIL*

╭━━━〔 🪪 INFORMAÇÕES 〕━━━╮
┃ 👤 Nome: ${nome}
┃ 📱 Número: ${numero(alvo)}
┃ 🪙 Gold: ${gold}
┃ 💎 Premium: ${usuario.premium ? 'Sim' : 'Não'}
╰━━━━━━━━━━━━━━━━━━━━╯

❤️ *RELACIONAMENTO*
┃ Status: ${usuario.relacionamento || 'Solteiro(a)'}`

      if (foto) {
        try {
          await sock.sendMessage(
            message.key.remoteJid,
            {
              image: { url: foto },
              caption: texto,
              mentions: [alvo],
            },
            { quoted: message }
          )
          return
        } catch (error) {
          console.error('ERRO AO ENVIAR FOTO DO PERFIL:', error)
        }
      }

      return sock.sendMessage(
        message.key.remoteJid,
        {
          text: texto,
          mentions: [alvo],
        },
        { quoted: message }
      )
    },
  },
]
