import { getDatabase } from '../database.js'
import { config } from '../config.js'
import { isGroupAdmin } from './admin.js'

export const antipalavraCommands = [
  {
    name: 'antipalavra',
    aliases: ['anti-palavra'],
    description: 'Configura o Anti-Palavra do grupo.',
    async execute({ sock, message, args, reply, sender }) {
      const groupJid = message.key.remoteJid

      if (!groupJid?.endsWith('@g.us')) {
        return reply('❌ Este comando só pode ser usado em grupos.')
      }

      if (!(await isGroupAdmin(sock, groupJid, sender, message))) {
        return reply('❌ Apenas administradores do grupo podem configurar o Anti-Palavra.')
      }

      const db = await getDatabase()
      db.data.groups[groupJid] ||= {}

      const opcao = String(args[0] || '').toLowerCase()
      const palavra = args.slice(1).join(' ').trim()

      db.data.groups[groupJid].antipalavra ||= {
        enabled: false,
        words: [],
      }

      const anti = db.data.groups[groupJid].antipalavra

      if (!opcao) {
        return reply(
          `🚫 *ANTI-PALAVRA*\n\n` +
          `Status: ${anti.enabled ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n` +
          `Palavras cadastradas: ${anti.words.length}\n\n` +
          `Use:\n` +
          `▸ !antipalavra on — ativar\n` +
          `▸ !antipalavra off — desativar\n` +
          `▸ !antipalavra add palavra — adicionar\n` +
          `▸ !antipalavra del palavra — remover\n` +
          `▸ !antipalavra lista — listar`
        )
      }

      if (['on', 'ativar'].includes(opcao)) {
        anti.enabled = true
        await db.write()
        return reply('🚫 *ANTI-PALAVRA ATIVADO!*\n\nPalavras cadastradas serão bloqueadas.')
      }

      if (['off', 'desativar'].includes(opcao)) {
        anti.enabled = false
        await db.write()
        return reply('🚫 *ANTI-PALAVRA DESATIVADO!*\n\nAs palavras cadastradas não serão bloqueadas.')
      }

      if (['add', 'adicionar'].includes(opcao)) {
        if (!palavra) {
          return reply('❌ Informe a palavra que deseja bloquear.\n\nExemplo: !antipalavra add palavra')
        }

        const normalizada = palavra.toLowerCase()

        if (anti.words.includes(normalizada)) {
          return reply('⚠️ Essa palavra já está cadastrada.')
        }

        anti.words.push(normalizada)
        await db.write()

        return reply(`✅ Palavra adicionada à lista de bloqueio:\n\n🚫 ${normalizada}`)
      }

      if (['del', 'remover', 'remove'].includes(opcao)) {
        if (!palavra) {
          return reply('❌ Informe a palavra que deseja remover.\n\nExemplo: !antipalavra del palavra')
        }

        const normalizada = palavra.toLowerCase()
        const index = anti.words.indexOf(normalizada)

        if (index === -1) {
          return reply('⚠️ Essa palavra não está cadastrada.')
        }

        anti.words.splice(index, 1)
        await db.write()

        return reply(`✅ Palavra removida da lista de bloqueio:\n\n🗑️ ${normalizada}`)
      }

      if (['lista', 'list'].includes(opcao)) {
        if (!anti.words.length) {
          return reply('📋 *ANTI-PALAVRA*\n\nNenhuma palavra cadastrada.')
        }

        const lista = anti.words.map((word, index) => `${index + 1}. ${word}`).join('\n')

        return reply(
          `📋 *PALAVRAS BLOQUEADAS*\n\n${lista}\n\n` +
          `Status: ${anti.enabled ? '🟢 ATIVADO' : '🔴 DESATIVADO'}`
        )
      }

      return reply(
        `❌ Opção inválida.\n\n` +
        `Use:\n` +
        `▸ !antipalavra on\n` +
        `▸ !antipalavra off\n` +
        `▸ !antipalavra add palavra\n` +
        `▸ !antipalavra del palavra\n` +
        `▸ !antipalavra lista`
      )
    },
  },
]

export async function deveBloquearPalavra(sock, groupJid, sender, message, text) {
  if (!groupJid?.endsWith('@g.us')) return false

  const conteudo = String(text || '').toLowerCase()
  if (!conteudo) return false

  if (config.ownerNumbers.includes(sender?.split('@')[0])) {
    return false
  }

  if (await isGroupAdmin(sock, groupJid, sender, message)) {
    return false
  }

  try {
    const db = await getDatabase()
    const anti = db.data.groups[groupJid]?.antipalavra

    if (!anti?.enabled || !Array.isArray(anti.words) || !anti.words.length) {
      return false
    }

    return anti.words.some((word) => {
      const palavra = String(word || '').trim().toLowerCase()
      if (!palavra) return false

      const escaped = palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`(^|[^a-zà-ÿ0-9])${escaped}([^a-zà-ÿ0-9]|$)`, 'i').test(conteudo)
    })
  } catch (error) {
    console.error('ERRO AO VERIFICAR ANTI-PALAVRA:', error)
    return false
  }
}
