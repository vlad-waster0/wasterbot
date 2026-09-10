import { isGroupAdmin } from './admin.js'

export const linkGrupoCommand = {
  name: 'linkgrupo',
  aliases: ['linkgroup', 'link'],
  description: 'Obtém o link de convite do grupo.',
  async execute({ sock, message, reply, sender }) {
    const groupJid = message.key.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
      return reply('❌ Apenas administradores do grupo podem usar este comando.')
    }

    try {
      const codigo = await sock.groupInviteCode(groupJid)

      if (!codigo) {
        return reply('❌ Não foi possível obter o link do grupo.')
      }

      const link = `https://chat.whatsapp.com/${codigo}`

      return reply(
        `🔗 *LINK DO GRUPO*\n\n` +
        `${link}\n\n` +
        `👥 Compartilhe este link para convidar novos membros.`
      )
    } catch (error) {
      console.error('ERRO AO OBTER LINK DO GRUPO:', error)
      return reply('❌ Não foi possível obter o link do grupo. Verifique se o bot é administrador.')
    }
  },
}
