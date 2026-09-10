import { getDatabase } from '../database.js'

export function iniciarSaida(sock) {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      if (update.action !== 'remove') return

      const groupJid = update.id
      const db = await getDatabase()
      const leave = db.data.groups[groupJid]?.leave

      if (!leave?.enabled) return

      for (const participante of update.participants || []) {
        try {
          const lid = typeof participante === 'string'
            ? participante
            : participante?.id

          const phoneNumber = typeof participante === 'object'
            ? participante?.phoneNumber
            : null

          const mentionJid =
            phoneNumber?.endsWith('@s.whatsapp.net')
              ? phoneNumber
              : lid

          if (!mentionJid) continue

          const numero = mentionJid.split('@')[0].split(':')[0]

          const mensagemPadrao = `👋 @${numero} saiu do grupo.`
          const usarFonte = leave.fontStyle === 'serif_bold_italic'

          const mapaFonte = {
            A:'𝑨',B:'𝑩',C:'𝑪',D:'𝑫',E:'𝑬',F:'𝑭',G:'𝑮',H:'𝑯',I:'𝑰',J:'𝑱',
            K:'𝑲',L:'𝑳',M:'𝑴',N:'𝑵',O:'𝑶',P:'𝑷',Q:'𝑸',R:'𝑹',S:'𝑺',T:'𝑻',
            U:'𝑼',V:'𝑽',W:'𝑾',X:'𝑿',Y:'𝒀',Z:'𝒁',
            a:'𝒂',b:'𝒃',c:'𝒄',d:'𝒅',e:'𝒆',f:'𝒇',g:'𝒈',h:'𝒉',i:'𝒊',j:'𝒋',
            k:'𝒌',l:'𝒍',m:'𝒎',n:'𝒏',o:'𝒐',p:'𝒑',q:'𝒒',r:'𝒓',s:'𝒔',t:'𝒕',
            u:'𝒖',v:'𝒗',w:'𝒘',x:'𝒙',y:'𝒚',z:'𝒛'
          }

          const aplicarFonte = (texto) =>
            usarFonte
              ? [...texto].map(char => mapaFonte[char] || char).join('')
              : texto

          const textoBase = String(leave.message || mensagemPadrao)
        .replace(/@usuário/gi, `@${numero}`)
        .replace(/@user/gi, `@${numero}`)
        .replace(/\\n/g, '\n')

      const texto = aplicarFonte(textoBase)

          await sock.sendMessage(groupJid, {
            text: texto,
            mentions: [mentionJid],
          })
        } catch (error) {
          console.error('ERRO AO PROCESSAR SAÍDA:', error)
        }
      }
    } catch (error) {
      console.error('ERRO AO ENVIAR MENSAGEM DE SAÍDA:', error)
    }
  })
}
