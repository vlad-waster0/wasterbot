import { getDatabase } from '../database.js'
import { isGroupAdmin } from './admin.js'

const regrasPadrao = `❗PREFIXO DO BOT: (!)

*Regras:*

❌ Mencionar grupo
❌ Flodar (msg, comandos, figus etc)
❌ Conteúdo +18 ou gore
❌ Links sem ser no comando
❌ Divulgações (permissão de ADMs)
❌ Proibido outros bots, apenas o Waster
❌ Fazer figurinha de membros e admins do grupo sem a permissão do mesmo
❌ RESTRITAMENTE PROIBIDO CHAMAR O PV DO BOT (somente se tiver o plano)

✅ Respeito acima de tudo
✅ Brincadeiras e xingamentos (com moderação é claro)

⚠️ 3 advertências = ban 🔪
⚠️ Não fique apagando comando, se apagar mais de uma vez = advertência

🌐 Bot: !menu
🌐 Link do grupo: !linkgrupo
🌐 Dúvidas: PV dos ADMs
🌐 Site do bot:
🌐 Alugar o bot: !alugarbot`

const GRUPO_PRINCIPAL = '120363429166774820@g.us'

function obterRegrasSalvas(db, groupJid) {
  const regrasSalvas = db.data.groups[groupJid]?.regras
  if (regrasSalvas !== undefined) return regrasSalvas
  return groupJid === GRUPO_PRINCIPAL ? regrasPadrao : ''
}

export const regrasCommands = [
  {
    name: 'regras',
    aliases: ['rules', 'regrasgrupo'],
    description: 'Exibe as regras do grupo.',

    async execute({ reply, message }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      const db = await getDatabase()
      const personalizado = db.data.groups[groupJid]?.menu || {}
      const botName = personalizado.botName || 'Waster Bot'
      const regras = obterRegrasSalvas(db, groupJid)

      const regrasExibidas = regras.replace(
        '❌ Proibido outros bots, apenas o Waster',
        `❌ Proibido outros bots, apenas o Waster`
      )

      return reply(`╭━━━━━━「 📜 REGRAS 」━━━━━━╮
${regrasExibidas}
╰━━━━━━━━━━━━━━━━━━━━━━╯`)
    },
  },

  {
    name: 'editarregras',
    aliases: ['alterarregras', 'editregras'],
    description: 'Edita as regras do grupo.',

    async execute({ reply, sender, sock, message, args }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
        return reply('❌ Apenas administradores do grupo podem editar as regras.')
      }

      const novoTexto = args?.join(' ').trim()

      if (!novoTexto) {
        return reply(`❌ Informe as novas regras.

Exemplo:
!editarregras Respeite todos os membros. Sem spam. Sem divulgação sem permissão.`)
      }

      const db = await getDatabase()

      db.data.groups[groupJid] ||= {}
      db.data.groups[groupJid].regras = novoTexto

      await db.write()

      return reply(`✅ *REGRAS ATUALIZADAS!*

As novas regras deste grupo foram salvas.

Use *!regras* para visualizar.`)
    },
  },
]
