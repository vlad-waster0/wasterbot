import { getDatabase } from '../database.js'
import os from 'node:os'
import { execSync } from 'node:child_process'
import { statfs } from 'node:fs/promises'
import { config } from '../config.js'

const quizzes = [
  ['Qual planeta é conhecido como planeta vermelho?', 'marte'],
  ['Quantos lados tem um hexágono?', '6'],
  ['Qual é o maior oceano do mundo?', 'pacifico'],
]

const inicioBot = Date.now()

function formatarDuracao(ms) {
  let segundos = Math.floor(ms / 1000)

  const dias = Math.floor(segundos / 86400)
  segundos %= 86400

  const horas = Math.floor(segundos / 3600)
  segundos %= 3600

  const minutos = Math.floor(segundos / 60)
  segundos %= 60

  return `${String(dias).padStart(2, '0')} Dia(s) ${String(horas).padStart(2, '0')} Hora(s) ${String(minutos).padStart(2, '0')} Minuto(s) ${String(segundos).padStart(2, '0')} Segundo(s)`
}

function formatarBytes(bytes) {
  const gb = bytes / 1024 / 1024 / 1024
  return `${gb.toFixed(2)} GB`
}

function formatarMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`
}

function tamanhoPasta(caminho) {
  try {
    const resultado = execSync(`du -sk "${caminho}" 2>/dev/null | cut -f1`, {
      encoding: 'utf8'
    }).trim()

    const kb = Number(resultado) || 0
    return `${(kb / 1024).toFixed(2)} MB`
  } catch {
    return 'Indisponível'
  }
}

function obterPlataforma() {
  try {
    return execSync('getprop ro.product.cpu.abi 2>/dev/null', {
      encoding: 'utf8'
    }).trim() || process.arch
  } catch {
    return process.arch
  }
}

export const funCommands = [

{
  name: 'caracoroa',
  aliases: ['caraoucoroa'],
  description: 'Aposta Gold em cara ou coroa.',
  async execute({ reply, sender, args }) {
    const valor = Number(args?.[0])

    if (!Number.isInteger(valor) || valor <= 0) {
      return reply(
        `🪙 *CARA OU COROA*\n\n` +
        `Aposte seu Gold!\n\n` +
        `Exemplo: !caracoroa 10\n\n` +
        `🪙 Cara = ganha\n` +
        `👑 Coroa = perde`
      )
    }

    const db = await getDatabase()
    const usuario = db.data.users[sender] || {}
    const saldo = Number(usuario.gold || 0)

    if (saldo < valor) {
      return reply(
        `❌ Você não tem Gold suficiente.\n\n` +
        `🪙 Seu saldo: *${saldo} Gold*\n` +
        `💰 Aposta: *${valor} Gold*`
      )
    }

    const resultado = Math.random() < 0.5 ? 'cara' : 'coroa'

    if (resultado === 'cara') {
      usuario.gold = saldo + valor
      db.data.users[sender] = { ...usuario, jid: sender }
      await db.write()

      return reply(
        `🪙 *CARA OU COROA!*\n\n` +
        `🪙 Resultado: *CARA!*\n\n` +
        `🎉 Você ganhou *${valor} Gold*!\n` +
        `💰 Seu saldo agora: *${usuario.gold} Gold*`
      )
    }

    usuario.gold = Math.max(0, saldo - valor)
    db.data.users[sender] = { ...usuario, jid: sender }
    await db.write()

    return reply(
      `🪙 *CARA OU COROA!*\n\n` +
      `👑 Resultado: *COROA!*\n\n` +
      `💸 Você perdeu *${valor} Gold*.\n` +
      `💰 Seu saldo agora: *${usuario.gold} Gold*`
    )
  },
},
{
  name: 'aura',
  description: 'Atribui uma pontuação de aura.',
  async execute({ sock, message, reply }) {
    const alvo =
      message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      message?.message?.imageMessage?.contextInfo?.mentionedJid?.[0] ||
      message?.message?.videoMessage?.contextInfo?.mentionedJid?.[0]

    if (!alvo) {
      return reply(`✨ Marque alguém!\n\nExemplo: !aura @pessoa`)
    }

    const porcentagem = Math.floor(Math.random() * 101)

    let frase
    if (porcentagem >= 90) {
      frase = '🔥 Farmou aura demais!'
    } else if (porcentagem >= 70) {
      frase = '😎 Tá farmando aura!'
    } else if (porcentagem >= 40) {
      frase = '✨ Tem uma aulazinha aí.'
    } else {
      frase = '💀 Hoje a aura passou longe!'
    }

    const texto =
      `✨ *TESTE DE AURA*\n\n` +
      `👤 @${alvo.split('@')[0]}\n` +
      `💫 Aura: *${porcentagem}%*\n\n` +
      `${frase}`

    const db = await getDatabase()
    const gifs = db.data.settings.gifs || {}
    const item = gifs.aura

    if (item?.path) {
      try {
        const arquivo = await readFile(item.path)
        const tipo = item.type || 'image'

        if (tipo === 'video' || /\.(mp4|webm)$/i.test(item.path)) {
          return sock.sendMessage(message.key.remoteJid, {
            video: arquivo,
            caption: texto,
            mentions: [alvo],
          })
        }

        return sock.sendMessage(message.key.remoteJid, {
          image: arquivo,
          caption: texto,
          mentions: [alvo],
        })
      } catch (error) {
        console.error('ERRO AO ENVIAR MÍDIA DA AURA:', error)
      }
    }

    return sock.sendMessage(message.key.remoteJid, {
      text: texto,
      mentions: [alvo],
    })
  },
},
  {
  name: 'oqueeoque',
  aliases: ['oqueeoque', 'oquee'],
  description: 'Inicia uma brincadeira de O que é, o que é.',
  async execute({ reply, message }) {
    const perguntas = [
      {
        pergunta: 'O que é, o que é? Quanto mais tira, maior fica?',
        resposta: ['buraco'],
      },
      {
        pergunta: 'O que é, o que é? Tem dentes, mas não morde?',
        resposta: ['pente'],
      },
      {
        pergunta: 'O que é, o que é? Tem cabeça e tem dente, mas não é gente?',
        resposta: ['alho'],
      },
      {
        pergunta: 'O que é, o que é? Cai em pé e corre deitado?',
        resposta: ['chuva'],
      },
      {
        pergunta: 'O que é, o que é? Quanto mais seca, mais molhada fica?',
        resposta: ['toalha'],
      },
    ]

    const jogo = perguntas[Math.floor(Math.random() * perguntas.length)]

    globalThis.__wasterOqueEOque ||= {}
    const chatId = message?.key?.remoteJid || null

    if (chatId) {
      globalThis.__wasterOqueEOque[chatId] = {
        pergunta: jogo.pergunta,
        respostas: jogo.resposta,
        ativo: true,
        iniciadoEm: Date.now(),
      }
    }

    return reply(
      `🧠 *O QUE É, O QUE É?*\n\n` +
      `${jogo.pergunta}\n\n` +
      `💬 Qualquer pessoa do grupo pode responder!\n` +
      `🏆 Quem acertar primeiro ganha Gold!`
    )
  },
},

  {
    name: 'ping',
    description: 'Mostra informações detalhadas do bot.',
    async execute({ reply, sender }) {
      const dono = config.ownerNumbers.includes(sender.split('@')[0])

      if (!dono) {
        return reply('❌ Apenas o dono principal pode usar este comando.')
      }

      const inicioPing = process.hrtime.bigint()

      const memoria = process.memoryUsage()
      const memoriaTotal = os.totalmem()
      const memoriaLivre = os.freemem()
      const memoriaUsada = memoriaTotal - memoriaLivre
      const percentualMemoria = ((memoriaUsada / memoriaTotal) * 100).toFixed(0)

      let armazenamentoTotal = 0
      let armazenamentoLivre = 0

      try {
        const disco = await statfs(process.cwd())
        armazenamentoTotal = Number(disco.blocks) * Number(disco.bsize)
        armazenamentoLivre = Number(disco.bavail) * Number(disco.bsize)
      } catch {}

      const armazenamentoUsado = armazenamentoTotal - armazenamentoLivre
      const percentualDisco = armazenamentoTotal
        ? ((armazenamentoUsado / armazenamentoTotal) * 100).toFixed(0)
        : '0'

      const pingMs = Number(process.hrtime.bigint() - inicioPing) / 1e6

      const agora = new Date()
      const hora = agora.toLocaleTimeString('pt-BR', {
        hour12: false,
        timeZone: 'America/Sao_Paulo'
      })

      const cpu = os.cpus()[0] || { model: '' }
      const modeloCpu = cpu.model || (() => { try { return execSync('grep -m1 "Hardware\|model name" /proc/cpuinfo 2>/dev/null | cut -d: -f2').toString().trim() || 'Desconhecido' } catch { return 'Desconhecido' } })()
      const nucleos = (() => { try { return Number(execSync('grep -c "^processor" /proc/cpuinfo 2>/dev/null').toString().trim()) || os.cpus().length || 1 } catch { return os.cpus().length || 1 } })()

      const sistema = `${os.platform()} v: ${os.release()}`
      const uptimeSistema = formatarDuracao(os.uptime() * 1000)

      const pastaAuth = tamanhoPasta('./auth_info')
      const bancoDados = tamanhoPasta('./data')

      const texto = `━━━━┉┉┉┅┅┅┅┉┉┉━━━━

🕒 *Hora Atual:* ${hora}
👤 *Usuário:* @${sender.split('@')[0]}
📶 *Ping:* ${pingMs.toFixed(3)}ms
⏱️ *Bot ativo a:* ${formatarDuracao(Date.now() - inicioBot)}

🖥️ *Sistema Operacional:*
📱 Plataforma: ${sistema}
📱 Arquitetura: ${obterPlataforma()}
⏱️ Tempo ligado: ${uptimeSistema}

🧠 *Processador:*
🔄 Modelo: ${modeloCpu}
⚙️ ${nucleos} cores x${process.arch}

💾 *Memória RAM do Sistema:*
📈 Em uso: ${formatarBytes(memoriaUsada)} / ${formatarBytes(memoriaTotal)} (${percentualMemoria}%)
📉 Livre: ${formatarBytes(memoriaLivre)}

🤖 *Memória RAM do Bot:*
📊 Consumo: ${formatarMB(memoria.rss)}
💿 Heap: ${formatarMB(memoria.heapUsed)} / ${formatarMB(memoria.heapTotal)}

◈• Pasta QR Code: ${pastaAuth}
◈• Banco de Dados: ${bancoDados}

🗂️ *Armazenamento:*
💽 Total: ${formatarBytes(armazenamentoTotal)}
📊 Usado: ${formatarBytes(armazenamentoUsado)} (${percentualDisco}%)
📈 Livre: ${formatarBytes(armazenamentoLivre)}

━━━━┉┉┉┅┅┅┅┉┉┉━━━━`

      return reply(texto, { mentions: [sender] })
    }
  },

  {
    name: 'dado',
    description: 'Rola um dado.',
    async execute({ reply }) {
      await reply(`🎲 Resultado: ${1 + Math.floor(Math.random() * 6)}`)
    }
  },

  {
    name: 'moeda',
    description: 'Joga cara ou coroa.',
    async execute({ reply }) {
      await reply(`🪙 ${Math.random() > 0.5 ? 'Cara' : 'Coroa'}!`)
    }
  },

  {
    name: 'quiz',
    description: 'Inicia uma pergunta rápida.',
    async execute({ reply }) {
      const [q] = quizzes[Math.floor(Math.random() * quizzes.length)]
      await reply(`🧠 ${q}\n\nResponda no próximo chat.`)
    }
  },
]
