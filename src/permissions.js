import { isAdmin, isOwner, isPremium } from './database.js'

async function sameParticipant(sock, jid, participantId) {
  if (!jid || !participantId) return false

  if (jid === participantId) return true

  try {
    if (jid.endsWith('@lid') && typeof sock.getPNForLID === 'function') {
      const pn = await sock.getPNForLID(jid)
      if (pn && (pn === participantId || pn.split('@')[0] === participantId.split('@')[0])) {
        return true
      }
    }

    if (participantId.endsWith('@lid') && typeof sock.getPNForLID === 'function') {
      const pn = await sock.getPNForLID(participantId)
      if (pn && (pn === jid || pn.split('@')[0] === jid.split('@')[0])) {
        return true
      }
    }
  } catch (error) {
    console.error('Erro ao resolver LID:', error.message)
  }

  return jid.split('@')[0] === participantId.split('@')[0]
}

export async function isGroupAdmin(sock, jid, groupJid) {
  if (!groupJid || !groupJid.endsWith("@g.us")) return false
  try {
    const metadata = await sock.groupMetadata(groupJid)
    const member = (metadata.participants || []).find(p => p.id === jid || p.phoneNumber === jid)
    return member?.admin === "admin" || member?.admin === "superadmin"
  } catch (error) {
    console.error("Erro ao verificar administrador:", error.message)
    return false
  }
}

export async function getPermissionLevel(jid, sock = null, groupJid = null) {
  if (await isOwner(jid)) return 'owner'

  if (sock && groupJid && await isGroupAdmin(sock, jid, groupJid)) {
    return 'admin'
  }

  if (await isPremium(jid)) return 'premium'
  if (await isAdmin(jid)) return 'admin'

  return 'user'
}

export async function hasPermission(jid, required, sock = null, groupJid = null) {
  const level = await getPermissionLevel(jid, sock, groupJid)

  const hierarchy = {
    user: 0,
    admin: 1,
    premium: 2,
    owner: 3,
  }

  return hierarchy[level] >= hierarchy[required]
}
