import { config } from '../config.js'
import { getDatabase } from '../database.js'
import { readFile } from 'node:fs/promises'

const aluguelTexto = `🤖 *ALUGUE SEU BOT*

💰 *PLANOS MENSAIS*
1️⃣ *Bot de figurinhas para WhatsApp no Privado*
💵 R$ 4,00/mês
2️⃣ *BOT 0-50 MEMBROS*
💵 R$ 14,00/mês
3️⃣ *BOT 50-300 MEMBROS*
💵 R$ 19,00/mês
4️⃣ *BOT 300-600 MEMBROS*
💵 R$ 24,00/mês
5️⃣ *BOT PERSONALIZADO*
💵 R$ 34,00/mês
6️⃣ *BOT +600 MEMBROS*
💵 R$ 33,00/mês

🎁 *PRIMEIRA ASSINATURA*
Você ganha *+10 dias* de uso.

📲 *Para contratar:*
https://wa.me/31996149100

📞 *Contato:* 31996149100`

const estilos = {

  1: {
    topo: `╭━━━━ ◦ ❖ ◦ ━━━━━╮`,
    topo2: `╰━━━━ ◦ ❖ ◦ ━━━━━╯`,
    linha: `━━━━━━━━━━━━━━━━━━━━`,
    emoji: `🦇`,
    titulo: `WASTER BOT`,
    secao: `✦`,
    final: `╰━━━━━━━━━━━━━━━━━━━━╯`,
  },

  2: {
    topo: `╭─ ୨୧ ───────────────── ୨୧ ─╮`,
    topo2: `╰─ ୨୧ ───────────────── ୨୧ ─╯`,
    linha: `୨୧ ───────────────── ୨୧`,
    emoji: `🦇`,
    titulo: `𝑾𝒂𝒔𝒕𝒆𝒓 𝑩𝒐𝒕`,
    secao: `୨୧`,
    final: `╰─ ୨୧ ───────────────── ୨୧ ─╯`,
  },

  3: {
    topo: `✦ ˚｡⋆ ୨୧ ⋆｡˚ ✦`,
    topo2: `✦ ˚｡⋆ ୨୧ ⋆｡˚ ✦`,
    linha: `✦•┈๑⋅⋯ ⋯⋅๑┈•✦`,
    emoji: `🦇`,
    titulo: `𝑾𝒂𝒔𝒕𝒆𝒓 𝑩𝒐𝒕`,
    secao: `୭˚. ᵎᵎ`,
    final: `✦ ˚｡⋆ ୨୧ ⋆｡˚ ✦`,
  },

  4: {
    topo: `╭━━━◈━━━━━━━━━━━━◈━━━╮`,
    topo2: `╰━━━◈━━━━━━━━━━━━◈━━━╯`,
    linha: `┣━━━━━━━━━━━━━━━━━━━━┫`,
    emoji: `🦇`,
    titulo: `*WASTER BOT*`,
    secao: `┃`,
    final: `╰━━━━━━━━━━━━━━━━━━━━╯`,
  },

  5: {
    topo: `╭━━━━ ◦ ❖ ◦ ━━━━━╮`,
    topo2: `╰━━━━ ◦ ❖ ◦ ━━━━━╯`,
    linha: `🩸━━━━━━━━━━━━━━━━━━━━━━━━━━━🩸`,
    emoji: `🦇`,
    titulo: `Waster Bot`,
    secao: `🩸`,
    final: `🩸━━━━━━━━━━━━━━━━━━━━━━━━🩸`,
  },

  6: {
    topo: `꧁༺━━━━━━━━━━━━━━━━━━━━༻꧂`,
    topo2: `꧁༺━━━━━━━━━━━━━━━━━━━━༻꧂`,
    linha: `꧁༺━━━━━━━━━━━━༻꧂`,
    emoji: `💜🦇`,
    titulo: `𝑾𝑨𝑺𝑻𝑬𝑹 𝑩𝑶𝑻`,
    secao: `༺`,
    final: `꧁༺━━━━━━━━━━━━━━━━━━━━༻꧂`,
  },
}

const categorias = [
  {
    titulo: `🎨 *𝚏𝚒𝚐𝚞𝚛𝚒𝚗𝚑𝚊𝚜*`,
    comandos: [
      's',
      'sgif',
      'semvisualizar',
      'toimg',
      'renomearfig Novo Nome',
    ],
  },
  {
    titulo: `📥 *𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚜*`,
    comandos: [
      'instagram link',
      'instagrammp3 link',
      'tiktok link',
      'tiktokmp4 link',
    ],
  },
  {
    titulo: `🎮 *𝚓𝚘𝚐𝚘𝚜*`,
    comandos: [
      'oqueeoque',
      'caracoroa quantidade',
      'forca',
      'moeda',
      'dado',
      'ppp',
      'jogodavelha',
      'quiz',
      'adivinhar',
      'detetive',
      'maioroumenor',
      'parouimpar',
      'verdadeoudesafio',
      'paises',
      'estados',
      'capitais',
      'bandeiras',
      'futebol',
      'matematica',
      'espaco',
      'conhecimentos',
      'charadas',
      'verdadeiro',
      'jackpot',
      'copadomundo',
      'quemganha',
      'menugold',
    ],
  },
  {
    titulo: `😂 *𝚋𝚛𝚒𝚗𝚌𝚊𝚍𝚎𝚒𝚛𝚊𝚜*`,
    comandos: [
      'aura @pessoa',
      'rankgay',
      'adotar @pessoa tipo',
      'arvore',
      'mentiroso @pessoa',
      'mentirosa @pessoa',
      'corno @pessoa',
      'corna @pessoa',
      'lindo @pessoa',
      'linda @pessoa',
      'feio @pessoa',
      'feia @pessoa',
      'casar @pessoa',
      'abraco @pessoa',
      'beijo @pessoa',
      'chute @pessoa',
      'tapa @pessoa',
      'travesseirada @pessoa',
      'calvo @pessoa',
      'gay @pessoa',
      'morder @pessoa',
      'carinho @pessoa',
    ],
  },
  {
    titulo: `👤 *𝚙𝚎𝚛𝚏𝚒𝚕*`,
    comandos: [
      'perfil',
      'perfil @pessoa',
      'checkativo',
      'rankingatividade',
    ],
  },
  {
    titulo: `💕 *𝚛𝚎𝚕𝚊𝚌𝚒𝚘𝚗𝚊𝚖𝚎𝚗𝚝𝚘*`,
    comandos: [
      'namorar @pessoa',
      'casar @pessoa',
      'ship @pessoa',
      'beijar @pessoa',
      'terminar',
      'statusrelacionamento',
      'trair @pessoa',
    ],
  },
  {
    titulo: `👥 *𝚐𝚛𝚞𝚙𝚘𝚜*`,
    comandos: [
      'linkgrupo',
      'admins',
      'regras',
    ],
  },
  {
    titulo: `🛡️ *𝚊𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊çã𝚘*`,
    comandos: [
      'menuadm',
    ],
  },
  {
    titulo: `👑 *𝚍𝚘𝚗𝚘*`,
    comandos: [
      'menudono',
    ],
  },
  {
    titulo: `💰 *𝚊𝚕𝚞𝚐𝚞𝚎𝚕 𝚍𝚘 𝚋𝚘𝚝*`,
    comandos: [
      'alugarbot',
    ],
  },
  {
    titulo: `🎵 *𝚖ú𝚜𝚒𝚌𝚊*`,
    comandos: [
      'p nome da música',
      'playmp4 nome da música',
    ],
  },
  {
    titulo: `⚙️ *𝚘𝚞𝚝𝚛𝚘𝚜*`,
    comandos: [
      'ping',
    ],
  },
]

function centralizarTitulo(titulo, largura = 28) {
  const texto = String(titulo || '').trim()
  const espacos = Math.max(0, Math.floor((largura - texto.length) / 2))
  return `${' '.repeat(espacos)}${texto}`
}
function normalizarLinha(personalizado, estilo) {
  if (personalizado?.linhasMenu?.[estilo]) {
    return personalizado.linhasMenu[estilo]
  }
  if (personalizado?.linhaMenu) {
    return personalizado.linhaMenu
  }
  return estilos[estilo].linha
}

function montarSecao(visual, titulo, comandos, p) {
  const linhas = comandos.map(item => {
    const texto = String(item || '').trim()
    const partes = texto.match(/^(\S+)\s+(?:𐙚|⟡|➜|✧)\s+(.+)$/)

    if (partes) {
      return `${partes[1]} ${p}${partes[2]}`
    }

    return `▸ ${p}${texto}`
  }).join('\n')

  return `${visual.secao} ${centralizarTitulo(titulo)}\n${linhas}`
}


export function montarMenu(estilo, personalizado, nome, hora, p) {
  const visual = estilos[Number(estilo)] || estilos[1]
  const linha = normalizarLinha(personalizado, estilo)
  const botNome = personalizado?.botName || config.botName || 'Waster Bot'
  const site1 = personalizado?.site1 || 'wasterbot.site'
  const site2 = personalizado?.site2 || 'lojawaster.shop'
  const emoji = personalizado?.emojisMenu?.[estilo] || visual.emoji

  const partes = []

  partes.push(visual.topo)
  partes.push(`${emoji} ${botNome} ${emoji}`)
  partes.push(visual.topo2)
  partes.push(`🌐 Site: ${site1}`)
  partes.push(`🌐 Site: ${site2}`)
  partes.push('')
  partes.push(`- 🌙 Boa noite ${nome}, são ${hora}`)
  partes.push('')
  partes.push(linha)

  for (const categoria of categorias) {
    partes.push('')
    partes.push(montarSecao(
      visual,
      categoria.titulo,
      categoria.comandos,
      p
    ))
  }

  partes.push('')
  partes.push(linha)
  partes.push('')
  partes.push(`> Digite ${p}alugarbot para ver os planos de aluguel.`)
  partes.push(visual.final)

  return partes.join('\n')
}

export function aplicarFonteMenu(texto, fonte) {
  const valor = String(texto || '')

  const mapas = {
    normal: {},
    negrito: {
      'a': '𝗮','b': '𝗯','c': '𝗰','d': '𝗱','e': '𝗲','f': '𝗳','g': '𝗴',
      'h': '𝗵','i': '𝗶','j': '𝗷','k': '𝗸','l': '𝗹','m': '𝗺','n': '𝗻',
      'o': '𝗼','p': '𝗽','q': '𝗾','r': '𝗿','s': '𝘀','t': '𝘁','u': '𝘂',
      'v': '𝘃','w': '𝘄','x': '𝘅','y': '𝘆','z': '𝘇',
      'A': '𝗔','B': '𝗕','C': '𝗖','D': '𝗗','E': '𝗘','F': '𝗙','G': '𝗚',
      'H': '𝗛','I': '𝗜','J': '𝗝','K': '𝗞','L': '𝗟','M': '𝗠','N': '𝗡',
      'O': '𝗢','P': '𝗣','Q': '𝗤','R': '𝗥','S': '𝗦','T': '𝗧','U': '𝗨',
      'V': '𝗩','W': '𝗪','X': '𝗫','Y': '𝗬','Z': '𝗭'
    },
    dupla: {
      'a':'𝕒','b':'𝕓','c':'𝕔','d':'𝕕','e':'𝕖','f':'𝕗','g':'𝕘','h':'𝕙',
      'i':'𝕚','j':'𝕛','k':'𝕜','l':'𝕝','m':'𝕞','n':'𝕟','o':'𝕠','p':'𝕡',
      'q':'𝕢','r':'𝕣','s':'𝕤','t':'𝕥','u':'𝕦','v':'𝕧','w':'𝕨','x':'𝕩',
      'y':'𝕪','z':'𝕫',
      'A':'𝔸','B':'𝔹','C':'ℂ','D':'𝔻','E':'𝔼','F':'𝔽','G':'𝔾','H':'ℍ',
      'I':'𝕀','J':'𝕁','K':'𝕂','L':'𝕃','M':'𝕄','N':'ℕ','O':'𝕆','P':'ℙ',
      'Q':'ℚ','R':'ℝ','S':'𝕊','T':'𝕋','U':'𝕌','V':'𝕍','W':'𝕎','X':'𝕏',
      'Y':'𝕐','Z':'ℤ'
    },
    monospace: {
      'a':'𝚊','b':'𝚋','c':'𝚌','d':'𝚍','e':'𝚎','f':'𝚏','g':'𝚐','h':'𝚑',
      'i':'𝚒','j':'𝚓','k':'𝚔','l':'𝚕','m':'𝚖','n':'𝚗','o':'𝚘','p':'𝚙',
      'q':'𝚚','r':'𝚛','s':'𝚜','t':'𝚝','u':'𝚞','v':'𝚟','w':'𝚠','x':'𝚡',
      'y':'𝚢','z':'𝚣'
    }
  }

  const mapa = mapas[fonte] || mapas.normal
  if (!Object.keys(mapa).length) return valor

  return [...valor].map(c => mapa[c] || mapa[c.toLowerCase()] || c).join('')
}

export function aplicarEstiloPrivado(texto, estilo) {
  const valor = String(texto || '').trim()
  if (!valor) return valor

  const molduras = {
    1: ['╭━━━━ ◦ ❖ ◦ ━━━━━╮', '╰━━━━ ◦ ❖ ◦ ━━━━━╯'],
    2: ['🩸━━━━━━━━━━━━━━━━━━━━━━━━🩸', '🩸━━━━━━━━━━━━━━━━━━━━━━━━🩸'],
    3: ['╭━━━◈━━━━━━━━━━━━◈━━━╮', '╰━━━◈━━━━━━━━━━━━◈━━━╯'],
    4: ['✦ ˚｡⋆ ୨୧ ⋆｡˚ ✦', '✦ ˚｡⋆ ୨୧ ⋆｡˚ ✦'],
    5: ['╭─ ୨୧ ───────────────── ୨୧ ─╮', '╰─ ୨୧ ───────────────── ୨୧ ─╯'],
    6: ['꧁༺━━━━━━━━━━━━━━━━━━━━༻꧂', '꧁༺━━━━━━━━━━━━━━━━━━━━༻꧂'],
  }

  const [topo, final] = molduras[estilo] || molduras[1]

  const linhas = valor.split('\n').filter((linha, indice, lista) => {
    if (indice === 0 || indice === lista.length - 1) return true
    return true
  })

  // Se o próprio menu já começa/termina com a moldura escolhida,
  // não duplica a moldura.
  const jaTemTopo = linhas[0] === topo
  const jaTemFinal = linhas[linhas.length - 1] === final

  if (jaTemTopo && jaTemFinal) return linhas.join('\n')
  if (jaTemTopo) return `${linhas.join('\n')}\n${final}`
  if (jaTemFinal) return `${topo}\n${linhas.join('\n')}`

  return `${topo}\n${linhas.join('\n')}\n${final}`
}


export function montarMenuPrivado(tipo, estilo, p, personalizado = {}) {
  const visual = estilos[Number(estilo)] || estilos[1]

  const secao = (titulo, comandos) => {
    const linhas = comandos.map((comando, i) => {
      const ultimo = i === comandos.length - 1
      return `│  ${ultimo ? '└─›' : '├─›'} ${p}${comando}`
    }).join('\n')

    return [
      `╭──────── ${titulo} ────────╮`,
      '│',
      linhas,
      '│',
      '╰──────────────────────────╯',
    ].join('\n')
  }

  if (tipo === 'adm') {
    return [
      '╭━━━━━━「 🛡️ ADMIN 」━━━━━━╮',
      '',
      '🪙 *GERENCIAMENTO DE GOLD*',
      `▸ ${p}addgold @usuário quantidade`,
      `▸ ${p}tirargold @usuário quantidade`,
      `▸ ${p}setgold @usuário quantidade`,
      `▸ ${p}loja`,
      `▸ ${p}ongolddiario`,
      `▸ ${p}offgolddiario`,
      '',
      '👥 *MEMBROS*',
      `▸ ${p}expulsar @usuário`,
      `▸ ${p}adicionar 5511999999999`,
      `▸ ${p}promover @usuário`,
      `▸ ${p}rebaixar @usuário`,
      '',
      '⚠️ *ADVERTÊNCIAS*',
      `▸ ${p}advertir @usuário motivo`,
      `▸ ${p}advertencias @usuário`,
      `▸ ${p}removeradvertencia @usuário`,
      '',
      '🔇 *CONTROLE DE CHAT*',
      `▸ ${p}mute @usuário`,
      `▸ ${p}desmute @usuário`,
      `▸ ${p}lista_negra @usuário`,
      `▸ ${p}remover_lista_negra @usuário`,
      `▸ ${p}mencionar`,
      `▸ ${p}reportar`,
      `▸ ${p}removerreportar`,
      `▸ ${p}todos`,
      '',
      '⚙️ *CONFIGURAÇÕES DO GRUPO*',
      `▸ ${p}configurar`,
      `▸ ${p}horariogrupo`,
      `▸ ${p}cancelarhorario`,
      `▸ ${p}fechargrupo`,
      `▸ ${p}abrirgrupo`,
      `▸ ${p}mensagemauto`,
      `▸ ${p}bemvindo`,
      `▸ ${p}editarregras <novas regras>`,
      `▸ ${p}ativarbemvindo`,
      `▸ ${p}desativarbemvindo`,
      '',
      '⚠️ *IMPORTANTE*',
      'Os comandos de administração exigem que o usuário',
      'seja administrador do grupo e, quando necessário,',
      'que o bot também seja administrador.',
      '',
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    ].join('\n')
  }

  const secoes = {
    adm: [
      ['🪙 GERENCIAMENTO DE GOLD', [
        'addgold @usuário quantidade',
        'tirargold @usuário quantidade',
        'setgold @usuário quantidade',
        'loja',
        'ongolddiario',
        'offgolddiario',
      ]],
      ['👥 MEMBROS', [
        'expulsar @usuário',
        'adicionar 5511999999999',
        'promover @usuário',
        'rebaixar @usuário',
      ]],
      ['⚠️ ADVERTÊNCIAS', [
        'advertir @usuário motivo',
        'advertencias @usuário',
        'removeradvertencia @usuário',
      ]],
      ['🔇 CONTROLE DE CHAT', [
        'mute @usuário',
        'desmute @usuário',
        'lista_negra @usuário',
        'remover_lista_negra @usuário',
        'mencionar',
        'reportar',
        'removerreportar',
        'todos',
      ]],
      ['⚙️ CONFIGURAÇÕES DO GRUPO', [
        'configurar',
        'horariogrupo',
        'cancelarhorario',
        'fechargrupo',
        'abrirgrupo',
        'mensagemauto',
        'bemvindo',
        'editarregras <novas regras>',
        'ativarbemvindo',
        'desativarbemvindo',
        'antilink',
        'antipalavra',
      ]],
    ],
    premium: [],
    dono: [
      ['👑 ADMINISTRAÇÃO DO BOT', [
      ]],
      ['👑 PERMISSÕES', [
        'dono2 @ADM',
        'dono3 @ADM',
      ]],
      ['🎮 FREE FIRE', [
        'patenteff @pessoa',
        'addpatenteff nome da patente',
        'configpatenteff',
        'fontbemvindo serif',
        'fontbemvindo normal',
        'fontsaiu serif',
        'fontsaiu normal',
      ]],
      ['⚙️ CONFIGURAÇÕES DO BOT', [
        'alterarprefixo novo',
        'alterarfonte nome da fonte',
        'alterarsaida sua mensagem',
        'fontsaiu serif',
        'fontsaiu normal',
      ]],
      ['🎨 PERSONALIZAÇÃO DO MENU', [
        'menu1',
        'menu2',
        'menu3',
        'menu4',
        'menu5',
        'menu6',
        'menuoriginal',
        'personalizar texto',
        'personalizar site texto',
        'personalizar emoji texto',
        'personalizar siteemoji emoji',
        'personalizar remover site',
        'editaremoji',
        'editarmenu',
        'mudarmenu1 linha',
        'mudarmenu2 linha',
        'mudarmenu3 linha',
        'mudarmenu4 linha',
        'mudarmenu5 linha',
        'mudarmenu6 linha',
      ]],
      ['📁 GIFS E IMAGENS', [
        'alterargif nome',
        'listagifs',
        'removergif nome',
      ]],
      ['🤖 BOT', [
        'alterarnome',
        'alterarfoto',
      ]],
      ['💰 ALUGUEL', [
        'alugarbot',
      ]],
    ],
  }

  const blocos = secoes[tipo] || []

  return [
    visual.topo,
    `${visual.emoji} ${personalizado.botName || visual.titulo} ${visual.emoji}`,
    visual.topo2,
    '',
    ...blocos.flatMap(([titulo, comandos]) => [secao(titulo, comandos), '']),
    visual.final,
  ].join('\n')
}

export async function formatarMenuPrivado(texto, groupJid) {
  let fonte = 'normal'

  if (groupJid?.endsWith('@g.us')) {
    const db = await getDatabase()
    const personalizado = db.data.groups[groupJid]?.menu || {}
    fonte = personalizado.fonte || 'normal'
  }

  return aplicarFonteMenu(texto, fonte)
}

export function obterEstilo(db, groupJid) {
  const valor = Number(db.data.groups[groupJid]?.menu?.estilo || 1)

  if (valor < 1 || valor > 6) {
    return 1
  }

  return valor
}

export const menuCommand = {
  name: 'menu',
  aliases: ['help', 'comandos'],

  description: 'Exibe o menu principal.',

  async execute({ reply, message, sock }) {
    const p = config.prefix
    const nome = message.pushName || 'usuário'

    const hora = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })

    const db = await getDatabase()
    const groupJid = message.key.remoteJid

    const personalizado = groupJid?.endsWith('@g.us')
      ? (db.data.groups[groupJid]?.menu || {})
      : {}

    const estilo = groupJid?.endsWith('@g.us')
      ? obterEstilo(db, groupJid)
      : 1

    const menuPersonalizado = personalizado?.menusPersonalizados?.[`menu${estilo}`]

    const textoBase = menuPersonalizado
      ? menuPersonalizado
      : montarMenu(
          estilo,
          personalizado,
          nome,
          hora,
          p
        )

    const texto = aplicarFonteMenu(
      textoBase,
      personalizado?.fonte || 'normal'
    )

    if (personalizado.photo) {
      try {
        const foto = await readFile(personalizado.photo)

        await sock.sendMessage(
          message.key.remoteJid,
          {
            image: foto,
            caption: texto,
          },
          { quoted: message }
        )

        return
      } catch (error) {
        console.error('ERRO AO ENVIAR FOTO DO MENU:', error)
      }
    }

    await reply(texto)
  },
}

async function salvarEstilo(groupJid, estilo) {
  const db = await getDatabase()

  db.data.groups[groupJid] ||= {}
  db.data.groups[groupJid].menu ||= {}
  db.data.groups[groupJid].menu.estilo = Number(estilo)

  await db.write()
}

function criarComandoEstilo(numero) {
  return {
    name: `menu${numero}`,

    aliases: [],

    description: `Seleciona o Menu ${numero} neste grupo.`,

    async execute({ reply, message }) {
      const groupJid = message?.key?.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      await salvarEstilo(groupJid, numero)

      return reply(
        `✅ *MENU ${numero} ATIVADO NESTE GRUPO!*\n\n` +
        `Agora este grupo usará o estilo ${numero} sempre que alguém usar ${config.prefix}menu.`
      )
    },
  }
}

export const menu1Command = criarComandoEstilo(1)

export const menuoriginalCommand = {
  name: 'menuoriginal',
  aliases: [],
  description: 'Volta este grupo para o Menu 1 original.',
  async execute({ reply, message }) {
    const groupJid = message?.key?.remoteJid
    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }
    const db = await getDatabase()

    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].menu ||= {}
    delete db.data.groups[groupJid].menu.menusPersonalizados

    await salvarEstilo(groupJid, 1)
    await db.write()

    return reply(
      `✅ *MENU ORIGINAL RESTAURADO!*\n\n` +
      `Este grupo voltou a usar o Menu 1 original.`
    )
  },
}
export const menu2Command = criarComandoEstilo(2)
export const menu3Command = criarComandoEstilo(3)
export const menu4Command = criarComandoEstilo(4)
export const menu5Command = criarComandoEstilo(5)
export const menu6Command = criarComandoEstilo(6)

function criarComandoLinha(numero) {
  return {
    name: `mudarmenu${numero}`,

    aliases: [],

    description: `Altera a linha decorativa do Menu ${numero}.`,

    async execute({ reply, message, args, textoCompleto }) {
      const groupJid = message?.key?.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      const db = await getDatabase()

      db.data.groups[groupJid] ||= {}
      db.data.groups[groupJid].menu ||= {}

      const atual = obterEstilo(db, groupJid)

      if (atual !== numero) {
        return reply(
          `❌ Este grupo está usando o *Menu ${atual}*.\n\n` +
          `Para alterar o Menu ${numero}, primeiro use:\n` +
          `▸ ${config.prefix}menu${numero}`
        )
      }

      const linha = String(textoCompleto || '').trim()

      if (!linha) {
        return reply(
          `❌ Envie a linha depois do comando.\n\n` +
          `Exemplo:\n` +
          `${config.prefix}mudarmenu${numero} ═══════════════`
        )
      }

      if (linha.length > 300) {
        return reply('❌ A linha é muito grande. Use no máximo 300 caracteres.')
      }

      db.data.groups[groupJid].menu.linhasMenu ||= {}
      db.data.groups[groupJid].menu.linhasMenu[numero] = linha

      await db.write()

      return reply(
        `✅ *LINHA DO MENU ${numero} ALTERADA!*\n\n` +
        `${linha}\n\n` +
        `A alteração vale somente para este grupo.`
      )
    },
  }
}

export const mudarMenu1Command = criarComandoLinha(1)
export const mudarMenu2Command = criarComandoLinha(2)
export const mudarMenu3Command = criarComandoLinha(3)
export const mudarMenu4Command = criarComandoLinha(4)
export const mudarMenu5Command = criarComandoLinha(5)
export const mudarMenu6Command = criarComandoLinha(6)

export const editarEmojiCommand = {
  name: 'editaremoji',
  aliases: ['editarmenu', 'salvarmenu'],
  description: 'Salva uma versão editada do menu respondendo à mensagem.',
  async execute({ reply, message }) {
    const groupJid = message?.key?.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    const contexto =
      message?.message?.extendedTextMessage?.contextInfo

    const citado = contexto?.quotedMessage

    if (!citado) {
      return reply(
        `❌ Responda à mensagem do menu que deseja editar.\n\n` +
        `Exemplo:\n` +
        `${config.prefix}editarmenu`
      )
    }

    const texto =
      citado?.conversation ||
      citado?.extendedTextMessage?.text ||
      citado?.imageMessage?.caption ||
      citado?.videoMessage?.caption ||
      ''

    const conteudo = String(texto || '').trim()

    if (!conteudo) {
      return reply(
        '❌ Não consegui encontrar o texto do menu na mensagem respondida.'
      )
    }

    if (conteudo.length > 15000) {
      return reply('❌ O menu editado ficou muito grande. Limite: 15000 caracteres.')
    }

    const db = await getDatabase()

    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].menu ||= {}
    db.data.groups[groupJid].menu.menusPersonalizados ||= {}

    // Salva somente neste grupo.
    // O estilo escolhido continua separado em menu.estilo.
    const estiloAtual = obterEstilo(db, groupJid)

    db.data.groups[groupJid].menu.menusPersonalizados[`menu${estiloAtual}`] = conteudo

    await db.write()

    return reply(
      `✅ *MENU EDITADO E SALVO!*\n\n` +
      `📌 Foi salvo somente neste grupo.\n` +
      `🎨 Emojis, símbolos, linhas e textos foram preservados.\n\n` +
      `Para voltar ao menu padrão escolhido pelo grupo, use:\n` +
      `▸ ${config.prefix}menuoriginal`
    )
  },
}




async function salvarMenuPersonalizado(tipo, reply, message) {
  const groupJid = message?.key?.remoteJid

  if (!groupJid?.endsWith('@g.us')) {
    return reply('❌ Este comando só pode ser usado em grupos.')
  }

  const citado = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage

  if (!citado) {
    return reply('❌ Responda ao menu que deseja editar.')
  }

  const texto =
    citado?.conversation ||
    citado?.extendedTextMessage?.text ||
    citado?.imageMessage?.caption ||
    ''

  const conteudo = String(texto || '').trim()

  if (!conteudo) {
    return reply('❌ Não encontrei o texto do menu.')
  }

  const db = await getDatabase()

  db.data.groups[groupJid] ||= {}
  db.data.groups[groupJid].menu ||= {}
  db.data.groups[groupJid].menu.menusPersonalizados ||= {}

  db.data.groups[groupJid].menu.menusPersonalizados[tipo] = conteudo

  await db.write()

  return reply(`✅ MENU ${tipo.toUpperCase()} EDITADO E SALVO!`)
}


export const editarMenuAdmCommand = {
  name: 'editarmenuadm',
  aliases: [],
  description: 'Edita menu de administrador.',
  async execute({ reply, message }) {
    return salvarMenuPersonalizado('adm', reply, message)
  },
}

export const editarMenuDonoCommand = {
  name: 'editarmenudono',
  aliases: [],
  description: 'Edita menu dono.',
  async execute({ reply, message }) {
    return salvarMenuPersonalizado('dono', reply, message)
  },
}



export const aluguelBotCommand = {
  name: 'alugarbot',

  aliases: ['aluguelbot', 'planosbot', 'planos'],

  description: 'Exibe os planos de aluguel do bot.',

  async execute({ reply }) {
    return reply(aluguelTexto)
  },
}
