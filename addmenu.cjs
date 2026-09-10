const fs = require('fs')

const file = 'src/commands/relacionamento.js'
let s = fs.readFileSync(file, 'utf8')

if (s.includes("name: 'menurelacionamento'")) {
  console.log('⚠️ MENU JÁ EXISTE')
  process.exit(0)
}

const marcador = 'export const relacionamentoCommands = ['
const pos = s.indexOf(marcador)

if (pos < 0) {
  console.log('❌ Não encontrei relacionamentoCommands')
  process.exit(1)
}

const fim = pos + marcador.length

const menu = `
  {
    name: 'menurelacionamento',
    aliases: ['menurelacao', 'menuperfil'],
    async execute({ sock, message }) {
      const texto = [
        '💖 *PERFIL E RELACIONAMENTO*',
        '',
        '👤 *PERFIL*',
        '▸ !perfil',
        '▸ !perfil @pessoa',
        '▸ !meuperfil',
        '',
        '❤️ *RELACIONAMENTO*',
        '▸ !namorar @pessoa',
        '▸ !sim',
        '▸ !não',
        '▸ !cancelarpedido @pessoa',
        '▸ !terminar',
        '▸ !relacionamento',
        '▸ !casal',
        '▸ !ex',
        '▸ !solteiro',
        '',
        '💍 *DIVERSÃO*',
        '▸ !casar @pessoa',
        '▸ !ship @pessoa @pessoa',
        '▸ !beijar @pessoa',
        '▸ !abraçar @pessoa'
      ].join('\\n')

      return sock.sendMessage(
        message.key.remoteJid,
        { text: texto },
        { quoted: message }
      )
    },
  },
`

s = s.slice(0, fim) + menu + s.slice(fim)
fs.writeFileSync(file, s)

console.log('✅ MENU INSERIDO COM SUCESSO')
