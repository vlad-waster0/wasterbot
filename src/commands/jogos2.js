import { getDatabase } from '../database.js'

function mencionado(message) {
  return (
    message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.imageMessage?.contextInfo?.mentionedJid?.[0] ||
    message?.message?.videoMessage?.contextInfo?.mentionedJid?.[0]
  )
}

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const forcas = [
  { palavra: 'banana', dica: 'É uma fruta amarela.' },
  { palavra: 'computador', dica: 'É usado para acessar programas e internet.' },
  { palavra: 'chocolate', dica: 'É um doce muito popular.' },
  { palavra: 'celular', dica: 'Você provavelmente está usando um agora.' },
  { palavra: 'abacaxi', dica: 'É uma fruta com casca espinhosa.' },
  { palavra: 'cachorro', dica: 'É conhecido como o melhor amigo do homem.' },
  { palavra: 'whatsapp', dica: 'Aplicativo famoso de mensagens.' },
  { palavra: 'dinheiro', dica: 'Pode ser usado para comprar coisas.' },
]

const adivinhacoes = [
  { numero: 7, dica: 'É um número considerado especial.' },
  { numero: 13, dica: 'Muita gente considera este número de azar.' },
  { numero: 21, dica: 'É maior que 20 e menor que 22.' },
  { numero: 42, dica: 'É famoso em uma obra de ficção científica.' },
  { numero: 50, dica: 'É metade de 100.' },
  { numero: 77, dica: 'É um número com dois algarismos iguais.' },
  { numero: 99, dica: 'É um a menos que 100.' },
]

const perguntasDetetive = [
  {
    pergunta: 'Quem roubou o Gold da cidade?',
    opcoes: ['O padeiro', 'O policial', 'O jogador', 'O comerciante'],
    resposta: 2,
  },
  {
    pergunta: 'Quem escondeu o tesouro?',
    opcoes: ['O pirata', 'O médico', 'O professor', 'O motorista'],
    resposta: 0,
  },
  {
    pergunta: 'Quem apagou as provas?',
    opcoes: ['O detetive', 'O hacker', 'O cozinheiro', 'O vendedor'],
    resposta: 1,
  },
]

const verdadeDesafio = {
  verdade: [
    'Qual foi a coisa mais vergonhosa que você já fez?',
    'Qual foi sua maior mentira?',
    'Qual pessoa você mais admira?',
    'Qual foi sua maior loucura por alguém?',
    'Qual é um segredo que pouca gente sabe sobre você?',
  ],
  desafio: [
    'Mande um áudio cantando por 10 segundos.',
    'Mande um emoji que represente sua personalidade.',
    'Escreva uma frase usando apenas emojis.',
    'Mande uma mensagem dizendo "eu sou incrível".',
    'Fique 30 segundos sem usar a letra A.',
  ],
}

export const jogos2Commands = [
  {
    name: 'forca',
    description: 'Jogo da forca.',
    async execute({ reply, message }) {
      const db = await getDatabase()
      db.data.jogos ||= {}
      db.data.jogos.forca ||= {}

      const chat = message?.key?.remoteJid
      const atual = db.data.jogos.forca[chat]

      if (atual?.ativo) {
        return reply(
          `🎯 *FORCA EM ANDAMENTO!*\n\n` +
          `🔤 Palavra: ${atual.mascara}\n` +
          `💀 Erros: ${atual.erros}/6\n\n` +
          `Envie uma letra para tentar.`
        )
      }

      const item = forcas[Math.floor(Math.random() * forcas.length)]

      db.data.jogos.forca[chat] = {
        ativo: true,
        palavra: item.palavra,
        mascara: '_ '.repeat(item.palavra.length).trim(),
        letras: [],
        erros: 0,
        dica: item.dica,
        iniciadoEm: Date.now(),
      }

      await db.write()

      return reply(
        `🎯 *JOGO DA FORCA*\n\n` +
        `🔤 Palavra: ${'_ '.repeat(item.palavra.length).trim()}\n` +
        `💡 Dica: ${item.dica}\n\n` +
        `Digite uma letra para tentar!`
      )
    },
  },

  {
    name: 'adivinhar',
    description: 'Adivinhe o número secreto.',
    async execute({ reply, message }) {
      const chat = message?.key?.remoteJid
      globalThis.__wasterAdivinhar ||= {}

      const jogo = {
        numero: adivinhacoes[Math.floor(Math.random() * adivinhacoes.length)],
        ativo: true,
      }

      globalThis.__wasterAdivinhar[chat] = jogo

      return reply(
        `🔮 *ADIVINHE O NÚMERO!*\n\n` +
        `🎯 Pensei em um número entre *1 e 100*.\n` +
        `💡 Dica: ${jogo.numero.dica}\n\n` +
        `Envie apenas um número para tentar!`
      )
    },
  },

  {
    name: 'detetive',
    description: 'Jogo de investigação.',
    async execute({ reply, message }) {
      const chat = message?.key?.remoteJid
      globalThis.__wasterDetetive ||= {}

      const jogo =
        perguntasDetetive[
          Math.floor(Math.random() * perguntasDetetive.length)
        ]

      globalThis.__wasterDetetive[chat] = {
        ...jogo,
        ativo: true,
      }

      return reply(
        `🕵️ *DETETIVE*\n\n` +
        `${jogo.pergunta}\n\n` +
        jogo.opcoes.map((x, i) => `${i + 1}️⃣ ${x}`).join('\n') +
        `\n\nResponda com o número da opção!`
      )
    },
  },

  {
    name: 'maioroumenor',
    aliases: ['maiormenor'],
    description: 'Adivinhe se o próximo número será maior ou menor.',
    async execute({ reply, message }) {
      const chat = message?.key?.remoteJid
      globalThis.__wasterMaiorMenor ||= {}

      const atual = Math.floor(Math.random() * 100) + 1

      globalThis.__wasterMaiorMenor[chat] = {
        atual,
        ativo: true,
      }

      return reply(
        `📈 *MAIOR OU MENOR*\n\n` +
        `🎲 Número atual: *${atual}*\n\n` +
        `Responda:\n` +
        `⬆️ *maior*\n` +
        `⬇️ *menor*`
      )
    },
  },

  {
    name: 'parouimpar',
    aliases: ['parimpar'],
    description: 'Jogo de par ou ímpar.',
    async execute({ reply, message }) {
      const chat = message?.key?.remoteJid
      globalThis.__wasterParImpar ||= {}

      const numero = Math.floor(Math.random() * 100) + 1

      globalThis.__wasterParImpar[chat] = {
        numero,
        ativo: true,
      }

      return reply(
        `🔢 *PAR OU ÍMPAR*\n\n` +
        `🎲 Meu número foi: *${numero}*\n\n` +
        `Responda *par* ou *ímpar*!`
      )
    },
  },

  {
    name: 'verdadeoudesafio',
    aliases: ['vod', 'verdadedesafio'],
    description: 'Verdade ou desafio.',
    async execute({ reply }) {
      const tipo = Math.random() < 0.5 ? 'verdade' : 'desafio'
      const lista = verdadeDesafio[tipo]
      const pergunta = lista[Math.floor(Math.random() * lista.length)]

      return reply(
        `🎭 *VERDADE OU DESAFIO*\n\n` +
        `🎯 Tipo: *${tipo.toUpperCase()}*\n\n` +
        `${pergunta}`
      )
    },
  },
  {
    name: 'rankgay',
    aliases: ['gayrank'],
    description: 'Ranking dos 5 mais gays do grupo.',
    async execute({ reply, message, sock }) {
      const chat = message?.key?.remoteJid

      if (!chat?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      const db = await getDatabase()
      const metadata = await sock.groupMetadata(chat)

      const participantes = (metadata.participants || [])
        .map(p => p.id)
        .filter(Boolean)

      const extrairMensagens = (u) => {
        return Math.max(
          Number(u?.messages || 0),
          Number(u?.messageCount || 0),
          Number(u?.msgCount || 0),
          Number(u?.mensagens || 0),
          Number(u?.atividade?.mensagens || 0),
          Number(u?.stats?.messages || 0)
        )
      }

      const candidatos = participantes.map(jid => {
        const u = db.data.users?.[jid] || {}
        const mensagens = extrairMensagens(u)
        const gayScore = Number(u.gayScore || 0)

        return {
          jid,
          mensagens,
          gayScore,
          peso: mensagens >= 50 ? 5 : 1
        }
      })

      if (!candidatos.length) {
        return reply('❌ Não consegui encontrar participantes ativos neste grupo.')
      }

      // Sorteio ponderado: quem tem 50+ mensagens possui chance maior.
      const sorteados = []
      const disponiveis = [...candidatos]

      while (sorteados.length < Math.min(5, disponiveis.length)) {
        const totalPeso = disponiveis.reduce((soma, p) => soma + p.peso, 0)
        let sorteio = Math.random() * totalPeso
        let escolhido = disponiveis[disponiveis.length - 1]

        for (const pessoa of disponiveis) {
          sorteio -= pessoa.peso
          if (sorteio <= 0) {
            escolhido = pessoa
            break
          }
        }

        sorteados.push(escolhido)
        disponiveis.splice(disponiveis.indexOf(escolhido), 1)
      }

      const ranking = sorteados.map((u, i) => {
        const score = u.gayScore > 0
          ? u.gayScore
          : Math.floor(Math.random() * 101)

        return `${i + 1}º 🏳️‍🌈 @${u.jid.split('@')[0]} — *${score}% Gay*`
      }).join('\n')

        return sock.sendMessage(chat, {
          text: `🏳️‍🌈 *RANK DOS TOP 5 MAIS GAY DO GRUPO*\n\n${ranking}`,
          mentions: sorteados.map(u => u.jid)
        })
    },
  },

  {
    name: 'adotar',
    description: 'Adiciona uma pessoa à sua família.',
    async execute({ reply, message, args, sock }) {
      const chat = message?.key?.remoteJid

      if (!chat?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      const contexto = message?.message?.extendedTextMessage?.contextInfo
      let target = contexto?.mentionedJid?.[0]

      if (!target) {
        return reply(
          `❌ Marque a pessoa que você quer adicionar à família.\n\n` +
          `Exemplo:\n` +
          `*!adotar @pessoa irmão*`
        )
      }

      const metadata = await sock.groupMetadata(chat)

      // Resolve LID para o JID de telefone quando necessário.
      if (target.endsWith('@lid')) {
        const participante = (metadata.participants || []).find(
          p => p.id === target || p.lid === target
        )

        if (participante?.phoneNumber) {
          target = participante.phoneNumber
        } else if (participante?.id) {
          target = participante.id
        }
      }

      const tipos = {
        pai: '👨 Pai',
        mae: '👩 Mãe',
        mãe: '👩 Mãe',
        filho: '👦 Filho',
        filha: '👧 Filha',
        irmao: '👦 Irmão',
        irmão: '👦 Irmão',
        irma: '👧 Irmã',
        irmã: '👧 Irmã',
        tio: '👨 Tio',
        tia: '👩 Tia',
        primo: '👦 Primo',
        prima: '👧 Prima',
        avo: '👴 Avô',
        avô: '👴 Avô',
        avoa: '👵 Avó',
        avó: '👵 Avó',
        bisavo: '👴 Bisavô',
        bisavô: '👴 Bisavô',
        bisavoa: '👵 Bisavó',
        bisavó: '👵 Bisavó',
        neto: '👦 Neto',
        neta: '👧 Neta',
        sobrinho: '👦 Sobrinho',
        sobrinha: '👧 Sobrinha',
      }

      const textoTipo = normalizar((args || []).join(' '))
      let tipoChave = Object.keys(tipos).find(k => textoTipo.endsWith(k))

      if (!tipoChave) {
        return reply(
          `❌ Informe o parentesco.\n\n` +
          `Exemplos:\n` +
          `*!adotar @pessoa irmão*\n` +
          `*!adotar @pessoa primo*\n` +
          `*!adotar @pessoa bisavó*`
        )
      }

      const db = await getDatabase()
      db.data.familias ||= {}
      db.data.familias[chat] ||= {}

      db.data.familias[chat][target] ||= []

      const jaExiste = db.data.familias[chat][target]
        .some(r => r.tipo === tipoChave)

      if (!jaExiste) {
        db.data.familias[chat][target].push({
          tipo: tipoChave,
          criadoPor: message?.key?.participant || message?.key?.remoteJid,
          criadoEm: Date.now(),
        })
      }

      await db.write()

      let foto = null

      try {
        foto = await sock.profilePictureUrl(target, 'image')
      } catch {}

      const texto =
        `👨‍👩‍👧‍👦 *NOVA RELAÇÃO FAMILIAR!*\n\n` +
        `❤️ Você adicionou @${target.split('@')[0]} como *${tipos[tipoChave].replace(/^.\s*/, '')}*!\n\n` +
        `🌳 Use *!arvore* para ver a árvore genealógica completa.`

      if (foto) {
        try {
          const resposta = await fetch(foto)
          if (resposta.ok) {
            const imagem = Buffer.from(await resposta.arrayBuffer())

            return sock.sendMessage(chat, {
              image: imagem,
              caption: texto,
              mentions: [target],
            })
          }
        } catch (error) {
          console.error('ERRO AO ENVIAR FOTO DA ADOÇÃO:', error)
        }
      }

      return sock.sendMessage(chat, {
        text: texto,
        mentions: [target],
      })
    },
  },

  {
    name: 'arvore',
    aliases: ['arvoregenealogica', 'familia'],
    description: 'Mostra a árvore genealógica do grupo.',
    async execute({ reply, message, sock }) {
      const chat = message?.key?.remoteJid

      if (!chat?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      const db = await getDatabase()
      const familias = db.data.familias?.[chat] || {}

      const linhas = {
        pai: ['👨', 'Pai'],
        mae: ['👩', 'Mãe'],
        mãe: ['👩', 'Mãe'],
        filho: ['👦', 'Filho'],
        filha: ['👧', 'Filha'],
        irmao: ['👦', 'Irmão'],
        irmão: ['👦', 'Irmão'],
        irma: ['👧', 'Irmã'],
        irmã: ['👧', 'Irmã'],
        tio: ['👨', 'Tio'],
        tia: ['👩', 'Tia'],
        primo: ['👦', 'Primo'],
        prima: ['👧', 'Prima'],
        avo: ['👴', 'Avô'],
        avô: ['👴', 'Avô'],
        avoa: ['👵', 'Avó'],
        avó: ['👵', 'Avó'],
        bisavo: ['👴', 'Bisavô'],
        bisavô: ['👴', 'Bisavô'],
        bisavoa: ['👵', 'Bisavó'],
        bisavó: ['👵', 'Bisavó'],
        neto: ['👦', 'Neto'],
        neta: ['👧', 'Neta'],
        sobrinho: ['👦', 'Sobrinho'],
        sobrinha: ['👧', 'Sobrinha'],
      }

      const ordem = [
        'bisavo', 'bisavô', 'bisavoa', 'bisavó',
        'avo', 'avô', 'avoa', 'avó',
        'pai', 'mae', 'mãe',
        'irmao', 'irmão', 'irma', 'irmã',
        'tio', 'tia',
        'primo', 'prima',
        'filho', 'filha',
        'neto', 'neta',
        'sobrinho', 'sobrinha'
      ]

      const grupos = {}
      const mentions = []

      for (const [jid, relacoes] of Object.entries(familias)) {
        for (const relacao of relacoes || []) {
          if (!linhas[relacao.tipo]) continue

          grupos[relacao.tipo] ||= []

          if (!grupos[relacao.tipo].includes(jid)) {
            grupos[relacao.tipo].push(jid)
            mentions.push(jid)
          }
        }
      }

      if (!mentions.length) {
        return reply(
          `🌳 *ÁRVORE GENEALÓGICA*\n\n` +
          `📭 Ainda não existem parentes cadastrados.\n\n` +
          `Use:\n` +
          `*!adotar @pessoa irmão*\n` +
          `*!adotar @pessoa primo*\n` +
          `*!adotar @pessoa bisavó*`
        )
      }

      let texto = `🌳 *ÁRVORE GENEALÓGICA DO GRUPO*\n\n`

      for (const tipo of ordem) {
        const pessoas = grupos[tipo]

        if (!pessoas?.length) continue

        const info = linhas[tipo]

        texto += `${info[0]} *${info[1]}:*\n`

        for (const jid of pessoas) {
          texto += `   └─ @${jid.split('@')[0]}\n`
        }

        texto += `\n`
      }

      texto += `👨‍👩‍👧‍👦 *Total de parentes cadastrados:* ${mentions.length}`

      return sock.sendMessage(chat, {
        text: texto,
        mentions,
      })
    },
  },
]
