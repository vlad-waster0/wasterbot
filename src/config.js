import 'dotenv/config'

const numbers = (process.env.OWNER_NUMBERS || '')
  .split(',')
  .map((value) => value.replace(/\\D/g, ''))
  .filter(Boolean)

export const config = {
  botName: process.env.BOT_NAME || 'Baileys Modular Bot',
  prefix: process.env.BOT_PREFIX || '!',
  ownerNumbers: numbers,
  pairingNumber: (process.env.PAIRING_NUMBER || '').replace(/\\D/g, ''),
  dbFile: process.env.DB_FILE || './data/bot.json',
  logLevel: process.env.LOG_LEVEL || 'info',
}
