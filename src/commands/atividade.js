import { getDatabase } from '../database.js'

function garantirAtividade(db, grupo, usuario) {
  db.data.groups[grupo] ||= {}
  db.data.groups[grupo].activity ||= {}
  db.data.groups[grupo].activity[usuario] ||= {
    mensagens: 0,
    comandos: 0,
    figurinhas: 0,
    midias: 0,
  }

  return db.data.groups[grupo].activity[usuario]
}

function nivelAtividade(total) {
  if (total >= 500) return '🔥 MUITO ATIVO'
  if (total >= 200) return '🟢 ATIVO'
  if (total >= 50) return '🟡 POUCO ATIVO'
  return '🔴 INATIVO'
}

export async function registrarAtividade(message, tipo = 'mensagem') {
  const grupo = message?.key?.remoteJid
  if (!grupo?.endsWith('@g.us')) return

  const usuario =
    message?.key?.participantAlt ||
    message?.key?.participant ||
    message?.participant

  if (!usuario) return

  const db = await getDatabase()
  const atividade = garantirAtividade(db, grupo, usuario)

  if (tipo === 'comando') atividade.comandos++
  else if (tipo === 'figurinha') atividade.figurinhas++
  else if (tipo === 'midia') atividade.midias++
  else atividade.mensagens++

  await db.write()
}

export const atividadeCommands = [
  {
    name: 'checkativo',
    aliases: ['atividade', 'veratividade'],
    async execute({ sock, message, args, sender, mentions = [] }) {
      const grupo = message?.key?.remoteJid

      if (!grupo?.endsWith('@g.us')) {
        return sock.sendMessage(grupo, {
          text: '❌ Este comando só pode ser usado em grupos.'
        })
      }

      const alvo = mentions[0] || sender
      const db = await getDatabase()
      const atividade = db.data.groups[grupo]?.activity?.[alvo] || {
        mensagens: 0,
        comandos: 0,
        figurinhas: 0,
        midias: 0,
      }

      const total =
        atividade.mensagens +
        atividade.comandos +
        atividade.figurinhas +
        atividade.midias

      const texto = `📊 *ATIVIDADE DO USUÁRIO*

👤 Usuário: @${alvo.split('@')[0]}

💬 Mensagens: ${atividade.mensagens}
⚙️ Comandos: ${atividade.comandos}
🎨 Figurinhas: ${atividade.figurinhas}
🖼️ Mídias: ${atividade.midias}

📈 Total de atividades: ${total}

📌 Status: ${nivelAtividade(total)}`

      return sock.sendMessage(grupo, {
        text: texto,
        mentions: [alvo]
      })
    }
  },

  {
    name: 'rankingatividade',
    aliases: ['rankingativo', 'rankatividade'],
    async execute({ sock, message }) {
      const grupo = message?.key?.remoteJid

      if (!grupo?.endsWith('@g.us')) {
        return sock.sendMessage(grupo, {
          text: '❌ Este comando só pode ser usado em grupos.'
        })
      }

      const db = await getDatabase()
      const atividades = db.data.groups[grupo]?.activity || {}

      const ranking = Object.entries(atividades)
        .map(([jid, dados]) => {
          const total =
            (dados.mensagens || 0) +
            (dados.comandos || 0) +
            (dados.figurinhas || 0) +
            (dados.midias || 0)

          return { jid, ...dados, total }
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)

      if (!ranking.length) {
        return sock.sendMessage(grupo, {
          text: '📊 Ainda não há dados de atividade neste grupo.'
        })
      }

      const linhas = ranking.map((item, index) =>
        `${index + 1}. @${item.jid.split('@')[0]} — ${item.total} atividades`
      )

      return sock.sendMessage(grupo, {
        text: `🏆 *RANKING DE ATIVIDADE*

${linhas.join('\n')}

💬 Mensagens • ⚙️ Comandos • 🎨 Figurinhas • 🖼️ Mídias`,
        mentions: ranking.map(item => item.jid)
      })
    }
  }
]
