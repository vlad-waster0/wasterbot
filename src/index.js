import { darGoldDiario } from './commands/gold.js'
import { readFile } from 'node:fs/promises'
const cooldowns = new Map()
const antiFloodMap = new Map()
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { iniciarBoasVindas } from './events/welcome.js'
import { iniciarSaida } from './events/leave.js'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import { config } from './config.js'
import { isGroupAdmin } from './commands/admin.js'
import { getDatabase, saveUser, setPrefix } from './database.js'
import { estaNaListaNegra } from './commands/blacklist.js'
import { processarRespostaDeJogo } from './commands/jogos_novos.js'
import { commandMap } from './commands/index.js'
import { deveBloquearLink } from './commands/antilink.js'
import { antifloodCommands } from './commands/antiflood.js'
import { deveBloquearPalavra } from './commands/antipalavra.js'
import { enviarGifOuImagem } from './commands/gifs.js'
import { registrarAtividade } from './commands/atividade.js'
import { atividadeCommands } from './commands/atividade.js'
import { iniciarAgendadorHorarios } from './horarioGrupo.js'

const groupMetadataCache = new Map()
async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState('./auth_info_tiago')
const { version } = await fetchLatestBaileysVersion()  
const MAPAS_FONTE = {
  negrito: {
    upper: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙',
    lower: '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳',
    digits: '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗',
  },
  italico: {
    upper: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍',
    lower: '𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧',
    digits: '0123456789',
  },
  manuscrita: {
    upper: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
    lower: '𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏',
    digits: '0123456789',
  },
  medieval: {
    upper: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ',
    lower: '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷',
    digits: '0123456789',
  },
  dupla: {
    upper: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
    lower: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫',
    digits: '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡',
  },
  monospace: {
    upper: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
    lower: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣',
    digits: '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿',
  },
}

function aplicarFonteUnicode(texto, fonte) {
  if (!texto || fonte === 'normal' || !MAPAS_FONTE[fonte]) {
    return texto
  }

  const mapa = MAPAS_FONTE[fonte]
  const letrasMaiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz'
  const numeros = '0123456789'

  const protegidos = []

  const proteger = (valor) => {
    const indice = protegidos.length
    protegidos.push(valor)
    return `\uE000${indice}\uE001`
  }

  let textoProtegido = String(texto)

  /*
   * Protege menções que já estão no texto.
   * Assim a fonte nunca transforma o JID/número da menção.
   */
  textoProtegido = textoProtegido.replace(
    /@[0-9]{5,20}(?=\b|[^\d]|$)/g,
    (valor) => proteger(valor)
  )

  /*
   * Protege links oficiais.
   */
  textoProtegido = textoProtegido.replace(
    /lojawaster\.shop/gi,
    (valor) => proteger(valor)
  )

  const partes = textoProtegido.split(/(\uE000\d+\uE001)/g)

  const convertido = partes.map((parte) => {
    if (/^\uE000\d+\uE001$/.test(parte)) {
      return parte
    }

    let resultado = ''

    for (const caractere of parte) {
      const iMaiuscula = letrasMaiusculas.indexOf(caractere)
      const iMinuscula = letrasMinusculas.indexOf(caractere)
      const iNumero = numeros.indexOf(caractere)

      if (iMaiuscula >= 0) {
        resultado += Array.from(mapa.upper)[iMaiuscula] || caractere
      } else if (iMinuscula >= 0) {
        resultado += Array.from(mapa.lower)[iMinuscula] || caractere
      } else if (iNumero >= 0) {
        resultado += Array.from(mapa.digits)[iNumero] || caractere
      } else {
        resultado += caractere
      }
    }

    return resultado
  }).join('')

  return convertido.replace(
    /\uE000(\d+)\uE001/g,
    (_, indice) => protegidos[Number(indice)]
  )
}


function instalarFonteGlobalNoSocket(sock) {
  if (!sock || sock.__wasterFonteGlobal) return sock

  const enviarOriginal = sock.sendMessage.bind(sock)

  sock.sendMessage = async (jid, content, options) => {
    try {
      if (
        jid?.endsWith('@g.us') &&
        content &&
        typeof content === 'object'
      ) {
        const novo = { ...content }

        if (typeof novo.text === 'string') {
          novo.text = await aplicarFonteDaConfiguracao(novo.text, jid)
        }

        if (typeof novo.caption === 'string') {
          novo.caption = await aplicarFonteDaConfiguracao(novo.caption, jid)
        }

        content = novo
      }
    } catch (erroFonteGlobal) {
      console.error('ERRO FONTE GLOBAL:', erroFonteGlobal)
    }

    return enviarOriginal(jid, content, options)
  }

  sock.__wasterFonteGlobal = true
  return sock
}

async function aplicarFonteDaConfiguracao(texto, jid) {
  if (!texto || !jid) return texto

  try {
    const db = await getDatabase()

    // A fonte é configurada separadamente para cada grupo.
    const fonte = jid.endsWith('@g.us')
      ? (db.data.groups?.[jid]?.menu?.fonte || 'normal')
      : 'normal'

    return aplicarFonteUnicode(texto, fonte)
  } catch {
    return texto
  }
}

const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: config.logLevel }),
    cachedGroupMetadata: async (jid) => {
      const cached = groupMetadataCache.get(jid)
      return cached?.metadata || undefined
    },
  })
  iniciarBoasVindas(sock)
  iniciarSaida(sock)
  iniciarAgendadorHorarios(sock)
  sock.ev.on('creds.update', saveCreds)
  let pairingSolicitado = false
  let reconectando = false

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'connecting') {
      console.log('🔄 Conectando ao WhatsApp...')
    }

    if (connection === 'open') {
      reconectando = false
      console.log(`${config.botName} conectado.`)
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      const erro = lastDisconnect?.error?.message || 'erro desconhecido'

      console.log('CÓDIGO DE DESCONEXÃO:', code, 'ERRO:', erro)

      if (code === DisconnectReason.loggedOut || code === 401) {
        console.log('🔒 Sessão rejeitada/encerrada pelo WhatsApp. Não haverá reconexão automática.')
        return
      }

      if (reconectando) {
        console.log('⏳ Reconexão já está em andamento. Ignorando nova tentativa.')
        return
      }

      reconectando = true
      console.log('⏳ Aguardando 10 segundos antes de reconectar...')

      setTimeout(() => {
        startBot().catch(error => {
          reconectando = false
          console.error('❌ Erro ao reconectar:', error.message)
        })
      }, 10000)
    }

    if (
      connection === 'connecting' &&
      config.pairingNumber &&
      !state.creds.registered &&
      !pairingSolicitado
    ) {
      pairingSolicitado = true

      try {
        await new Promise(resolve => setTimeout(resolve, 3000))

        if (state.creds.registered) {
          console.log('✅ Sessão registrada antes do pairing. Nenhum novo código será solicitado.')
          return
        }

        const code = await sock.requestPairingCode(config.pairingNumber)
        console.log('📱 Código de pareamento:', code)
        console.log('⚠️ Use este código uma única vez no WhatsApp.')
      } catch (error) {
        console.error('❌ Erro no código de pareamento:', error.message)
      }
    }
  })
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages[0]
    console.log("TEXTO RECEBIDO:", JSON.stringify(message?.message))
    if (!message?.message || message.key.fromMe) return
    console.log("🔑 KEY:", JSON.stringify(message?.key))
    console.log("🔑 KEY:", JSON.stringify(message?.key))
    const jid = message.key.remoteJid
    const sender = message.key.participantAlt || message.key.participant || jid
    const dbGoldDiario = await getDatabase()
    const goldDiarioAtivo = !jid?.endsWith('@g.us') || dbGoldDiario.data.groups?.[jid]?.goldDailyEnabled !== false
    const recebeuGoldDiario = goldDiarioAtivo ? await darGoldDiario(sender) : false
    if (recebeuGoldDiario) {
      const textoGoldDiario = await aplicarFonteDaConfiguracao(
        `👋 Olá @${sender.split("@")[0]}!\n🪙 Você recebeu 10 Gold pela sua primeira mensagem do dia!`,
        jid
      )

      await sock.sendMessage(jid, {
        text: textoGoldDiario,
        mentions: [sender],
      })
    }
    await registrarAtividade(message, 'mensagem')
    const text = message.message.conversation || message.message.extendedTextMessage?.text || ''

// ANTI-FLOOD
// 4 ou mais mensagens do mesmo usuário em menos de 10 segundos = remoção.
if (jid?.endsWith('@g.us')) {
  try {
    const dbFlood = await getDatabase()
    const configuracaoFlood = dbFlood.data.groups[jid]?.antiflood
    const antifloodAtivo = configuracaoFlood?.enabled === true

    if (antifloodAtivo) {
      const agoraFlood = Date.now()
      const janelaFlood = 10 * 1000
      const limiteFlood = 4

      const participanteLid = message?.key?.participant
      const participanteReal = message?.key?.participantAlt
      const identificadorPrincipal =
        sender ||
        participanteReal ||
        participanteLid

      const normalizarFlood = (id) =>
        String(id || '')
          .split('@')[0]
          .split(':')[0]

      const numeroFlood = normalizarFlood(identificadorPrincipal)

      const ehDonoFlood =
        config.ownerNumbers.includes(numeroFlood)

      const ehAdminFlood =
        await isGroupAdmin(
          sock,
          jid,
          sender,
          message
        )

      console.log(
        `🌊 ANTI-FLOOD: ${numeroFlood} | ` +
        `ativo=${antifloodAtivo} | ` +
        `admin=${ehAdminFlood} | ` +
        `dono=${ehDonoFlood}`
      )

      if (!ehDonoFlood && !ehAdminFlood) {
        const chaveFlood = `${jid}:${numeroFlood}`

        const historicoFlood =
          (antiFloodMap.get(chaveFlood) || [])
            .filter(
              (tempo) =>
                agoraFlood - tempo < janelaFlood
            )

        historicoFlood.push(agoraFlood)
        antiFloodMap.set(chaveFlood, historicoFlood)

        console.log(
          `🌊 ANTI-FLOOD: ${numeroFlood} ` +
          `${historicoFlood.length}/${limiteFlood} mensagens`
        )

        if (historicoFlood.length >= limiteFlood) {
          antiFloodMap.delete(chaveFlood)

          let participanteFlood = null

          try {
            const metadataFlood =
              await sock.groupMetadata(jid)

            participanteFlood =
              (metadataFlood.participants || []).find((p) => {
                const ids = [
                  p.id,
                  p.lid,
                  p.phoneNumber,
                ]
                  .filter(Boolean)
                  .map(String)

                return ids.some(
                  (id) =>
                    normalizarFlood(id) === numeroFlood
                )
              })
          } catch (error) {
            console.error(
              'ERRO AO BUSCAR PARTICIPANTE ANTI-FLOOD:',
              error
            )
          }

          // Para expulsão, prioriza o JID real (@s.whatsapp.net).
          // O participantLid (@lid) pode ser usado para identificar,
          // mas nem sempre é aceito pelo groupParticipantsUpdate().
          const idRemoverFlood =
            participanteFlood?.phoneNumber ||
            participanteReal ||
            participanteFlood?.id ||
            sender

          const idMencaoFlood =
            participanteFlood?.phoneNumber ||
            participanteFlood?.id ||
            participanteReal ||
            participanteLid ||
            sender

          const numeroExibicaoFlood =
            normalizarFlood(
              participanteFlood?.phoneNumber ||
              participanteFlood?.id ||
              participanteReal ||
              participanteLid ||
              sender
            )

          try {
            const textoAntiFlood =
              await aplicarFonteDaConfiguracao(
                `🚨 *ANTI-FLOOD ATIVADO!*\n\n` +
                `👤 Usuário: @${numeroExibicaoFlood}\n` +
                `⚠️ Foram detectadas *4 ou mais mensagens em menos de 10 segundos*.\n` +
                `🔨 Ação: *USUÁRIO REMOVIDO*`,
                jid
              )

            await sock.sendMessage(jid, {
              text: textoAntiFlood,
              mentions: [idMencaoFlood].filter(Boolean),
            })
          } catch (error) {
            console.error(
              'ERRO AO AVISAR ANTI-FLOOD:',
              error
            )
          }

          try {
            await sock.groupParticipantsUpdate(
              jid,
              [idRemoverFlood],
              'remove'
            )

            console.log(
              `🚨 ANTI-FLOOD: usuário ` +
              `${numeroExibicaoFlood} removido de ${jid}`
            )
          } catch (error) {
            console.error(
              'ERRO AO EXPULSAR POR ANTI-FLOOD:',
              error
            )
          }

          return
        }
      }
    }
  } catch (error) {
    console.error(
      'ERRO NO ANTI-FLOOD:',
      error
    )
  }
}

    await registrarAtividade(message, "mensagem")
    if (jid?.endsWith('@g.us')) { const dbMute = await getDatabase(); const muted = dbMute.data.groups[jid]?.muted || {}; if (muted[sender]) { try { await sock.sendMessage(jid, { delete: message.key }); } catch (error) { console.error('ERRO AO APAGAR MENSAGEM MUTADA:', error) } return } }
      if (await estaNaListaNegra(sock, jid, sender, message)) {
        try { await sock.sendMessage(jid, { delete: message.key }) } catch (error) { console.error('ERRO AO APAGAR MENSAGEM DA LISTA NEGRA:', error) }
        return
      }
    if (jid.endsWith("@g.us") && text === "!menuadm") { const meta = await sock.groupMetadata(jid); console.log("👥 PARTICIPANTES:", JSON.stringify(meta.participants)); }
    const db = await getDatabase()
    const prefix = db.data.settings.prefix || config.prefix
    console.log("🔤 TEXTO:", JSON.stringify(text), "PREFIXO:", JSON.stringify(prefix))

    const reply = async (content, options = {}) => {
      const textoComFonte = await aplicarFonteDaConfiguracao(content, jid)
      return sock.sendMessage(
        jid,
        { ...options, text: textoComFonte },
        { quoted: message }
      )
    }

    const contexto = message.message.extendedTextMessage?.contextInfo
    const mencionados = contexto?.mentionedJid || []
    const botJid = sock.user?.id || ''
    const botLid = sock.user?.lid || ''

    const normalizarJid = (id) => String(id || '').split('@')[0].split(':')[0]

    const botFoiMencionado = mencionados.some(id => {
      const a = normalizarJid(id)
      const b = normalizarJid(botJid)
      const c = normalizarJid(botLid)
      return a && (a === b || a === c)
    })

    if (botFoiMencionado) {
      return reply(`🤖 Ei! Não precisa me marcar 😅

Por favor, não marque o bot nos comandos.
Pode usar o comando normalmente sem marcar o bot. ❤️`)
    }

    if (text.trim().toLowerCase() === 'prefixo') {
      return reply(`🔤 O prefixo do bot é: ${prefix}`)
    }

    
    if (jid?.endsWith("@g.us") && text.trim() && !text.startsWith(prefix)) {
      const respondeuJogo = await processarRespostaDeJogo({ message, sender, texto: text, reply })
      if (respondeuJogo) return
    }

    // ===== O QUE É, O QUE É — RESPOSTA DOS GRUPOS =====
    if (jid?.endsWith('@g.us') && text.trim() && !text.startsWith(prefix)) {
      const jogos = globalThis.__wasterOqueEOque || {}
      const jogo = jogos[jid]

      if (jogo?.ativo) {
        const resposta = text
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

        const acertou = (jogo.respostas || []).some(r => {
          const correta = String(r)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

          return resposta === correta
        })

        if (acertou) {
          jogo.ativo = false

          const dbJogo = await getDatabase()
          const vencedor = dbJogo.data.users[sender] || {}
          vencedor.gold = Number(vencedor.gold || 0) + 10
          dbJogo.data.users[sender] = { ...vencedor, jid: sender }
          await dbJogo.write()

          const textoRespostaCerta = await aplicarFonteDaConfiguracao(
            `🎉 *RESPOSTA CERTA!*\n\n` +
            `🏆 @${sender.split('@')[0]} acertou primeiro!\n` +
            `🧠 Resposta: *${jogo.respostas[0]}*\n\n` +
            `🪙 Prêmio: *10 Gold*!\n` +
            `💰 Gold agora: *${vencedor.gold}*`,
            jid
          )

          await sock.sendMessage(jid, {
            text: textoRespostaCerta,
            mentions: [sender],
          })

          delete jogos[jid]
          globalThis.__wasterOqueEOque = jogos
          return
        }
      }
    }

    if (!text.startsWith(prefix)) return

    
    const obterEmojiComando = (comando) => {
      const c = String(comando || '').toLowerCase()

      const categorias = {
        '🔒': [
          'fechargrupo',
          'abrirgrupo',
          'configurar',
          'horariogrupo',
          'cancelarhorario',
          'bemvindo',
          'ativarbemvindo',
          'desativarbemvindo',
          'ativarsaida',
          'desativarsaida',
          'editarregras'
        ],

        '🛡️': [
          'menuadm',
          'adm',
          'admin',
          'expulsar',
          'adicionar',
          'promover',
          'rebaixar',
          'advertir',
          'advertencias',
          'removeradvertencia',
          'mute',
          'desmute',
          'lista_negra',
          'remover_lista_negra',
          'mencionar',
          'reportar',
          'antilink',
          'antipalavra'
        ],

        '💎': [
          'menupremium',
          'premium',
          'alterarnome',
          'alterarnomebot',
          'alterarfoto',
          'ranking',
          'level'
        ],

        '👑': [
          'menudono',
          'donobot',
          'darpremium',
          'removerpremium',
          'dono2',
          'dono3',
          'alterarprefixo',
          'alterarfonte',
          'alterarsaida',
          'fontsaiu',
          'menu1',
          'menu2',
          'menu3',
          'menu4',
          'menu5',
          'menu6',
          'menuoriginal',
          'menupersonalizar',
          'alterargif',
          'listagifs',
          'removergif'
        ],

        '🎮': [
          'ppp',
          'forca',
          'moeda',
          'caracoroa',
          'oqueeoque',
          'jogodavelha',
          'quiz'
        ],

        '😂': [
          'aura',
          'rankgay',
          'adotar',
          'arvore',
          'mentiroso',
          'mentirosa',
          'corno',
          'corna',
          'lindo',
          'linda',
          'feio',
          'feia',
          'casar',
          'abraco',
          'beijo',
          'chute',
          'tapa',
          'travesseirada',
          'calvo',
          'gay',
          'morder',
          'carinho',
          'namorar',
          'terminar',
          'statusrelacionamento',
          'ship',
          'beijar',
          'trair'
        ],

        '🎨': [
          's',
          'sgif',
          'sticker',
          'semvisualizar',
          'toimg',
          'renomearfig'
        ],

        '🔎': [
          'p',
          'instagram',
          'instagrammp3',
          'tiktok',
          'baixar',
          'download'
        ],

        '🎵': [
          'play',
          'playmp4'
        ],

        '👤': [
          'perfil',
          'checkativo',
          'rankingatividade',
          'menuperfil'
        ],

        '💕': [
          'menurelacionamento'
        ],

        '💰': [
          'menugold',
          'addgold',
          'tirargold',
          'setgold',
          'ongolddiario',
          'offgolddiario'
        ]
      }

      for (const [emoji, comandos] of Object.entries(categorias)) {
        if (comandos.includes(c)) return emoji
      }

      if (c.startsWith('menu')) return '📋'

      return null
    }

    const reagirComando = async (comando) => {
      try {
        const emoji = obterEmojiComando(comando)
        if (!emoji || !message?.key?.remoteJid || !message?.key) return

        await sock.sendMessage(
          message.key.remoteJid,
          {
            react: {
              text: emoji,
              key: message.key
            }
          }
        )
      } catch (error) {
        console.error('ERRO AO REAGIR AO COMANDO:', error)
      }
    }

    const comandoCompleto = text.slice(prefix.length).trim()
    const espaco = comandoCompleto.search(/\s/)
    const name = espaco === -1 ? comandoCompleto : comandoCompleto.slice(0, espaco)
    const resto = espaco === -1 ? '' : comandoCompleto.slice(espaco + 1)
    const args = resto.trim() ? resto.trim().split(/\s+/) : []
    await registrarAtividade(message, 'comando')

    const command = commandMap.get(name?.toLowerCase())
    console.log("🔎 COMANDO:", name, "ENCONTRADO:", !!command)

    if (!command) {
      try {
        const enviou = await enviarGifOuImagem({
          sock,
          jid,
          message,
          nome: name?.toLowerCase(),
        })
        if (enviou) return
      } catch (error) {
        console.error('ERRO AO ENVIAR GIF/IMAGEM:', error)
      }
      return
    }

    const cooldownKey = `${sender}:${name.toLowerCase()}`
    const now = Date.now()
    const lastUsed = cooldowns.get(cooldownKey) || 0
    const cooldown = Number(process.env.BOT_COOLDOWN_MS || 0)

    if (now - lastUsed < cooldown) return

    cooldowns.set(cooldownKey, now)
    await saveUser(sender, { lastSeen: new Date().toISOString() })

    try {
      if (name.toLowerCase() === 'setprefix') {
        await setPrefix(args[0] || prefix)
        return reply(`Prefixo atualizado para ${args[0] || prefix}`)
      }

      await reagirComando(name)

      await new Promise(resolve =>
        setTimeout(resolve, Number(process.env.BOT_DELAY_MS || 0))
      )

      await command.execute({
        sock,
        message,
        args,
        textoCompleto: resto,
        sender,
        reply,
      })
    } catch (error) {
      console.error('ERRO AO EXECUTAR COMANDO:', error)
      await reply(`Erro: ${error.message || 'não foi possível executar o comando.'}`)
    }

  })
}

startBot().catch((error) => { console.error(error); process.exit(1) })
