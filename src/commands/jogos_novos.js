import { getDatabase } from '../database.js'

const partidas = new Map()

const normalizar = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

async function premiar(jid, reply, pontos = 10) {
  const db = await getDatabase()
  db.data.users[jid] ||= { jid }
  db.data.users[jid].gold = Number(db.data.users[jid].gold || 0) + pontos
  await db.write()
  await reply(`🎉 *RESPOSTA CERTA!*\n\n🪙 Você ganhou *${pontos} Gold*!`)
}

function iniciar(jid, tipo, pergunta, resposta, extras = {}) {
  partidas.set(jid, {
    tipo,
    pergunta,
    resposta: normalizar(resposta),
    ...extras,
  })
}

function textoPergunta(titulo, pergunta) {
  return `🎮 *${titulo}*\n\n❓ ${pergunta}\n\n💰 Primeiro a acertar ganha *10 Gold*!`
}

export async function processarRespostaDeJogo({ message, sender, texto, reply }) {
  const jid = message?.key?.remoteJid
  if (!jid || !texto || !partidas.has(jid)) return false

  const partida = partidas.get(jid)
  const resposta = normalizar(texto)

  if (resposta.startsWith('!')) return false

  if (partida.tipo === 'forca') {
    if (resposta.length !== 1) return false

    const letra = resposta
    if (partida.letras.includes(letra)) return true

    partida.letras.push(letra)

    if (partida.resposta.includes(letra)) {
      partida.descobertas = partida.resposta
        .split('')
        .map((l) => partida.letras.includes(l) ? l : '_')
        .join(' ')

      if (!partida.descobertas.includes('_')) {
        partidas.delete(jid)
        await premiar(sender, reply, partida.premio || 10)
        await reply(`🏆 Palavra: *${partida.resposta.toUpperCase()}*`)
      } else {
        await reply(`🎯 Boa! Palavra:\n\n*${partida.descobertas}*`)
      }
    } else {
      partida.erros++
      await reply(`❌ Letra não encontrada.\n\n❤️ Erros: ${partida.erros}/6`)
      if (partida.erros >= 6) {
        partidas.delete(jid)
        await reply(`💀 *FIM DE JOGO!*\n\nA palavra era: *${partida.resposta.toUpperCase()}*`)
      }
    }

    return true
  }

  if (partida.tipo === 'numero') {
    const numero = Number(texto)
    if (!Number.isInteger(numero)) return true

    if (numero === partida.respostaNumero) {
      partidas.delete(jid)
      await premiar(sender, reply, partida.premio || 10)
      return true
    }

    await reply(
      numero < partida.respostaNumero
        ? '📈 É maior!'
        : '📉 É menor!'
    )
    return true
  }

  if (partida.tipo === 'embaralhada') {
    if (resposta === partida.resposta) {
      partidas.delete(jid)
      await premiar(sender, reply, partida.premio || 10)
    }
    return true
  }

  if (partida.tipo === 'verdadeiro') {
    if (resposta === partida.resposta) {
      partidas.delete(jid)
      await premiar(sender, reply, partida.premio || 10)
    }
    return true
  }

  if (resposta === partida.resposta) {
    partidas.delete(jid)
    await premiar(sender, reply, partida.premio || 10)
    return true
  }

  return true
}

const quiz = [
  ['Qual é o maior planeta do Sistema Solar?', 'jupiter'],
  ['Qual é o planeta conhecido como Planeta Vermelho?', 'marte'],
  ['Quantos dias tem um ano normal?', '365'],
  ['Qual é o maior oceano do mundo?', 'pacifico'],
  ['Qual é o animal terrestre mais rápido?', 'guepardo'],
]

const paises = [
  ['Qual é a capital do Brasil?', 'brasilia'],
  ['Qual país é conhecido como Terra do Sol Nascente?', 'japao'],
  ['Em qual país fica a Torre Eiffel?', 'franca'],
  ['Qual é o maior país do mundo em território?', 'russia'],
  ['Qual país tem formato de bota?', 'italia'],
]

const estados = [
  ['Qual é a capital de Minas Gerais?', 'belo horizonte'],
  ['Qual é a capital da Bahia?', 'salvador'],
  ['Qual é a capital de São Paulo?', 'sao paulo'],
  ['Qual é a capital do Paraná?', 'curitiba'],
  ['Qual é a capital do Amazonas?', 'manaus'],
]

const capitais = [
  ['Qual é a capital da Argentina?', 'buenos aires'],
  ['Qual é a capital do Chile?', 'santiago'],
  ['Qual é a capital de Portugal?', 'lisboa'],
  ['Qual é a capital da França?', 'paris'],
  ['Qual é a capital da Itália?', 'roma'],
]

const bandeiras = [
  ['🇧🇷 Qual é o país desta bandeira?', 'brasil'],
  ['🇦🇷 Qual é o país desta bandeira?', 'argentina'],
  ['🇵🇹 Qual é o país desta bandeira?', 'portugal'],
  ['🇯🇵 Qual é o país desta bandeira?', 'japao'],
  ['🇫🇷 Qual é o país desta bandeira?', 'franca'],
]

const futebol = [
  ['Qual país venceu a Copa do Mundo de 2002?', 'brasil'],
  ['Quantos jogadores cada time começa com o campo no futebol?', '11'],
  ['Qual país sediou a Copa do Mundo de 2014?', 'brasil'],
  ['Qual é o clube conhecido como Timão?', 'corinthians'],
  ['Qual seleção é conhecida como Albiceleste?', 'argentina'],
]

const matematica = [
  ['Quanto é 7 + 8?', '15'],
  ['Quanto é 9 × 9?', '81'],
  ['Quanto é 100 ÷ 4?', '25'],
  ['Quanto é 12 × 5?', '60'],
  ['Quanto é 50 - 17?', '33'],
]

const animais = [
  ['Qual é o maior animal do planeta?', 'baleia azul'],
  ['Qual animal é conhecido como rei da selva?', 'leao'],
  ['Qual animal produz lã?', 'ovelha'],
  ['Qual animal tem uma tromba?', 'elefante'],
  ['Qual animal é famoso por mudar de cor?', 'camaleao'],
]

const espaco = [
  ['Qual estrela está no centro do Sistema Solar?', 'sol'],
  ['Qual planeta é famoso por seus anéis?', 'saturno'],
  ['Qual é o satélite natural da Terra?', 'lua'],
  ['Qual planeta é o mais próximo do Sol?', 'mercurio'],
  ['Em qual planeta vivemos?', 'terra'],
]

const ciencia = [
  ['Qual gás os seres humanos precisam respirar?', 'oxigenio'],
  ['Qual órgão bombeia o sangue?', 'coracao'],
  ['Qual é a fórmula da água?', 'h2o'],
  ['Quantos ossos tem aproximadamente um adulto?', '206'],
  ['Qual é o símbolo químico do ouro?', 'au'],
]

const conhecimentos = [
  ['Quantos continentes existem no modelo mais usado no Brasil?', '6'],
  ['Qual é a língua oficial do Brasil?', 'portugues'],
  ['Qual é o maior país da América do Sul?', 'brasil'],
  ['Quantas letras tem o alfabeto português brasileiro?', '26'],
  ['Qual é o primeiro mês do ano?', 'janeiro'],
]

const filmes = [
  ['Qual filme tem o personagem Jack Sparrow?', 'piratas do caribe'],
  ['Qual herói usa um escudo com uma estrela?', 'capitao america'],
  ['Qual personagem vive em Gotham City?', 'batman'],
  ['Qual filme apresenta o personagem Harry Potter?', 'harry potter'],
  ['Qual super-herói é conhecido como Homem-Aranha?', 'homem aranha'],
]

const musica = [
  ['Quantas cordas tem um violão tradicional?', '6'],
  ['Qual instrumento possui teclas pretas e brancas?', 'piano'],
  ['Qual símbolo representa silêncio na música?', 'pausa'],
  ['Como se chama quem canta?', 'cantor'],
  ['Qual instrumento é conhecido por ter pratos e tambores?', 'bateria'],
]

const comida = [
  ['Qual é o principal ingrediente do guacamole?', 'abacate'],
  ['Qual alimento é feito tradicionalmente com cacau?', 'chocolate'],
  ['Qual é a base do sushi tradicional?', 'arroz'],
  ['Qual fruta é usada para fazer guaraná?', 'guarana'],
  ['Qual alimento é produzido pelas abelhas?', 'mel'],
]

const perguntasVerdadeiro = [
  ['O Brasil fica na América do Sul.', 'verdadeiro'],
  ['A Terra é plana.', 'falso'],
  ['O Sol é uma estrela.', 'verdadeiro'],
  ['O oceano Pacífico é o maior oceano.', 'verdadeiro'],
  ['O Brasil tem 30 estados.', 'falso'],
]

const charadas = [
  ['Tenho dentes mas não mordo. O que sou?', 'pente'],
  ['Quanto mais tiro, maior fica. O que sou?', 'buraco'],
  ['Tenho ponteiros mas não sou pessoa. O que sou?', 'relogio'],
  ['Tenho folhas mas não sou árvore. O que sou?', 'livro'],
  ['Tenho chave mas não abro porta. O que sou?', 'piano'],
]

const quemSou = [
  ['Sou um animal que mia e gosto de leite. Quem sou?', 'gato'],
  ['Sou amarelo e tenho casca. Quem sou?', 'banana'],
  ['Sou o planeta vermelho. Quem sou?', 'marte'],
  ['Sou usado para cortar papel. Quem sou?', 'tesoura'],
  ['Sou usado para escrever e tenho tinta. Quem sou?', 'caneta'],
]

const detetive = [
  ['O criminoso deixou uma pegada molhada dentro da casa. Quem estava escondendo algo?', 'o jardineiro'],
  ['A janela estava fechada por dentro e o único suspeito tinha a chave. Quem entrou?', 'o dono'],
  ['O relógio parou exatamente às 22h, mas o suspeito disse que dormia às 21h. Quem mentiu?', 'o suspeito'],
]

const palavras = [
  ['TARAE', 'tarefa'],
  ['SABARIL', 'brasil'],
  ['SACAPITAL', 'capital'],
  ['ZINAAMA', 'amizade'],
  ['OTEBOLF', 'futebol'],
]

const frases = [
  ['Água mole em pedra dura, tanto bate até que...', 'fura'],
  ['Quem espera sempre...', 'alcança'],
  ['Mais vale um pássaro na mão do que...', 'dois voando'],
]

const animaisRapidos = [
  ['Qual é o animal terrestre mais rápido?', 'guepardo'],
  ['Qual ave é famosa por sua velocidade em mergulho?', 'falcao peregrino'],
]

const historia = [
  ['Quem descobriu o Brasil em 1500 segundo a história tradicional?', 'pedro alvares cabral'],
  ['Em que ano terminou a Segunda Guerra Mundial?', '1945'],
  ['Quem foi o primeiro imperador do Brasil?', 'pedro i'],
  ['Qual civilização construiu Machu Picchu?', 'incas'],
  ['Qual foi a capital do Brasil antes de Brasília?', 'rio de janeiro'],
]

const tecnologia = [
  ['Qual empresa criou o Android originalmente?', 'android'],
  ['O que significa CPU?', 'unidade central de processamento'],
  ['Qual linguagem é usada principalmente para estruturar páginas web?', 'html'],
  ['Qual empresa criou o Windows?', 'microsoft'],
  ['O que significa Wi-Fi?', 'wireless fidelity'],
]

const portugues = [
  ['Qual é o plural de cidadão?', 'cidadaos'],
  ['Qual é o antônimo de rápido?', 'lento'],
  ['Qual é o feminino de ator?', 'atriz'],
  ['Qual é o sinônimo de feliz?', 'contente'],
  ['Qual é o contrário de entrar?', 'sair'],
]

const cultura = [
  ['Qual é a maior festa popular do Brasil?', 'carnaval'],
  ['Qual é a língua mais falada no Brasil?', 'portugues'],
  ['Qual instrumento é símbolo do samba?', 'pandeiro'],
  ['Qual dança é tradicional do Nordeste brasileiro?', 'forro'],
  ['Qual é o nome do famoso festival de música realizado em São Paulo?', 'lollapalooza'],
]

function criarJogoLista(nome, lista) {
  return {
    name: nome,
    aliases: [],
    description: `Jogo ${nome}.`,
    async execute({ reply, message }) {
      const jid = message.key.remoteJid
      const item = lista[Math.floor(Math.random() * lista.length)]
      iniciar(jid, nome, item[0], item[1])
      return reply(textoPergunta(nome.toUpperCase(), item[0]))
    },
  }
}

export const jogosNovosCommands = [
  criarJogoLista('quiz', quiz),
  criarJogoLista('paises', paises),
  criarJogoLista('estados', estados),
  criarJogoLista('capitais', capitais),
  criarJogoLista('bandeiras', bandeiras),
  criarJogoLista('futebol', futebol),
  criarJogoLista('matematica', matematica),
  criarJogoLista('animais', animais),
  criarJogoLista('espaco', espaco),
  criarJogoLista('ciencia', ciencia),
  criarJogoLista('conhecimentos', conhecimentos),
  criarJogoLista('filmes', filmes),
  criarJogoLista('musica', musica),
  criarJogoLista('comida', comida),
  criarJogoLista('charadas', charadas),
  criarJogoLista('quemsou', quemSou),
  criarJogoLista('detetive', detetive),
  criarJogoLista('frases', frases),
  criarJogoLista('animaisrapidos', animaisRapidos),
  criarJogoLista('historia', historia),
  criarJogoLista('tecnologia', tecnologia),
  criarJogoLista('portugues', portugues),
  criarJogoLista('cultura', cultura),


  {
    name: 'forca',
    aliases: [],
    description: 'Jogo da Forca.',
    async execute({ reply, message }) {
      const palavrasForca = [
        'banana',
        'computador',
        'whatsapp',
        'brasil',
        'elefante',
        'futebol',
        'telefone',
        'dinheiro',
      ]

      const palavra =
        palavrasForca[Math.floor(Math.random() * palavrasForca.length)]

      iniciar(message.key.remoteJid, 'forca', '', palavra, {
        letras: [],
        erros: 0,
        descobertas: palavra
          .split('')
          .map(() => '_')
          .join(' '),
      })

      return reply(
        `🎯 *FORCA*\n\n` +
        `🔤 Palavra:\n*${palavra.split('').map(() => '_').join(' ')}*\n\n` +
        `Digite uma letra por vez.\n` +
        `❤️ Você tem 6 erros.`
      )
    },
  },

  {
    name: 'numero',
    aliases: ['adivinhenumero'],
    description: 'Adivinhe o número.',
    async execute({ reply, message }) {
      const numero = Math.floor(Math.random() * 100) + 1
      partidas.set(message.key.remoteJid, {
        tipo: 'numero',
        respostaNumero: numero,
      })

      return reply(
        `🔢 *ADIVINHE O NÚMERO*\n\n` +
        `Pensei em um número de *1 a 100*.\n` +
        `Digite seu palpite!\n\n` +
        `💰 Primeiro a acertar ganha *10 Gold*!`
      )
    },
  },

  {
    name: 'embaralhada',
    aliases: ['palavraembaralhada'],
    description: 'Descubra a palavra embaralhada.',
    async execute({ reply, message }) {
      const item =
        palavras[Math.floor(Math.random() * palavras.length)]

      iniciar(message.key.remoteJid, 'embaralhada', '', item[1])

      return reply(
        `🔀 *PALAVRA EMBARALHADA*\n\n` +
        `🧩 Descubra:\n*${item[0]}*\n\n` +
        `💰 Primeiro a acertar ganha *10 Gold*!`
      )
    },
  },

  {
    name: 'verdadeiro',
    aliases: ['vf', 'verdadeirofalso'],
    description: 'Verdadeiro ou falso.',
    async execute({ reply, message }) {
      const item =
        perguntasVerdadeiro[
          Math.floor(Math.random() * perguntasVerdadeiro.length)
        ]

      iniciar(message.key.remoteJid, 'verdadeiro', item[0], item[1])

      return reply(
        `⚖️ *VERDADEIRO OU FALSO*\n\n` +
        `❓ ${item[0]}\n\n` +
        `Responda *verdadeiro* ou *falso*.\n` +
        `💰 Primeiro a acertar ganha *10 Gold*!`
      )
    },
  },

  {
    name: 'jackpot',
    aliases: [],
    description: 'Pergunta com prêmio especial.',
    async execute({ reply, message }) {
      const item = quiz[Math.floor(Math.random() * quiz.length)]
      iniciar(message.key.remoteJid, 'jackpot', item[0], item[1])
      partidas.get(message.key.remoteJid).premio = 50

      return reply(
        `💰🎰 *JACKPOT!* 🎰💰\n\n` +
        `❓ ${item[0]}\n\n` +
        `🏆 Prêmio: *50 Gold*!\n` +
        `Primeiro a acertar leva tudo!`
      )
    },
  },

  {
    name: 'copadomundo',
    aliases: ['copa'],
    description: 'Perguntas sobre Copa do Mundo.',
    async execute({ reply, message }) {
      const item = [
        ['Quem venceu a Copa de 2002?', 'brasil'],
        ['Quem venceu a Copa de 2022?', 'argentina'],
        ['Qual país sediou a Copa de 2014?', 'brasil'],
      ][Math.floor(Math.random() * 3)]

      iniciar(message.key.remoteJid, 'copadomundo', item[0], item[1])

      return reply(textoPergunta('COPA DO MUNDO', item[0]))
    },
  },

  {
    name: 'quemganha',
    aliases: [],
    description: 'Desafio rápido.',
    async execute({ reply, message }) {
      const opcoes = [
        ['Qual é maior: Brasil ou Argentina em território?', 'brasil'],
        ['Qual é maior: baleia ou elefante?', 'baleia'],
        ['Qual é maior: Sol ou Terra?', 'sol'],
      ]

      const item = opcoes[Math.floor(Math.random() * opcoes.length)]
      iniciar(message.key.remoteJid, 'quemganha', item[0], item[1])

      return reply(textoPergunta('QUEM GANHA?', item[0]))
    },
  },

  {
    name: 'jogos',
    aliases: ['game', 'games'],
    description: 'Lista os jogos disponíveis.',
    async execute({ reply }) {
      return reply(
        `🎮 *CENTRAL DE JOGOS* 🎮\n\n` +
        `1️⃣ !quiz\n` +
        `2️⃣ !paises\n` +
        `3️⃣ !estados\n` +
        `4️⃣ !capitais\n` +
        `5️⃣ !bandeiras\n` +
        `6️⃣ !futebol\n` +
        `7️⃣ !matematica\n` +
        `8️⃣ !forca\n` +
        `9️⃣ !numero\n` +
        `🔟 !charadas\n` +
        `1️⃣1️⃣ !quemsou\n` +
        `1️⃣2️⃣ !detetive\n` +
        `1️⃣3️⃣ !filmes\n` +
        `1️⃣4️⃣ !musica\n` +
        `1️⃣5️⃣ !comida\n` +
        `1️⃣6️⃣ !verdadeiro\n` +
        `1️⃣7️⃣ !embaralhada\n` +
        `1️⃣8️⃣ !jackpot\n` +
        `1️⃣9️⃣ !copadomundo\n` +
        `2️⃣0️⃣ !espaco\n` +
        `2️⃣1️⃣ !ciencia\n` +
        `2️⃣2️⃣ !conhecimentos\n` +
        `2️⃣3️⃣ !frases\n` +
        `2️⃣4️⃣ !animais\n` +
        `2️⃣5️⃣ !animaisrapidos\n` +
        `2️⃣6️⃣ !quemganha\n` +
        `2️⃣7️⃣ !historia\n` +
        `2️⃣8️⃣ !tecnologia\n` +
        `2️⃣9️⃣ !portugues\n` +
        `3️⃣0️⃣ !cultura\n\n` +
        `🏆 Primeiro a acertar ganha Gold.`
      )
    },
  },
]
