import { isGroupAdmin } from './admin.js'

function numeroMencao(id) {
  return String(id || '')
    .split('@')[0]
    .split(':')[0]
}

export const mencionarFixCommands = [
  {
    name: 'mencionar',
    aliases: ['todos', 'mencionar_todos', 'tagall'],
    description: 'Marca todos os participantes do grupo.',
    async execute({ sock, message, reply, sender }) {
      const grupo = message?.key?.remoteJid

      if (!grupo?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!(await isGroupAdmin(sock, grupo, sender, message))) {
        return reply('❌ Apenas administradores podem usar este comando.')
      }

      const metadata = await sock.groupMetadata(grupo)
      const participantes = metadata.participants || []

      const mencoes = []

      for (const p of participantes) {
        const jid =
          p.phoneNumber ||
          (String(p.id || '').endsWith('@s.whatsapp.net') ? p.id : null) ||
          p.id ||
          p.lid

        if (!jid) continue

        if (!mencoes.includes(jid)) {
          mencoes.push(jid)
        }
      }

      if (!mencoes.length) {
        return reply('❌ Não consegui encontrar os participantes.')
      }

      /*
       * O @número é usado internamente pelo WhatsApp para reconhecer
       * a menção. Com o array "mentions", o WhatsApp deve renderizar
       * o nome do contato em vez do número.
       */
      const texto =
        `📢 *MENSAGEM A TODOS!*\n\n` +
        mencoes
          .map((jid) => `@${numeroMencao(jid)}`)
          .join('\n') +
        `\n\n👥 Total: *${mencoes.length} participantes*`

      await sock.sendMessage(grupo, {
        text: texto,
        mentions: mencoes,
      })
    },
  },
]
