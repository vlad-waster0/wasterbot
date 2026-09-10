import { getDatabase } from '../database.js'

const itens = {
  escudos: [
    ['papelao', '🛡️ Escudo de Papelão', 5, 100],
    ['madeira', '🪵 Escudo de Madeira', 20, 250],
    ['ferro', '🛡️ Escudo de Ferro', 50, 700],
    ['aco', '🛡️ Escudo de Aço', 100, 1500],
    ['militar', '🛡️ Escudo Militar', 200, 3000],
    ['titanio', '🛡️ Escudo de Titânio', 300, 5000],
    ['diamante', '💎 Escudo de Diamante', 500, 12000],
    ['obsidiana', '🖤 Escudo de Obsidiana', 800, 25000],
    ['lendario', '👑 Escudo Lendário', 1500, 50000],
    ['divino', '✨ Escudo Divino', 3000, 100000],
  ],

  armas: [
    ['faca', '🔪 Faca', 5, 150],
    ['espada', '⚔️ Espada', 15, 500],
    ['katana', '🗡️ Katana', 30, 1200],
    ['machado', '🪓 Machado', 50, 2500],
    ['lanca', '🔱 Lança', 80, 4000],
    ['martelo', '🔨 Martelo', 120, 7000],
    ['foice', '🌙 Foice', 200, 12000],
    ['espada_lendaria', '⚔️ Espada Lendária', 400, 30000],
    ['arma_mistica', '✨ Arma Mística', 800, 70000],
    ['arma_divina', '👑 Arma Divina', 1500, 150000],
  ],

  fogo: [
    ['pistola', '🔫 Pistola', 5, 500],
    ['revólver', '🔫 Revólver', 10, 1000],
    ['submetralhadora', '🔫 Submetralhadora', 20, 2500],
    ['fuzil', '🔫 Fuzil', 30, 5000],
    ['escopeta', '🔫 Escopeta', 50, 9000],
    ['rifle', '🎯 Rifle', 80, 15000],
    ['sniper', '🎯 Sniper', 120, 25000],
    ['fuzil_lendario', '🔥 Fuzil Lendário', 250, 50000],
    ['arma_elite', '💥 Arma de Elite', 500, 100000],
    ['arma_suprema', '👑 Arma Suprema', 1000, 250000],
  ],

  explosivos: [
    ['granada', '💣 Granada', 10, 1000],
    ['granada_frag', '💣 Granada Fragmentação', 20, 2500],
    ['explosivo', '🧨 Explosivo', 40, 6000],
    ['bomba', '💣 Bomba', 80, 15000],
    ['bomba_forte', '💥 Bomba Pesada', 150, 30000],
    ['explosivo_militar', '💣 Explosivo Militar', 300, 60000],
    ['explosivo_elite', '🔥 Explosivo Elite', 600, 120000],
    ['explosivo_lendario', '👑 Explosivo Lendário', 1200, 250000],
  ],

  castelos: [
    ['castelo1', '🏚️ Castelo I', 100, 5000],
    ['castelo2', '🏰 Castelo II', 300, 15000],
    ['castelo3', '🏯 Castelo III', 1000, 40000],
    ['castelo4', '🏰 Castelo IV', 2500, 100000],
    ['castelo5', '👑 Castelo V', 5000, 250000],
  ],

  segurancas: [
    ['seguranca1', '👮 Segurança Básico', 10, 2000],
    ['seguranca2', '🛡️ Segurança Armado', 25, 6000],
    ['seguranca3', '👮 Segurança Elite', 50, 15000],
    ['seguranca4', '🛡️ Equipe de Segurança', 100, 35000],
    ['seguranca5', '👑 Segurança Especial', 250, 80000],
  ],
}

function todasCategorias() {
  return Object.values(itens).flat()
}

function procurar(nome) {
  const termo = String(nome || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return todasCategorias().find(x => {
    const id = String(x[0] || "").toLowerCase()
    const descricao = String(x[1] || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return id === termo || descricao.includes(termo)
  })
}

export const lojaCommands = [
  {
    name: 'menuloja',
    aliases: ['loja', 'lojagold'],
    async execute({ reply }) {
      return reply(
`╭━━━━━━「 🏪 LOJA GOLD 」━━━━━━╮

🛡️ *ESCUDOS*
▸ !lojaescudos

⚔️ *ARMAS BRANCAS*
▸ !lojaarmas

🔫 *ARMAS DE FOGO*
▸ !lojafogo

💣 *EXPLOSIVOS*
▸ !lojabombas

🏰 *CASTELOS*
▸ !lojacastelos

👮 *SEGURANÇA*
▸ !lojaseguranca

🦹 *LIMITE DE ROUBOS*
▸ !comprarroubo 10
▸ !comprarroubo 20

🎒 *SEU INVENTÁRIO*
▸ !inventario

🛒 *COMPRAR*
▸ !comprar nome

╰━━━━━━━━━━━━━━━━━━━━━━╯`
      )
    },
  },

  {
    name: 'lojaescudos',
    async execute({ reply }) {
      return reply(
        `🛡️ *ESCUDOS*\n\n` +
        itens.escudos
          .map(x => `${x[1]}\n🛡️ Defesa: ${x[2]}\n💰 ${x[3]} Gold\n🛒 !comprar ${x[0]}\n`)
          .join('\n')
      )
    },
  },

  {
    name: 'lojaarmas',
    async execute({ reply }) {
      return reply(
        `⚔️ *ARMAS BRANCAS*\\n\\n` +
        itens.armas
          .map(x => `${x[1]}\\n💥 Potência: ${x[2]}\\n💰 ${x[3]} Gold\\n🛒 !comprar ${x[0]}\\n`)
          .join('\\n')
      )
    },
  },

  {
    name: 'lojafogo',
    async execute({ reply }) {
      return reply(
        `🔫 *ARMAS DE FOGO*\n\n` +
        itens.fogo
          .map(x => `${x[1]}\n💥 Potência: ${x[2]}\n💰 ${x[3]} Gold\n🛒 !comprar ${x[0]}\n`)
          .join('\n')
      )
    },
  },

  {
    name: 'lojacastelos',
    async execute({ reply }) {
      return reply(
        `🏰 *CASTELOS*\n\n` +
        itens.castelos
          .map(x => `${x[1]}\n🛡️ Defesa: ${x[2]}\n💰 ${x[3]} Gold\n🛒 !comprar ${x[0]}\n`)
          .join('\n')
      )
    },
  },

  {
    name: 'lojaseguranca',
    async execute({ reply }) {
      return reply(
        `👮 *SEGURANÇA*\n\n` +
        itens.segurancas
          .map(x => `${x[1]}\n🛡️ Defesa: ${x[2]}\n💰 ${x[3]} Gold\n🛒 !comprar ${x[0]}\n`)
          .join('\n')
      )
    },
  },

  {
    name: 'lojabombas',
    async execute({ reply }) {
      return reply(
        `💣 *EXPLOSIVOS*\n\n` +
        itens.explosivos
          .map(x => `${x[1]}\n💥 Potência: ${x[2]}\n💰 ${x[3]} Gold\n🛒 !comprar ${x[0]}\n`)
          .join('\n')
      )
    },
  },

  {
    name: 'comprar',
    async execute({ reply, sender, args }) {
      const nome = String(args?.join(' ') || '').trim().toLowerCase()
      const item = procurar(nome)

      if (!item) {
        return reply(
          `❌ Item não encontrado.\n\n` +
          `Use *!menuloja* para ver os produtos.`
        )
      }

      const db = await getDatabase()
      const usuario = db.data.users[sender] || {}
      const saldo = Number(usuario.gold || 0)

      if (saldo < item[3]) {
        return reply(
          `❌ *GOLD INSUFICIENTE!*\n\n` +
          `${item[1]}\n` +
          `💰 Preço: *${item[3]} Gold*\n` +
          `🪙 Seu Gold: *${saldo}*`
        )
      }

      usuario.gold = saldo - item[3]
      usuario.inventory ||= {}
      usuario.inventory[item[0]] = Number(usuario.inventory[item[0]] || 0) + 1

      // EQUIPAMENTO AUTOMÁTICO
      // Índice: [nome, descrição, poder/defesa, preço]
      const nomeItem = item[0]

      if (itens.escudos.some(x => x[0] === nomeItem)) {
        const defesaNova = Number(item[2])
        const defesaEquip = Number(usuario.escudoDefesa || 0)

        if (defesaNova >= defesaEquip) {
          usuario.escudoEquipada = {
            nome: nomeItem,
            descricao: item[1],
            defesa: defesaNova,
          }
        }
      }

      if (
        itens.armas.some(x => x[0] === nomeItem) ||
        itens.fogo.some(x => x[0] === nomeItem) ||
        itens.explosivos.some(x => x[0] === nomeItem)
      ) {
        const potenciaNova = Number(item[2])
        const potenciaAtual = Number(usuario.armaEquipada?.potencia || 0)

        if (potenciaNova >= potenciaAtual) {
          usuario.armaEquipada = {
            nome: nomeItem,
            descricao: item[1],
            potencia: potenciaNova,
          }
        }
      }

      if (itens.castelos.some(x => x[0] === nomeItem)) {
        const defesaNova = Number(item[2])
        const defesaCastelo = Number(usuario.casteloDefesa || 0)

        if (defesaNova >= defesaCastelo) {
          usuario.casteloEquipada = {
            nome: nomeItem,
            descricao: item[1],
            defesa: defesaNova,
          }
        }
      }

      if (itens.segurancas.some(x => x[0] === nomeItem)) {
        const defesaNova = Number(item[2])
        const defesaSeguranca = Number(usuario.segurancaDefesa || 0)

        if (defesaNova >= defesaSeguranca) {
          usuario.segurancaEquipada = {
            nome: nomeItem,
            descricao: item[1],
            defesa: defesaNova,
          }
        }
      }

      // Recalcula a defesa total depois da compra.
      const defesaAnterior = Number(usuario.defesaAtual || 0)
      const defesaEquipamentos =
        Number(usuario.escudoEquipada?.defesa || 0) +
        Number(usuario.casteloEquipada?.defesa || 0) +
        Number(usuario.segurancaEquipada?.defesa || 0)

      usuario.escudoDefesa = Number(usuario.escudoEquipada?.defesa || 0)
      usuario.casteloDefesa = Number(usuario.casteloEquipada?.defesa || 0)
      usuario.segurancaDefesa = Number(usuario.segurancaEquipada?.defesa || 0)

      // Compra de uma nova defesa restaura a proteção para o novo total,
      // sem permitir que uma compra inferior reduza uma defesa já existente.
      usuario.defesaAtual = Math.max(defesaAnterior, defesaEquipamentos)

      db.data.users[sender] = {
        ...usuario,
        jid: sender,
      }

      await db.write()

      let equipado = ''

      if (usuario.armaEquipada?.nome === nomeItem) {
        equipado = `\n⚔️ Arma equipada: *${item[1]}*`
      } else if (usuario.escudoEquipada?.nome === nomeItem) {
        equipado = `\n🛡️ Escudo equipado: *${item[1]}*`
      } else if (usuario.casteloEquipada?.nome === nomeItem) {
        equipado = `\n🏰 Castelo equipado: *${item[1]}*`
      } else if (usuario.segurancaEquipada?.nome === nomeItem) {
        equipado = `\n👮 Segurança equipada: *${item[1]}*`
      }

      return reply(
        `🛒 *COMPRA REALIZADA!*\n\n` +
        `${item[1]}\n` +
        `💰 Valor: *${item[3]} Gold*\n` +
        `🪙 Saldo restante: *${usuario.gold} Gold*` +
        equipado +
        `\n🛡️ Defesa total: *${usuario.defesaAtual}*`
      )
    },
  },

  {
    name: 'inventario',
    aliases: ['meusitens', 'equipamentos'],
    async execute({ reply, sender }) {
      const db = await getDatabase()
      const usuario = db.data.users[sender] || {}
      const inventario = usuario.inventory || {}

      const linhas = Object.entries(inventario)
        .filter(([, qtd]) => Number(qtd) > 0)
        .map(([nome, qtd]) => {
          const item = procurar(nome)
          return item
            ? `${item[1]} × *${qtd}*`
            : `📦 ${nome} × *${qtd}*`
        })

      return reply(
        `🎒 *SEU INVENTÁRIO*\n\n` +
        (linhas.length ? linhas.join('\n') : '📭 Seu inventário está vazio.')
      )
    },
  },

  {
    name: 'comprarroubo',
    async execute({ reply, sender, args }) {
      const limite = Number(args?.[0])

      const precos = {
        10: 5000,
        20: 15000,
      }

      if (!precos[limite]) {
        return reply(
          `🦹 *LICENÇAS DE ROUBO*\n\n` +
          `🥉 10 roubos/24h — *5.000 Gold*\n` +
          `👑 20 roubos/24h — *15.000 Gold*\n\n` +
          `Exemplo: *!comprarroubo 10*`
        )
      }

      const db = await getDatabase()
      const usuario = db.data.users[sender] || {}
      const saldo = Number(usuario.gold || 0)

      if (saldo < precos[limite]) {
        return reply(
          `❌ Você precisa de *${precos[limite]} Gold*.\n` +
          `🪙 Seu saldo: *${saldo} Gold*`
        )
      }

      usuario.gold = saldo - precos[limite]
      usuario.robberyLimit = Math.max(Number(usuario.robberyLimit || 5), limite)

      db.data.users[sender] = {
        ...usuario,
        jid: sender,
      }

      await db.write()

      return reply(
        `🦹 *LICENÇA COMPRADA!*\n\n` +
        `🎯 Limite: *${limite} roubos/24h*\n` +
        `💰 Pago: *${precos[limite]} Gold*\n` +
        `🪙 Saldo: *${usuario.gold} Gold*`
      )
    },
  },
]
