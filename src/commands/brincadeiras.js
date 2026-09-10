import { readFile } from 'node:fs/promises'
import { getDatabase } from '../database.js'

function mencionado(message) {
  return (
    message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.imageMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.videoMessage?.contextInfo?.mentionedJid?.[0]
  )
}

function nomeMencionado(jid) {
  if (!jid) return '@usuário'
  return `@${jid.split('@')[0]}`
}

async function executarPorcentagem({
  sock,
  message,
  reply,
  nome,
  emoji,
  texto,
}) {
  const alvo = mencionado(message)

  if (!alvo) {
    return reply(`❌ Marque alguém.\n\nExemplo: !${nome} @pessoa`)
  }

  const porcentagem = Math.floor(Math.random() * 101)
  const marcado = nomeMencionado(alvo)

  const caption = `${emoji} ${marcado} é ${porcentagem}% ${texto}!`

  const db = await getDatabase()
  const gifs = db.data.settings.gifs || {}
  const item = gifs[nome]

  if (item) {
    const arquivo =
      typeof item === 'string'
        ? item
        : item.arquivo || item.file

    const tipo =
      typeof item === 'string'
        ? 'gif'
        : item.tipo || item.type || 'gif'

    if (arquivo) {
      try {
        const buffer = await readFile(arquivo)

        if (tipo === 'image') {
          await sock.sendMessage(
            message.key.remoteJid,
            {
              image: buffer,
              caption,
              mentions: [alvo],
            },
            { quoted: message }
          )
        } else {
          await sock.sendMessage(
            message.key.remoteJid,
            {
              video: buffer,
              gifPlayback: true,
              caption,
              mentions: [alvo],
            },
            { quoted: message }
          )
        }

        return
      } catch (error) {
        console.error(`ERRO AO ENVIAR GIF DE ${nome}:`, error)
      }
    }
  }

  return sock.sendMessage(
    message.key.remoteJid,
    {
      text: caption,
      mentions: [alvo],
    },
    { quoted: message }
  )
}

export const brincadeirasCommands = [
  {
    name: 'gay',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'gay',
        emoji: '🏳️‍🌈',
        texto: 'gay',
      })
    },
  },

  {
    name: 'corno',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'corno',
        emoji: '🐂',
        texto: 'corno',
      })
    },
  },

  {
    name: 'corna',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'corna',
        emoji: '🐂',
        texto: 'corna',
      })
    },
  },

  {
    name: 'lindo',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'lindo',
        emoji: '😍',
        texto: 'lindo',
      })
    },
  },

  {
    name: 'linda',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'linda',
        emoji: '😍',
        texto: 'linda',
      })
    },
  },

  {
    name: 'feio',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'feio',
        emoji: '😈',
        texto: 'feio',
      })
    },
  },

  {
    name: 'feia',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'feia',
        emoji: '😈',
        texto: 'feia',
      })
    },
  },

  {
    name: 'mentiroso',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'mentiroso',
        emoji: '🤥',
        texto: 'mentiroso',
      })
    },
  },

  {
    name: 'mentirosa',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'mentirosa',
        emoji: '🤥',
        texto: 'mentirosa',
      })
    },
  },

  {
    name: 'calvo',
    aliases: [],
    async execute(ctx) {
      return executarPorcentagem({
        ...ctx,
        nome: 'calvo',
        emoji: '👨‍🦲',
        texto: 'calvo',
      })
    },
  },
]

export const menuBrincadeirasCommand = {
  name: 'menubrincadeiras',
  aliases: ['brincadeiras', 'menujogos'],
  async execute({ reply }) {
    return reply(`╭━━━━━━「 😂 BRINCADEIRAS 」━━━━━━╮

😂 *PORCENTAGENS*
▸ !gay @pessoa
▸ !corno @pessoa
▸ !corna @pessoa
▸ !lindo @pessoa
▸ !linda @pessoa
▸ !feio @pessoa
▸ !feia @pessoa
▸ !mentiroso @pessoa
▸ !mentirosa @pessoa
▸ !calvo @pessoa

💫 *AURA*
▸ !aura @pessoa

🏳️‍🌈 *RANKING DE BRINCADEIRA*
▸ !rankgay

🧠 *JOGOS DO GRUPO*
▸ !oqueeoque

🪙 *JOGOS COM GOLD*
▸ !caracoroa quantidade

╰━━━━━━━━━━━━━━━━━━━━━━╯`)
  },
}
