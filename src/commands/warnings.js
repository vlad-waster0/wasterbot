export const warningCommands = [
  {
    name: 'advertir',
    aliases: ['warn'],
    description: 'Adverte um usuário do grupo.',

    async execute({ reply, sender, message, args, sock }) {
      const groupJid = message.key.remoteJid
      const target =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!target) {
        return reply('❌ Marque o usuário que receberá a advertência.')
      }

      const motivo = args.filter(a => !a.startsWith('@')).join(' ') || 'Sem motivo informado'

      const metadata = await sock.groupMetadata(groupJid)
      const participante = metadata.participants.find(
        p => p.id === target || p.phoneNumber === target
      )

      if (!participante) {
        return reply('❌ Usuário não encontrado no grupo.')
      }

      const { getDatabase } = await import('../database.js')
      const db = await getDatabase()

      const grupo = db.data.groups[groupJid] || {}
      grupo.warnings ||= {}
      grupo.warnings[target] ||= []

      grupo.warnings[target].push({
        motivo,
        date: new Date().toISOString(),
        by: sender,
      })

      db.data.groups[groupJid] = grupo
      await db.write()

      const total = grupo.warnings[target].length

      if (total >= 3) {
        try {
          await sock.groupParticipantsUpdate(groupJid, [target], 'remove')

          delete grupo.warnings[target]
          await db.write()

          return reply(`🚫 *USUÁRIO BANIDO*

👤 Usuário: @${target.split('@')[0]}
⚠️ Motivo: atingiu *3/3 advertências*.

O usuário foi removido automaticamente do grupo.`)
        } catch (error) {
          console.error('Erro ao remover usuário:', error)

          return reply(`⚠️ *3/3 ADVERTÊNCIAS*

👤 Usuário: @${target.split('@')[0]}

Não consegui remover o usuário automaticamente.
Verifique se o bot é administrador do grupo.`)
        }
      }

      return reply(`⚠️ *ADVERTÊNCIA APLICADA*

👤 Usuário: @${target.split('@')[0]}
⚠️ Advertências: *${total}/3*

📝 Motivo: ${motivo}

🚨 Ao atingir *3 advertências*, o usuário será removido do grupo.`)
    },
  },

  {
    name: 'advertencias',
    aliases: ['warnings', 'warns'],
    description: 'Mostra as advertências de um usuário.',

    async execute({ reply, message }) {
      const target =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

      if (!target) {
        return reply('❌ Marque o usuário para consultar as advertências.')
      }

      const { getDatabase } = await import('../database.js')
      const db = await getDatabase()

      const groupJid = message.key.remoteJid
      const grupo = db.data.groups[groupJid] || {}
      const lista = grupo.warnings?.[target] || []

      let texto = `📋 *STATUS DE ADVERTÊNCIAS*

👤 *Usuário*: @${target.split('@')[0]}
⚠️ *Advertências*: ${lista.length}/3`

      if (lista.length) {
        texto += '\n\n📝 *Motivos registrados*:'

        lista.forEach((item, index) => {
          texto += `\n${index + 1}. ${item.motivo}`
        })
      } else {
        texto += '\n\n✅ Nenhuma advertência registrada.'
      }

      return reply(texto)
    },
  },

  {
    name: 'removeradvertencia',
    aliases: ['tiraradvertencia', 'delwarn', 'unwarn'],
    description: 'Remove uma advertência de um usuário.',

    async execute({ reply, message }) {
      const target =
        message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

      if (!target) {
        return reply('❌ Marque o usuário que terá uma advertência removida.')
      }

      const { getDatabase } = await import('../database.js')
      const db = await getDatabase()

      const groupJid = message.key.remoteJid
      const grupo = db.data.groups[groupJid] || {}
      const lista = grupo.warnings?.[target] || []

      if (!lista.length) {
        return reply('✅ Esse usuário não possui advertências.')
      }

      lista.pop()

      if (lista.length) {
        grupo.warnings[target] = lista
      } else {
        delete grupo.warnings[target]
      }

      db.data.groups[groupJid] = grupo
      await db.write()

      return reply(`✅ *ADVERTÊNCIA REMOVIDA*

👤 Usuário: @${target.split('@')[0]}
⚠️ Advertências atuais: *${lista.length}/3*`)
    },
  },
]
