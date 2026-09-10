import { readFile } from 'node:fs/promises'
import { getDatabase } from '../database.js'

function numero(jid) {
  return String(jid || '').split('@')[0]
}

function mencionado(message) {
  return (
    message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.imageMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.videoMessage?.contextInfo?.mentionedJid?.[0]
  )
}

function textoMensagem(message) {
  return (
    message?.message?.conversation ||
    message?.message?.extendedTextMessage?.text ||
    message?.message?.imageMessage?.caption ||
    message?.message?.videoMessage?.caption ||
    ''
  ).trim()
}

function garantirGold(usuario) {
  usuario.gold = Number(usuario.gold || 0)
}

async function adicionarGold(jid, quantidade) {
  const db = await getDatabase()

  db.data.users[jid] ||= { jid }
  garantirGold(db.data.users[jid])

  db.data.users[jid].gold += quantidade
  await db.write()

  return db.data.users[jid].gold
}

async function removerGold(jid, quantidade) {
  const db = await getDatabase()

  db.data.users[jid] ||= { jid }
  garantirGold(db.data.users[jid])

  db.data.users[jid].gold = Math.max(
    0,
    db.data.users[jid].gold - quantidade
  )

  await db.write()

  return db.data.users[jid].gold
}

const perguntas = [
  {
    pergunta: 'O que é, o que é? Quanto mais se tira, maior fica?',
    resposta: ['buraco'],
  },
  {
    pergunta: 'O que é, o que é? Tem dentes, mas não morde?',
    resposta: ['pente'],
  },
  {
    pergunta: 'O que é, o que é? Cai em pé e corre deitado?',
    resposta: ['chuva'],
  },
  {
    pergunta: 'O que é, o que é? Tem cabeça e tem dente, mas não é gente?',
    resposta: ['alho'],
  },
  {
    pergunta: 'O que é, o que é? Quanto mais seca, mais molhada fica?',
    resposta: ['toalha'],
  },
  {
    pergunta: 'O que é, o que é? Anda sem pernas e chora sem olhos?',
    resposta: ['nuvem'],
  },
  {
    pergunta: 'O que é, o que é? Tem mãos, mas não bate palmas?',
    resposta: ['relogio', 'relógio'],
  },
  {
    pergunta: 'O que é, o que é? Tem pescoço, mas não tem cabeça?',
    resposta: ['garrafa'],
  },
  {
    pergunta: 'O que é, o que é? Tem uma perna, quatro braços e uma cabeça?',
    resposta: ['mesa'],
  },
  {
    pergunta: 'O que é, o que é? Entra na água e não se molha?',
    resposta: ['sombra'],
  },
]

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
}

function sortearPergunta() {
  return perguntas[Math.floor(Math.random() * perguntas.length)]
}

function grupoId(message) {
  return message?.key?.remoteJid || null
}

function nomeDoUsuario(message, jid) {
  if (jid === message?.key?.participant && message?.pushName) {
    return message.pushName
  }

  return `@${numero(jid)}`
}

async function enviarAura({ sock, message, alvo }) {
  const porcentagem = Math.floor(Math.random() * 101)

  let frase

  if (porcentagem >= 90) {
    frase = '🔥 Farmou aura demais! O grupo inteiro sentiu.'
  } else if (porcentagem >= 70) {
    frase = '😎 Tá farmando aura bonito!'
  } else if (porcentagem >= 50) {
    frase = '✨ Uma aura respeitável!'
  } else if (porcentagem >= 25) {
    frase = '😂 Ainda precisa farmar mais aura.'
  } else {
    frase = '💀 A aura foi de base hoje.'
  }

  const db = await getDatabase()
  db.data.settings ||= {}
  db.data.settings.brincadeiras ||= {}

  const caminho =
    db.data.settings.brincadeiras.auraPhoto ||
    db.data.settings.brincadeiras.auraImage

  const caption =
    `✨ *AURA DE @${numero(alvo)}*\n\n` +
    `💫 Aura: *${porcentagem}%*\n\n` +
    `${frase}\n\n` +
    `⚡ ${nomeDoUsuario(message, alvo)} acabou de farmar aura!`

  if (caminho) {
    try {
      const foto = await readFile(caminho)

      await sock.sendMessage(
        message.key.remoteJid,
        {
          image: foto,
          caption,
          mentions: [alvo],
        },
        { quoted: message }
      )

      return
    } catch (error) {
      console.error('ERRO AO ENVIAR IMAGEM DA AURA:', error)
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

export const novasBrincadeirasCommands = [
  {
    name: 'oqueeoque',
    aliases: ['oqueeoque', 'oquee'],
    description: 'Inicia uma pergunta para o grupo.',
    async execute({ sock, message, reply }) {
      const grupo = grupoId(message)

      if (!grupo?.endsWith('@g.us')) {
        return reply('❌ Esse jogo só pode ser usado em grupos.')
      }

      const db = await getDatabase()
      db.data.games ||= {}

      const pergunta = sortearPergunta()

      db.data.games[grupo] = {
        tipo: 'oqueeoque',
        resposta: pergunta.resposta,
        criadoEm: Date.now(),
        premio: 10,
      }

      await db.write()

      return sock.sendMessage(
        grupo,
        {
          text:
            `🧠 *O QUE É, O QUE É?*\n\n` +
            `❓ ${pergunta.pergunta}\n\n` +
            `🏆 Primeiro a acertar ganha *10 Gold*!\n` +
            `💬 Pode responder sem comando.\n\n` +
            `⚡ Boa sorte!`,
        },
        { quoted: message }
      )
    },
  },

  {
    name: 'caracoroa',
    aliases: ['caraoucoroa'],
    description: 'Aposta Gold em Cara ou Coroa.',
    async execute({ sock, message, reply, args, sender }) {
      const aposta = Number(args?.[0])

      if (!Number.isInteger(aposta) || aposta <= 0) {
        return reply(
          `🪙 *CARA OU COROA*\n\n` +
          `Use:\n` +
          `!caracoroa quantidade\n\n` +
          `Exemplo:\n` +
          `!caracoroa 10`
        )
      }

      const db = await getDatabase()
      db.data.users[sender] ||= { jid: sender }
      garantirGold(db.data.users[sender])

      if (db.data.users[sender].gold < aposta) {
        return reply(
          `❌ Você não tem Gold suficiente.\n\n` +
          `🪙 Seu Gold: *${db.data.users[sender].gold}*\n` +
          `💰 Aposta: *${aposta}*`
        )
      }

      const resultado = Math.random() < 0.5 ? 'cara' : 'coroa'

      if (resultado === 'cara') {
        const saldo = await adicionarGold(sender, aposta)

        return sock.sendMessage(
          message.key.remoteJid,
          {
            text:
              `🪙 *CARA OU COROA!*\n\n` +
              `🪙 Resultado: *CARA* 😎\n\n` +
              `🎉 Você ganhou *${aposta} Gold*!\n` +
              `💰 Saldo: *${saldo} Gold*`,
          },
          { quoted: message }
        )
      }

      const saldo = await removerGold(sender, aposta)

      return sock.sendMessage(
        message.key.remoteJid,
        {
          text:
            `🪙 *CARA OU COROA!*\n\n` +
            `🪙 Resultado: *COROA* 😈\n\n` +
            `💸 Você perdeu *${aposta} Gold*.\n` +
            `💰 Saldo: *${saldo} Gold*`,
        },
        { quoted: message }
      )
    },
  },

  {
    name: 'aura',
    aliases: ['aurapessoa'],
    description: 'Calcula a aura fictícia de uma pessoa.',
    async execute(ctx) {
      const alvo = mencionado(ctx.message)

      if (!alvo) {
        return ctx.reply(
          `✨ Marque alguém para calcular a aura.\n\nExemplo: !aura @pessoa`
        )
      }

      return enviarAura({
        ...ctx,
        alvo,
      })
    },
  },

  {
    name: 'rankgay',
    aliases: ['gayrank'],
    description: 'Ranking fictício de brincadeira do grupo.',
    async execute({ sock, message, reply }) {
      const grupo = grupoId(message)

      if (!grupo?.endsWith('@g.us')) {
        return reply('❌ Esse ranking só pode ser usado em grupos.')
      }

      const metadata = await sock.groupMetadata(grupo)

      const participantes = (metadata.participants || [])
        .map(p => p.id || p.phoneNumber)
        .filter(Boolean)

      if (participantes.length === 0) {
        return reply('❌ Não consegui encontrar os participantes do grupo.')
      }

      const embaralhados = [...participantes].sort(
        () => Math.random() - 0.5
      )

      const selecionados = embaralhados.slice(0, 5)

      const ranking = selecionados
        .map((jid, index) => {
          const porcentagem = Math.floor(Math.random() * 81) + 20

          return (
            `${index + 1}. @${numero(jid)} — *${porcentagem}%* 🏳️‍🌈`
          )
        })
        .join('\n')

      return sock.sendMessage(
        grupo,
        {
          text:
            `🏳️‍🌈 *RANK GAY — BRINCADEIRA*\n\n` +
            `${ranking}\n\n` +
            `😂 Ranking totalmente fictício e aleatório.\n` +
            `⚠️ Não representa nem tenta determinar a orientação sexual de ninguém.`,
          mentions: selecionados,
        },
        { quoted: message }
      )
    },
  },
]
