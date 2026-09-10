import { mkdir, unlink, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { config } from '../config.js'
import { getDatabase } from '../database.js'

function idsDoUsuario(sender, message) {
  return [
    sender,
    message?.key?.participant,
    message?.key?.participantAlt,
  ].filter(Boolean)
}

async function temPermissao(sender, message) {
  const ids = idsDoUsuario(sender, message)

  if (ids.some((jid) => config.ownerNumbers.includes(jid.split('@')[0]))) {
    return true
  }

  const db = await getDatabase()
  return ids.some((jid) => db.data.users[jid]?.botOwner)
}

function normalizarNome(nome) {
  return String(nome || '')
    .trim()
    .replace(/^[!#.$%&*]+/, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]/gu, '')
}

function chaveAcao(nome) {
  return String(nome || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function obterMidiaCitada(message) {
  const quoted =
    message?.message?.extendedTextMessage?.contextInfo?.quotedMessage

  if (quoted?.videoMessage) {
    return {
      tipo: 'video',
      mensagem: quoted.videoMessage,
    }
  }

  if (quoted?.imageMessage) {
    return {
      tipo: 'image',
      mensagem: quoted.imageMessage,
    }
  }

  return null
}

function obterMencoes(message) {
  return (
    message?.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    []
  )
}

function textoDaAcao(nome, mencoes) {
  const acao = chaveAcao(nome)
  const alvo = mencoes?.[0] || null
  const marcado = alvo ? `@${alvo.split('@')[0]}` : 'você'

  const frases = {
    abraco: `🤗 Você abraçou ${marcado}!`,
    beijo: `😚 Você deu um beijo em ${marcado}!`,
    tapa: `😈 Você deu um tapa em ${marcado}!`,
    travesseirada: `🛏️ Você deu uma travesseirada em ${marcado}!`,
    chute: `🦶 Você deu um chute em ${marcado}!`,
    carinho: `🥰 Você fez carinho em ${marcado}!`,
    mordida: `🦷 Você deu uma mordida em ${marcado}!`,
    morder: `🦷 Você mordeu ${marcado}!`,
    casar: `💍 Você se casou com ${marcado}!`,
  }

  return frases[acao] || null
}

export async function enviarGifOuImagem({
  sock,
  jid,
  message,
  nome,
  captionExtra = null,
}) {
  const db = await getDatabase()
  const gifs = db.data.settings.gifs || {}
  const chave = normalizarNome(nome)
  const item = gifs[chave]

  if (!item) return false

  const arquivo =
    typeof item === 'string'
      ? item
      : item.arquivo || item.file

  const tipo =
    typeof item === 'string'
      ? 'gif'
      : item.tipo || item.type || 'gif'

  if (!arquivo) return false

  try {
    const buffer = await readFile(arquivo)
    const mencoes = obterMencoes(message)

    const caption =
      captionExtra ||
      textoDaAcao(nome, mencoes) ||
      ''

    if (tipo === 'image') {
      await sock.sendMessage(
        jid,
        {
          image: buffer,
          caption,
          mentions: mencoes,
        },
        { quoted: message }
      )
    } else {
      await sock.sendMessage(
        jid,
        {
          video: buffer,
          gifPlayback: true,
          caption,
          mentions: mencoes,
        },
        { quoted: message }
      )
    }

    return true
  } catch (error) {
    console.error(`ERRO AO ENVIAR MÍDIA ${chave}:`, error)
    return false
  }
}

async function comandoAcao({ sock, message, reply, nome }) {
  const mencoes = obterMencoes(message)

  if (!mencoes.length) {
    return reply(`❌ Marque alguém.\n\nExemplo: ${config.prefix}${nome} @pessoa`)
  }

  const enviou = await enviarGifOuImagem({
    sock,
    jid: message.key.remoteJid,
    message,
    nome,
  })

  if (!enviou) {
    return reply(`❌ Nenhum GIF ou imagem foi configurado para *${nome}*.`)
  }
}

export const gifCommands = [
  {
    name: 'alterargif',
    aliases: [
      'configurargif',
      'salvargif',
      'alterarimagem',
      'salvarimagem',
    ],
    description: 'Salva um GIF ou imagem para um comando.',
    async execute({ reply, sender, message, args }) {
      if (!(await temPermissao(sender, message))) {
        return reply('❌ Apenas o dono do bot pode configurar GIFs e imagens.')
      }

      const nome = normalizarNome(args?.[0])

      if (!nome) {
        return reply(
          `❌ Informe o nome do comando.\n\nExemplo:\n${config.prefix}alterargif abraço\n\nDepois responda a um GIF ou imagem.`
        )
      }

      const midia = obterMidiaCitada(message)

      if (!midia) {
        return reply(
          `❌ Responda a um GIF ou imagem com:\n${config.prefix}alterargif ${nome}`
        )
      }

      await mkdir('data/gifs', { recursive: true })

      const db = await getDatabase()
      db.data.settings.gifs ||= {}

      const extensao = midia.tipo === 'image' ? 'jpg' : 'mp4'
      const arquivo = join('data/gifs', `${nome}.${extensao}`)

      const stream = await downloadContentFromMessage(
        midia.mensagem,
        midia.tipo
      )

      const partes = []

      for await (const parte of stream) {
        partes.push(parte)
      }

      const buffer = Buffer.concat(partes)
      const antigo = db.data.settings.gifs[nome]

      if (antigo) {
        const antigoArquivo =
          typeof antigo === 'string' ? antigo : antigo.arquivo

        if (antigoArquivo && antigoArquivo !== arquivo) {
          try {
            await unlink(antigoArquivo)
          } catch {}
        }
      }

      await writeFile(arquivo, buffer)

      db.data.settings.gifs[nome] = {
        arquivo,
        tipo: midia.tipo,
      }

      await db.write()

      const tipoTexto =
        midia.tipo === 'image' ? '🖼️ IMAGEM' : '🎬 GIF'

      return reply(
        `✅ *${tipoTexto} SALVO!*\n\n` +
        `📌 Comando: *${config.prefix}${nome}*\n` +
        `📁 Arquivo: *${arquivo}*`
      )
    },
  },

  {
    name: 'listagifs',
    aliases: ['gifs', 'giflista', 'listaimagens'],
    description: 'Lista os GIFs e imagens configurados.',
    async execute({ reply }) {
      const db = await getDatabase()
      const gifs = db.data.settings.gifs || {}
      const nomes = Object.keys(gifs).sort()

      if (!nomes.length) {
        return reply('📂 Nenhum GIF ou imagem foi configurado ainda.')
      }

      const lista = nomes
        .map((nome) => {
          const item = gifs[nome]
          const tipo =
            typeof item === 'string'
              ? '🎬 GIF'
              : item.tipo === 'image'
                ? '🖼️ IMAGEM'
                : '🎬 GIF'

          return `▸ ${config.prefix}${nome} — ${tipo}`
        })
        .join('\n')

      return reply(
        `╭━━━━━━「 📁 GIFS E IMAGENS 」━━━━━━╮\n\n` +
        `${lista}\n\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
      )
    },
  },

  {
    name: 'removergif',
    aliases: ['delgif', 'apagargif', 'removerimagem'],
    description: 'Remove um GIF ou imagem configurado.',
    async execute({ reply, sender, message, args }) {
      if (!(await temPermissao(sender, message))) {
        return reply('❌ Apenas o dono do bot pode remover GIFs e imagens.')
      }

      const nome = normalizarNome(args?.[0])

      if (!nome) {
        return reply(
          `❌ Informe o nome que deseja remover.\n\nExemplo: ${config.prefix}removergif abraço`
        )
      }

      const db = await getDatabase()
      db.data.settings.gifs ||= {}

      const item = db.data.settings.gifs[nome]

      if (!item) {
        return reply(`❌ *${nome}* não está configurado.`)
      }

      const arquivo =
        typeof item === 'string' ? item : item.arquivo

      if (arquivo) {
        try {
          await unlink(arquivo)
        } catch {}
      }

      delete db.data.settings.gifs[nome]
      await db.write()

      return reply(`✅ *${nome}* removido com sucesso.`)
    },
  },

  {
    name: 'abraço',
    aliases: ['abraco', 'abracar'],
    async execute(ctx) {
      return comandoAcao({ ...ctx, nome: 'abraço' })
    },
  },

  {
    name: 'beijo',
    aliases: ['beijar'],
    async execute(ctx) {
      return comandoAcao({ ...ctx, nome: 'beijo' })
    },
  },

  {
    name: 'tapa',
    aliases: [],
    async execute(ctx) {
      return comandoAcao({ ...ctx, nome: 'tapa' })
    },
  },

  {
    name: 'travesseirada',
    aliases: [],
    async execute(ctx) {
      return comandoAcao({ ...ctx, nome: 'travesseirada' })
    },
  },

  {
    name: 'chute',
    aliases: [],
    async execute(ctx) {
      return comandoAcao({ ...ctx, nome: 'chute' })
    },
  },

  {
    name: 'morder',
    aliases: ['mordida'],
    async execute(ctx) {
      return comandoAcao({ ...ctx, nome: 'morder' })
    },
  },

  {
    name: 'carinho',
    aliases: [],
    async execute(ctx) {
      return comandoAcao({ ...ctx, nome: 'carinho' })
    },
  },

  ]
