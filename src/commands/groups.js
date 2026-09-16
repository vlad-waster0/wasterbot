import { isGroupAdmin } from './admin.js'

async function mentioned(message, sock) {
  const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  const groupJid = message.key?.remoteJid

  if (!groupJid?.endsWith('@g.us') || !mentions.length) return mentions

  try {
    const metadata = await sock.groupMetadata(groupJid)
    return mentions.map(target => {
      const participante = (metadata.participants || []).find(
        p => p.id === target ||
             p.lid === target ||
             p.phoneNumber === target
      )

      return participante?.phoneNumber || target
    })
  } catch (error) {
    console.error('ERRO AO RESOLVER MENÇÃO:', error)
    return mentions
  }
}

async function requireAdmin({ sock, message, sender, reply }) {
  const groupJid = message.key.remoteJid

  if (!groupJid?.endsWith('@g.us')) {
    await reply('❌ Este comando só pode ser usado em grupos.')
    return false
  }

  const admin = await isGroupAdmin(sock, groupJid, sender, message)

  if (!admin) {
    await reply('❌ Apenas administradores do grupo podem usar este comando.')
    return false
  }

  return true
}

export const groupCommands = [
  {
    name: 'todos',
    aliases: [],
    description: 'Menciona todos os membros.',

    async execute({ sock, message, reply, sender }) {
      if (!(await requireAdmin({ sock, message, sender, reply }))) return

      const groupJid = message.key.remoteJid
      const metadata = await sock.groupMetadata(groupJid)
      const participants = metadata.participants || []

      const mentions = participants.map(p => p.id)

      const texto = participants
        .map(p => `@${(p.phoneNumber || p.id).split('@')[0]}`)
        .join('\n')

      await sock.sendMessage(
        groupJid,
        {
          text: `📢 *MENSAGEM A TODOS!*\n\n${texto}`,
          mentions,
        },
        { quoted: message }
      )
    },
  },

  {
    name: 'ban',
    aliases: ['remover'],
    description: 'Expulsa um membro do grupo.',

    async execute({ sock, message, reply, sender }) {
      if (!(await requireAdmin({ sock, message, sender, reply }))) return

      const groupJid = message.key.remoteJid
      const targets = await mentioned(message, sock)

      if (!targets.length) {
        return reply('❌ Marque o usuário que deseja banir.')
      }

      const metadata = await sock.groupMetadata(groupJid)
      const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'

      if (targets.some(target => target === botJid || target === sock.user?.id)) {
        return reply('❌ Eu não posso banir a mim mesmo.')
      }

      try {
        await sock.groupParticipantsUpdate(groupJid, targets, 'remove')

        return reply(
          `👢 *USUÁRIO REMOVIDO!*\n\n` +
          targets.map(target => `👤 @${target.split('@')[0]}`).join('\n')
        )
      } catch (error) {
        console.error('ERRO AO EXPULSAR:', error)
        return reply('❌ Não consegui banir o usuário. Verifique se o bot é administrador.')
      }
    },
  },

  {
    name: 'adm',
    aliases: [],
    description: 'Promove um membro a administrador.',

    async execute({ sock, message, reply, sender }) {
      if (!(await requireAdmin({ sock, message, sender, reply }))) return

      const groupJid = message.key.remoteJid
      const targets = await mentioned(message, sock)

      if (!targets.length) {
        return reply('❌ Marque o usuário que deseja tornar administrador.')
      }

      try {
        await sock.groupParticipantsUpdate(groupJid, targets, 'promote')

        return reply(
          `⬆️ *PROMOVIDO A ADMINISTRADOR!*\n\n` +
          targets.map(target => `👤 @${target.split('@')[0]}`).join('\n')
        )
      } catch (error) {
        console.error('ERRO AO PROMOVER:', error)
        return reply('❌ Não consegui tornar administrador o usuário. Verifique se o bot é administrador.')
      }
    },
  },

  {
    name: 'removeradm',
    aliases: [],
    description: 'Remove o administrador de um membro.',

    async execute({ sock, message, reply, sender }) {
      if (!(await requireAdmin({ sock, message, sender, reply }))) return

      const groupJid = message.key.remoteJid
      const targets = await mentioned(message, sock)

      if (!targets.length) {
        return reply('❌ Marque o administrador que deseja remover.')
      }

      try {
        await sock.groupParticipantsUpdate(groupJid, targets, 'demote')

        return reply(
          `⬇️ *ADMINISTRADOR REBAIXADO!*\n\n` +
          targets.map(target => `👤 @${target.split('@')[0]}`).join('\n')
        )
      } catch (error) {
        console.error('ERRO AO REBAIXAR:', error)
        return reply('❌ Não consegui remover a administração de o usuário. Verifique se o bot é administrador.')
      }
    },
  },
]

export const addCommand = {
  name: 'add',
  aliases: [],
  description: 'Adiciona um número ao grupo.',
  async execute({ sock, message, reply, sender, args }) {
    if (!(await requireAdmin({ sock, message, sender, reply }))) return

    const groupJid = message.key.remoteJid
    let numero = args[0]?.replace(/\D/g, '')

    if (!numero) {
      return reply('❌ Informe o número. Exemplo: !add 5511999999999')
    }

    if (numero.length < 10) {
      return reply('❌ Número inválido. Use o número com DDD e código do país.')
    }

    const jid = `${numero}@s.whatsapp.net`

    try {
      await sock.groupParticipantsUpdate(groupJid, [jid], 'add')
      return reply(`✅ Usuário ${numero} foi adicionado ao grupo.`)
    } catch (error) {
      console.error('ERRO AO ADICIONAR:', error)
      return reply('❌ Não consegui adicionar esse número. Verifique se o bot é administrador do grupo e se o número está correto.')
    }
  },
}

export const muteCommand = {
  name: 'mute',
  aliases: ['silenciar'],
  description: 'Silencia um membro para os comandos do bot.',
  async execute({ sock, message, reply, sender }) {
    if (!(await requireAdmin({ sock, message, sender, reply }))) return

    const groupJid = message.key.remoteJid
    const targets = await mentioned(message, sock)

    if (!targets.length) {
      return reply('❌ Marque o usuário que deseja silenciar.')
    }

    const db = await (await import('../database.js')).getDatabase()
    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].muted ||= {}

    for (const target of targets) {
      db.data.groups[groupJid].muted[target] = true
    }

    await db.write()

    return reply(
      `🔇 *USUÁRIO SILENCIADO!*\n\n` +
      targets.map(target => `👤 @${target.split('@')[0]}`).join('\n')
    )
  },
}

export const unmuteCommand = {
  name: 'desmute',
  aliases: ['dessilenciar', 'unmute'],
  description: 'Remove o silêncio de um membro.',
  async execute({ sock, message, reply, sender }) {
    if (!(await requireAdmin({ sock, message, sender, reply }))) return

    const groupJid = message.key.remoteJid
    const targets = await mentioned(message, sock)

    if (!targets.length) {
      return reply('❌ Marque o usuário que deseja desmutar.')
    }

    const db = await (await import('../database.js')).getDatabase()
    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].muted ||= {}

    for (const target of targets) {
      delete db.data.groups[groupJid].muted[target]
    }

    await db.write()

    return reply(
      `🔊 *USUÁRIO DESMUTADO!*\n\n` +
      targets.map(target => `👤 @${target.split('@')[0]}`).join('\n')
    )
  },
}

export const reportCommand = {
  name: 'reportar',
  aliases: ['denunciar', 'report'],
  description: 'Reporta um membro aos administradores do grupo.',
  async execute({ sock, message, reply, sender }) {
    const groupJid = message.key.remoteJid

    if (!groupJid?.endsWith('@g.us')) {
      return reply('❌ Este comando só pode ser usado em grupos.')
    }

    const texto =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      ''

    const contexto = message.message?.extendedTextMessage?.contextInfo
    const mencionado =
      contexto?.mentionedJid?.[0] ||
      contexto?.participant ||
      null

    if (!mencionado) {
      return reply('⚠️ Mencione a pessoa que deseja reportar.\n\nExemplo:\n!reportar @usuário spam')
    }

    const motivo = texto
      .replace(/^!reportar\s*/i, '')
      .replace(/^@[\d]+/i, '')
      .trim()

    if (!motivo) {
      return reply('⚠️ Informe o motivo do reporte.\n\nExemplo:\n!reportar @usuário spam')
    }

    const db = await (await import('../database.js')).getDatabase()

    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].reports ||= {}
    db.data.groups[groupJid].reports[mencionado] ||= []

    db.data.groups[groupJid].reports[mencionado].push({
      reporter: sender,
      motivo,
      timestamp: Date.now(),
    })

    await db.write()

    const metadata = await sock.groupMetadata(groupJid)

    const admins = (metadata.participants || [])
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id)

    const nome = mencionado.split('@')[0]

    const mensagem =
      `🚨 *NOVO REPORTE*\n\n` +
      `👤 *Usuário reportado:* @${nome}\n` +
      `📝 *Motivo:* ${motivo}\n` +
      `👮 *Reportado por:* @${sender.split('@')[0]}\n\n` +
      `⚠️ Administradores, verifiquem a situação.`

    const mentions = [...new Set([mencionado, sender, ...admins])]

    await sock.sendMessage(
      groupJid,
      {
        text: mensagem,
        mentions,
      },
      { quoted: message }
    )
  },
}

export const removeReportCommand = {
  name: 'removerreportar',
  aliases: ['removerreporte', 'delreportar', 'delreport'],
  description: 'Remove os reportes de um membro.',
  async execute({ sock, message, reply, sender }) {
    if (!(await requireAdmin({ sock, message, sender, reply }))) return

    const groupJid = message.key.remoteJid
    const contexto = message.message?.extendedTextMessage?.contextInfo

    const mencionado =
      contexto?.mentionedJid?.[0] ||
      contexto?.participant ||
      null

    if (!mencionado) {
      return reply('⚠️ Mencione o usuário que deseja limpar os reportes.')
    }

    const db = await (await import('../database.js')).getDatabase()

    const reports = db.data.groups[groupJid]?.reports?.[mencionado] || []

    if (!reports.length) {
      return reply('ℹ️ Este usuário não possui reportes registrados.')
    }

    delete db.data.groups[groupJid].reports[mencionado]

    await db.write()

    return reply(
      `✅ *REPORTES REMOVIDOS!*\n\n` +
      `👤 Usuário: @${mencionado.split('@')[0]}\n` +
      `🗑️ Reportes removidos: ${reports.length}`,
      { mentions: [mencionado] }
    )
  },
}

export const groupSettingsCommands = [
  {

    name: 'fechargrupo',
    aliases: ['fechar'],
    description: 'Fecha o grupo para membros.',
    async execute({ reply, message, sock }) {
      const groupJid = message.key.remoteJid
      if (!groupJid?.endsWith('@g.us')) return reply('❌ Este comando só pode ser usado em grupos.')
      const admin = await isGroupAdmin(sock, groupJid, message.key.participant, message)
      if (!admin) return reply('❌ Apenas administradores podem fechar o grupo.')
      try {
        await sock.groupSettingUpdate(groupJid, 'announcement')
        return reply('🔒 Grupo fechado. Apenas administradores podem enviar mensagens.')
      } catch (error) {
        console.error('ERRO AO FECHAR GRUPO:', error)
        return reply('❌ Não consegui fechar o grupo. Verifique se o bot é administrador.')
      }
    },
  },
  {
    name: 'abrirgrupo',
    aliases: ['abrir'],
    description: 'Abre o grupo para todos os membros.',
    async execute({ reply, message, sock }) {
      const groupJid = message.key.remoteJid
      if (!groupJid?.endsWith('@g.us')) return reply('❌ Este comando só pode ser usado em grupos.')
      const admin = await isGroupAdmin(sock, groupJid, message.key.participant, message)
      if (!admin) return reply('❌ Apenas administradores podem abrir o grupo.')
      try {
        await sock.groupSettingUpdate(groupJid, 'not_announcement')
        return reply('🔓 Grupo aberto. Todos os membros podem enviar mensagens.')
      } catch (error) {
        console.error('ERRO AO ABRIR GRUPO:', error)
        return reply('❌ Não consegui abrir o grupo. Verifique se o bot é administrador.')
      }
    },
  },
]

export const ativarBemvindoCommand = {
  name: 'ativarbemvindo',
  aliases: ['bemvindo', 'bemvindoon', 'welcome'],
  description: 'Ativa a mensagem de boas-vindas.',
  async execute({ message, reply, sender, sock }) {
    if (!(await requireAdmin({ sock, message, sender, reply }))) return

    const groupJid = message.key.remoteJid
    const db = await (await import('../database.js')).getDatabase()

    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].welcome ||= {}
    db.data.groups[groupJid].welcome.enabled = true
    db.data.groups[groupJid].welcome.message =
      '👋 Bem-vindo(a), @usuário!\n📝 Se apresente com nome, idade e foto.'

    await db.write()

    return reply('✅ *BEM-VINDO ATIVADO!*\n\nAgora o bot dará boas-vindas quando alguém entrar no grupo.')
  },
}

export const ativarSaidaCommand = {
  name: 'ativarsaida',
  aliases: ['said on', 'saidaon'],
  description: 'Ativa a mensagem quando alguém sair do grupo.',
  async execute({ message, reply, sender, sock }) {
    if (!(await requireAdmin({ sock, message, sender, reply }))) return

    const groupJid = message.key.remoteJid
    const { getDatabase } = await import('../database.js')
    const db = await getDatabase()

    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].leave ||= {}
    db.data.groups[groupJid].leave.enabled = true

    await db.write()

    return reply('✅ *SAÍDA ATIVADA!*\n\nAgora o bot avisará quando alguém sair do grupo.')
  },
}

export const desativarSaidaCommand = {
  name: 'desativarsaida',
  aliases: ['said off', 'saidaoff'],
  description: 'Desativa a mensagem quando alguém sair do grupo.',
  async execute({ message, reply, sender, sock }) {
    if (!(await requireAdmin({ sock, message, sender, reply }))) return

    const groupJid = message.key.remoteJid
    const { getDatabase } = await import('../database.js')
    const db = await getDatabase()

    db.data.groups[groupJid] ||= {}
    db.data.groups[groupJid].leave ||= {}
    db.data.groups[groupJid].leave.enabled = false

    await db.write()

    return reply('❌ *SAÍDA DESATIVADA!*\n\nO bot não avisará mais quando alguém sair do grupo.')
  },
}
