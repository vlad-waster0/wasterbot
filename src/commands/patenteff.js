import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { getDatabase } from '../database.js'
import { config } from '../config.js'

const pastaPatentes = './data/patentesff'

function ehDono(sender, message) {
  const ids=[sender,message?.key?.participant,message?.key?.participantAlt].filter(Boolean).map(x=>x.split('@')[0])
  return ids.some(id=>config.ownerNumbers.includes(id))
}

const patentesPadrao = [
  'Bronze I',
  'Bronze II',
  'Bronze III',
  'Prata I',
  'Prata II',
  'Prata III',
  'Ouro I',
  'Ouro II',
  'Ouro III',
  'Ouro IV',
  'Platina I',
  'Platina II',
  'Platina III',
  'Platina IV',
  'Diamante I',
  'Diamante II',
  'Diamante III',
  'Diamante IV',
  'Mestre',
  'Desafiante'
]

const frasesPadrao = {
  'Bronze I': [
    '😂 Começou agora? Até o chão tá te dando capa!',
    '🤣 Essa patente aí pede um tutorial urgente!',
    '💀 O inimigo viu a patente e já ficou tranquilo.'
  ],
  'Bronze II': [
    '😂 Subiu um pouquinho, mas ainda tem muito chão!',
    '🤣 O lobby ainda está te conhecendo.',
    '💀 Calma, um dia chega no Ouro!'
  ],
  'Bronze III': [
    '😂 Já está quase saindo do sofrimento!',
    '🤣 Mais alguns passos e você deixa o Bronze para trás.',
    '🔥 Pelo menos está evoluindo!'
  ],
  'Prata I': [
    '😂 Saiu do Bronze, já pode comemorar!',
    '🤣 Agora começou a caminhada de verdade.',
    '🔥 Está melhorando!'
  ],
  'Prata II': [
    '😎 Já está pegando experiência!',
    '😂 Ainda não é assustador, mas está chegando.',
    '🔥 Continua que sobe!'
  ],
  'Prata III': [
    '🔥 Está quase pronto para o próximo nível!',
    '😎 A evolução está acontecendo.',
    '😂 O lobby já começou a prestar atenção.'
  ],
  'Ouro I': [
    '😎 Agora começou a ficar interessante!',
    '🔥 Ouro na conta, respeito chegando.',
    '😂 Já não dá mais para chamar de iniciante!'
  ],
  'Ouro II': [
    '😎 Está ficando perigoso!',
    '🔥 Essa patente já merece respeito.',
    '😂 O lobby começou a ficar nervoso.'
  ],
  'Ouro III': [
    '🔥 Tá subindo bonito!',
    '😎 Jogador de respeito!',
    '😂 Mais um pouco e o sofrimento aumenta!'
  ],
  'Ouro IV': [
    '🔥 Ouro IV! Está quase mudando de nível.',
    '😎 Agora o negócio ficou sério.',
    '😂 A próxima patente já está chamando!'
  ],
  'Platina I': [
    '😎 Agora sim começou a aparecer habilidade!',
    '🔥 Platina na conta, respeito!',
    '😂 O lobby já pensa duas vezes antes de rushar.'
  ],
  'Platina II': [
    '🔥 Está ficando forte!',
    '😎 Essa patente já impõe respeito.',
    '😂 O inimigo viu a patente e pensou duas vezes.'
  ],
  'Platina III': [
    '😎 Quase chegando no topo!',
    '🔥 Está jogando sério agora.',
    '😂 Mais um pouco e o lobby pede arrego!'
  ],
  'Platina IV': [
    '🔥 Platina IV! Tá chegando!',
    '😎 Alto nível de respeito.',
    '😂 O próximo passo já é coisa séria!'
  ],
  'Diamante I': [
    '💎 Diamante! Agora tem que respeitar.',
    '😎 Patente bonita dessa, só capa!',
    '🔥 O lobby ficou pequeno!'
  ],
  'Diamante II': [
    '💎 Diamante II! Jogador diferenciado.',
    '😎 Essa patente fala por si.',
    '🔥 Agora o inimigo vai precisar de sorte!'
  ],
  'Diamante III': [
    '💎 Diamante III! Tá voando!',
    '😎 Nível alto demais!',
    '🔥 Só os brabos chegam aqui.'
  ],
  'Diamante IV': [
    '💎 Diamante IV! Respeita o homem!',
    '😎 Tá quase no topo!',
    '🔥 Essa patente não é para qualquer um.'
  ],
  'Mestre': [
    '👑 MESTRE! Agora é outro nível.',
    '😎 Respeita que chegou no Mestre!',
    '🔥 Patente de quem joga sério!'
  ],
  'Desafiante': [
    '👑 ELITE! Poucos chegam aqui.',
    '😎 Nível absurdo! Respeita.',
    '🔥 O lobby inteiro já conhece essa patente!'
  ]
}

function obterMencao(message) {
  const mencionados =
    message?.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    message?.message?.imageMessage?.contextInfo?.mentionedJid ||
    []

  return mencionados[0] || null
}

function nomeArquivo(patente) {
  return patente
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

async function obterConfiguracao(db) {
  db.data.settings ||= {}
  db.data.settings.patentesff ||= {}

  for (const patente of patentesPadrao) {
    if (!db.data.settings.patentesff[patente]) {
      db.data.settings.patentesff[patente] = {
        frases: frasesPadrao[patente] || ['🔥 Mandou bem!'],
        arquivo: null
      }
    }
  }

  await db.write()
  return db.data.settings.patentesff
}

export const patenteFFCommands = [
  {
    name: 'patenteff',
    aliases: ['patente', 'rankff'],
    description: 'Sorteia uma patente do Free Fire.',
    async execute({ sock, message, reply, sender }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      const alvo = obterMencao(message) || sender

      if (!alvo) {
        return reply(`🎮 *PATENTE FREE FIRE*

Use o comando sozinho para ver sua própria patente ou marque uma pessoa para sortear a patente dela.

Exemplo:
${config.prefix}patenteff @pessoa`)
      }

      const db = await getDatabase()
      const configuracoes = await obterConfiguracao(db)

      const patente = patentesPadrao[Math.floor(Math.random() * patentesPadrao.length)]
      const configuracao = configuracoes[patente]

      const frases = configuracao?.frases?.length
        ? configuracao.frases
        : frasesPadrao[patente] || ['🔥 Mandou bem!']

      const frase = frases[Math.floor(Math.random() * frases.length)]
      const arquivo = join(pastaPatentes, configuracao?.arquivo || `${nomeArquivo(patente)}.jpg`)

      let imagem

      try {
        imagem = await readFile(arquivo)
      } catch {
        return reply(`🎮 *PATENTE FREE FIRE*

👤 Jogador: @${alvo.split('@')[0]}
🏆 Patente sorteada: *${patente}*

${frase}

⚠️ A imagem desta patente ainda não foi cadastrada pelo dono do bot.`)
      }

      return sock.sendMessage(groupJid, {
        image: imagem,
        caption:
          `🎮 *PATENTE FREE FIRE*\n\n` +
          `👤 Jogador: @${alvo.split('@')[0]}\n` +
          `🏆 Patente: *${patente}*\n\n` +
          `${frase}`,
        mentions: [alvo]
      })
    }
  },

  {
    name: 'addpatenteff',
    aliases: ['cadastrarpattenteff'],
    description: 'Cadastra uma imagem de patente do Free Fire.',
    async execute({ sock, message, reply, sender, args }) {
      const grupo = message.key.remoteJid

      if (!config.ownerNumbers.includes(sender.split('@')[0])) {
        return reply('❌ Apenas o dono principal pode cadastrar as imagens das patentes.')
      }

      const patente = args?.join(' ').trim()

      if (!patente) {
        return reply(`❌ Informe o nome da patente.

Exemplo:
${config.prefix}addpatenteff Diamante I

Depois, responda uma imagem da patente com esse comando.`)
      }

      const encontrada = patentesPadrao.find(
        item => item.toLowerCase() === patente.toLowerCase()
      )

      if (!encontrada) {
        return reply(`❌ Patente não encontrada.

Patentes disponíveis:
${patentesPadrao.join('\n')}`)
      }

      const contexto = message?.message?.extendedTextMessage?.contextInfo
      const quoted = contexto?.quotedMessage

      if (!quoted?.imageMessage) {
        return reply(`❌ Responda uma *imagem* da patente com:

${config.prefix}addpatenteff ${encontrada}`)
      }

      try {
        await mkdir(pastaPatentes, { recursive: true })

        const buffer = await downloadMediaMessage(
          {
            message: quoted,
            key: {
              remoteJid: grupo,
              id: contexto.stanzaId,
              participant: contexto.participant
            }
          },
          'buffer',
          {},
          {}
        )

        const arquivo = `${nomeArquivo(encontrada)}.jpg`
        await writeFile(join(pastaPatentes, arquivo), buffer)

        const db = await getDatabase()
        const configuracoes = await obterConfiguracao(db)

        configuracoes[encontrada].arquivo = arquivo
        await db.write()

        return reply(`✅ *PATENTE CADASTRADA!*

🏆 Patente: *${encontrada}*
🖼️ Imagem salva com sucesso.

Agora o ${config.prefix}patenteff poderá enviar esta imagem quando ela for sorteada.`)
      } catch (error) {
        console.error('ERRO AO CADASTRAR PATENTE FF:', error)
        return reply('❌ Não foi possível salvar a imagem da patente.')
      }
    }
  }
]

export const configPatenteFFCommand = {
  name: 'configpatenteff',
  aliases: ['configff', 'editarpatenteff'],
  description: 'Configura as patentes do Free Fire.',
  async execute({ reply, sender }) {
    const numero = sender.split('@')[0]

    if (!config.ownerNumbers.includes(numero)) {
      return reply('❌ Apenas o dono principal pode configurar as patentes do Free Fire.')
    }

    const db = await getDatabase()
    const configuracoes = await obterConfiguracao(db)

    const linhas = patentesPadrao.map((patente, index) => {
      const cfg = configuracoes[patente]
      const nome = cfg?.nome || patente
      const frases = cfg?.frases?.length || 0
      const imagem = cfg?.arquivo ? '🖼️' : '❌'
      return `${index + 1}. ${imagem} *${nome}* — 💬 ${frases} frases`
    })

    return reply(`╭━━━━━━「 🎮 FREE FIRE 」━━━━━━╮

⚙️ *CONFIGURAÇÃO DAS PATENTES*

${linhas.join('\n')}

🖼️ *CADASTRAR/TROCAR IMAGEM*
▸ ${config.prefix}addpatenteff Diamante I
↳ Responda a imagem da patente.

✏️ *ALTERAR NOME*
▸ ${config.prefix}renomearpatenteff Diamante I | Diamante 1

💬 *ADICIONAR FRASE*
▸ ${config.prefix}addfrasepatenteff Diamante I | Sua frase aqui

🖼️ *REMOVER IMAGEM*
▸ ${config.prefix}removerpatenteff Diamante I
↳ Remove a imagem cadastrada da patente.

🗑️ *REMOVER FRASE*
▸ ${config.prefix}removerfrasepatenteff Diamante I | 1

📋 Use ${config.prefix}configpatenteff para
visualizar novamente esta configuração.

╰━━━━━━━━━━━━━━━━━━━━━━╯`)
  },
}

export const edicaoPatenteFFCommands = [
  {
    name: 'renomearpatenteff',
    aliases: ['nomepatenteff', 'editarnomepatenteff'],
    description: 'Altera o nome de uma patente.',
    async execute({ reply, sender, args }) {
      const numero = sender.split('@')[0]

      if (!config.ownerNumbers.includes(numero)) {
        return reply('❌ Apenas o dono principal pode alterar as patentes.')
      }

      const texto = args?.join(' ').trim() || ''
      const partes = texto.split('|').map(item => item.trim())

      if (partes.length < 2 || !partes[0] || !partes[1]) {
        return reply(`❌ Formato inválido.

Use:
${config.prefix}renomearpatenteff Diamante I | Diamante 1`)
      }

      const patente = patentesPadrao.find(
        item => item.toLowerCase() === partes[0].toLowerCase()
      )

      if (!patente) {
        return reply('❌ Patente não encontrada. Use o nome original da patente.')
      }

      const novoNome = partes[1]

      const db = await getDatabase()
      const configuracoes = await obterConfiguracao(db)

      configuracoes[patente].nome = novoNome
      db.data.settings.patentesff = configuracoes
      await db.write()

      return reply(`✅ *NOME DA PATENTE ALTERADO!*

🎮 Patente original: *${patente}*
✏️ Novo nome: *${novoNome}*`)
    },
  },

  {
    name: 'addfrasepatenteff',
    aliases: ['adicionarfrasepatenteff', 'frasepatenteff'],
    description: 'Adiciona uma frase a uma patente.',
    async execute({ reply, sender, args }) {
      const numero = sender.split('@')[0]

      if (!config.ownerNumbers.includes(numero)) {
        return reply('❌ Apenas o dono principal pode alterar as frases.')
      }

      const texto = args?.join(' ').trim() || ''
      const partes = texto.split('|').map(item => item.trim())

      if (partes.length < 2 || !partes[0] || !partes[1]) {
        return reply(`❌ Formato inválido.

Use:
${config.prefix}addfrasepatenteff Diamante I | Essa patente aí merece respeito 😎`)
      }

      const patente = patentesPadrao.find(
        item => item.toLowerCase() === partes[0].toLowerCase()
      )

      if (!patente) {
        return reply('❌ Patente não encontrada.')
      }

      const frase = partes.slice(1).join(' | ')

      const db = await getDatabase()
      const configuracoes = await obterConfiguracao(db)

      configuracoes[patente].frases ||= []
      configuracoes[patente].frases.push(frase)

      db.data.settings.patentesff = configuracoes
      await db.write()

      return reply(`✅ *FRASE ADICIONADA!*

🎮 Patente: *${configuracoes[patente].nome || patente}*
💬 Frase: _${frase}_
📊 Total de frases: *${configuracoes[patente].frases.length}*`)
    },
  },

  {
    name: 'removerfrasepatenteff',
    aliases: ['delfrasepatenteff', 'excluirfrasepatenteff'],
    description: 'Remove uma frase de uma patente.',
    async execute({ reply, sender, args }) {
      const numero = sender.split('@')[0]

      if (!config.ownerNumbers.includes(numero)) {
        return reply('❌ Apenas o dono principal pode remover frases.')
      }

      const texto = args?.join(' ').trim() || ''
      const partes = texto.split('|').map(item => item.trim())

      if (partes.length < 2 || !partes[0] || !partes[1]) {
        return reply(`❌ Formato inválido.

Use:
${config.prefix}removerfrasepatenteff Diamante I | 1`)
      }

      const patente = patentesPadrao.find(
        item => item.toLowerCase() === partes[0].toLowerCase()
      )

      if (!patente) {
        return reply('❌ Patente não encontrada.')
      }

      const indice = Number(partes[1])

      if (!Number.isInteger(indice) || indice < 1) {
        return reply('❌ Informe o número da frase que deseja remover.')
      }

      const db = await getDatabase()
      const configuracoes = await obterConfiguracao(db)
      const frases = configuracoes[patente].frases || []

      if (indice > frases.length) {
        return reply(`❌ Essa patente possui apenas *${frases.length}* frase(s).`)
      }

      const removida = frases.splice(indice - 1, 1)[0]

      if (!frases.length) {
        frases.push('🔥 Mandou bem!')
      }

      db.data.settings.patentesff = configuracoes
      await db.write()

      return reply(`✅ *FRASE REMOVIDA!*

🎮 Patente: *${configuracoes[patente].nome || patente}*
🗑️ Frase removida: _${removida}_`)
    },
  },

  { name: 'removerpatenteff', aliases: ['delpatenteff','excluirpatenteff'], description: 'Remove a imagem cadastrada de uma patente.', async execute({reply,sender,args}) { const numero=sender.split('@')[0]; if(!config.ownerNumbers.includes(numero)) return reply('❌ Apenas o dono principal pode remover patentes.'); const texto=args?.join(' ').trim()||''; const patente=patentesPadrao.find(x=>x.toLowerCase()===texto.toLowerCase()); if(!patente) return reply('❌ Patente não encontrada. Use, por exemplo: !removerpatenteff Platina I'); const db=await getDatabase(); const cfg=await obterConfiguracao(db); const arquivo=cfg[patente]?.arquivo; if(!arquivo) return reply('❌ Essa patente não possui imagem cadastrada.'); const caminho=join(pastaPatentes,arquivo); try { await readFile(caminho) } catch { cfg[patente].arquivo=null; db.data.settings.patentesff=cfg; await db.write(); return reply('⚠️ A imagem não foi encontrada nos arquivos do bot.') } const {unlink}=await import('node:fs/promises'); await unlink(caminho); cfg[patente].arquivo=null; db.data.settings.patentesff=cfg; await db.write(); return reply('✅ Imagem da patente removida com sucesso!'); } },
]
