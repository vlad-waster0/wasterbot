import axios from 'axios'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile as readFileFs, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)
import { getDatabase } from '../database.js'

function pegarLink(args) {
  const texto = String(args?.join(' ') || '').trim()
  const match = texto.match(/https?:\/\/\S+/i)
  return match ? match[0].replace(/[)>.,]+$/, '') : null
}

async function baixarJson(url, headers = {}) {
  const resposta = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      ...headers,
    },
    timeout: 30000,
  })

  return resposta.data
}

async function baixarArquivo(url) {
  const resposta = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    timeout: 60000,
    maxContentLength: 50 * 1024 * 1024,
  })

  return Buffer.from(resposta.data)
}

async function apiDownload(link) {
  const urls = [
    `https://www.tikwm.com/api/?url=${encodeURIComponent(link)}`,
    `https://www.tikwm.com/api/?url=${encodeURIComponent(link)}&hd=1`,
  ]

  for (const url of urls) {
    try {
      const data = await baixarJson(url)
      if (data?.data?.play || data?.data?.hdplay || data?.data?.music) {
        return data.data
      }
    } catch {}
  }

  return null
}

async function enviarTikTok({ sock, jid, link, audio = false }) {
  const dados = await apiDownload(link)

  if (!dados) {
    throw new Error('Não foi possível obter o vídeo.')
  }

  const videoUrl = dados.hdplay || dados.play
  const audioUrl = dados.music

  if (audio) {
    if (!audioUrl) throw new Error('Áudio não disponível.')

    const audioBuffer = await baixarArquivo(audioUrl)

    await sock.sendMessage(jid, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false,
    })

    return
  }

  const videoBuffer = await baixarArquivo(videoUrl)

  const titulo = dados.title || 'Sem título'
  const autor = dados.author?.nickname || dados.author?.unique_id || 'Desconhecido'
  const usuario = dados.author?.unique_id || ''
  const visualizacoes = Number(dados.play_count || 0).toLocaleString('pt-BR')
  const curtidas = Number(dados.digg_count || 0).toLocaleString('pt-BR')
  const comentarios = Number(dados.comment_count || 0).toLocaleString('pt-BR')
  const compartilhamentos = Number(dados.share_count || 0).toLocaleString('pt-BR')
  const duracao = dados.duration ? `${dados.duration}s` : 'Desconhecida'

  await sock.sendMessage(jid, {
    video: videoBuffer,
    mimetype: 'video/mp4',
    caption:
      `🎵 *TikTok Downloader* 🎵\n\n` +
      `📌 Título: ${titulo}\n` +
      `👤 Autor: ${autor}${usuario ? ` (@${usuario})` : ''}\n` +
      `👁️ Visualizações: ${visualizacoes}\n` +
      `❤️ Curtidas: ${curtidas}\n` +
      `💬 Comentários: ${comentarios}\n` +
      `🔄 Compartilhamentos: ${compartilhamentos}\n` +
      `⏱️ Duração: ${duracao}\n\n` +
      `📥 Áudio: responda com *!tomp3*`
  })
}

async function executarTikTok({ sock, message, args, reply, audio = false }) {
  const link = pegarLink(args)

  if (!link) {
    return reply(
      `❌ Informe um link do TikTok.\n\n` +
      `Exemplo:\n` +
      `!tiktok https://www.tiktok.com/...\n\n` +
      `Para áudio:\n` +
      `!tomp3 https://www.tiktok.com/...`
    )
  }

  try {
    await reply(audio ? '⏳ Baixando o áudio...' : '⏳ Baixando o vídeo...')
    await enviarTikTok({
      sock,
      jid: message.key.remoteJid,
      link,
      audio,
    })
  } catch (error) {
    console.error('ERRO DOWNLOAD:', error)
    return reply(
      `❌ Não consegui baixar essa mídia.\n\n` +
      `Verifique se o link é público e tente novamente.`
    )
  }
}



async function baixarInstagram(link, audio = false) {
  const pasta = await mkdtemp(join(tmpdir(), 'waster-instagram-'))

  try {
    if (audio) {
      const arquivo = join(pasta, 'audio.%(ext)s')

      await execFileAsync('yt-dlp', [
        '--no-playlist',
        '--no-warnings',
        '--quiet',
        '--format', 'bestaudio/best',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '128K',
        '--output', arquivo,
        link,
      ], {
        timeout: 120000,
      })

      const { stdout: arquivos } = await execFileAsync(
        'sh',
        ['-c', `find "${pasta}" -type f | head -1`],
        { timeout: 10000 }
      )

      const caminho = arquivos.trim()

      if (!caminho) {
        throw new Error('Áudio do Instagram não encontrado.')
      }

      return {
        type: 'audio',
        buffer: await readFileFs(caminho),
      }
    }

    const arquivo = join(pasta, 'video.%(ext)s')

    await execFileAsync('yt-dlp', [
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      '--format', 'best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '--output', arquivo,
      link,
    ], {
      timeout: 120000,
    })

    const { stdout: arquivos } = await execFileAsync(
      'sh',
      ['-c', `find "${pasta}" -type f | head -1`],
      { timeout: 10000 }
    )

    const caminho = arquivos.trim()

    if (!caminho) {
      throw new Error('Vídeo do Instagram não encontrado.')
    }

    return {
      type: 'video',
      buffer: await readFileFs(caminho),
    }
  } finally {
    await rm(pasta, { recursive: true, force: true }).catch(() => {})
  }
}

async function executarInstagram({ sock, message, args, reply, audio = false }) {
  const link = pegarLink(args)

  if (!link || !/instagram\.com/i.test(link)) {
    return reply(
      `❌ Informe um link válido do Instagram.\n\n` +
      `Exemplo:\n` +
      `!instagram https://www.instagram.com/reel/...\n\n` +
      `Para áudio:\n` +
      `!instagrammp3 https://www.instagram.com/reel/...`
    )
  }

  try {
    await reply(audio
      ? '⏳ Baixando o áudio do Instagram...'
      : '⏳ Baixando o vídeo do Instagram...'
    )

    const resultado = await baixarInstagram(link, audio)
    const jid = message.key.remoteJid

    if (resultado.type === 'audio') {
      await sock.sendMessage(jid, {
        audio: resultado.buffer,
        mimetype: 'audio/mpeg',
        ptt: false,
      })
    } else {
      await sock.sendMessage(jid, {
        video: resultado.buffer,
        mimetype: 'video/mp4',
        caption: '📥 *Instagram Downloader*\n\n✅ Vídeo baixado com sucesso.',
      })
    }
  } catch (error) {
    console.error('ERRO DOWNLOAD INSTAGRAM:', error)

    return reply(
      `❌ Não consegui baixar essa mídia do Instagram.\n\n` +
      `Verifique se o perfil/publicação é público e tente novamente.`
    )
  }
}

export const menuBaixarCommand = {
  name: 'menubaixar',
  aliases: ['download', 'downloads'],
  description: 'Exibe o menu de downloads.',
  async execute({ reply, message }) {
    const groupJid = message?.key?.remoteJid
    const db = await getDatabase()
    const personalizado = groupJid?.endsWith('@g.us')
      ? (db.data.groups[groupJid]?.menu || {})
      : {}
    const botName = personalizado.botName || 'Waster Bot'
    return reply(
      `📥 *${botName.toUpperCase()} DOWNLOADS* 📥\\n\\n` +
      `🎵 *TIKTOK*\\n` +
      `▸ !tiktok <link> — Baixar vídeo\\n` +
      `▸ !tt <link> — Baixar vídeo\\n` +
      `▸ !tiktokdl <link> — Baixar vídeo\\n\\n` +
      `🎧 *ÁUDIO*\\n` +
      `▸ !tomp3 <link> — Baixar somente áudio\\n` +
      `▸ !tiktokmp3 <link> — Baixar somente áudio\\n` +
      `▸ !ttmp3 <link> — Baixar somente áudio\\n\\n` +
      `💡 Envie um link público do TikTok junto com o comando.`
    )
  },
}

export const downloadsCommands = [
  menuBaixarCommand,
  {
    name: 'instagram',
    aliases: ['ig', 'reels', 'reel', 'instagramdl'],
    description: 'Baixa vídeo público do Instagram.',
    async execute(context) {
      return executarInstagram(context)
    },
  },
  {
    name: 'instagrammp3',
    aliases: ['igmp3', 'reelsmp3', 'instagramaudio'],
    description: 'Baixa áudio de vídeo público do Instagram.',
    async execute(context) {
      return executarInstagram({
        ...context,
        audio: true,
      })
    },
  },
  {
    name: 'tiktok',
    aliases: ['tt', 'tiktokdl'],
    description: 'Baixa vídeo do TikTok sem marca d’água.',
    async execute(context) {
      return executarTikTok(context)
    },
  },

  {
    name: 'tomp3',
    aliases: ['tiktokmp3', 'ttmp3'],
    description: 'Baixa o áudio de um TikTok.',
    async execute(context) {
      return executarTikTok({
        ...context,
        audio: true,
      })
    },
  },
]
