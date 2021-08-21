const TelegramBot = require('node-telegram-bot-api')

require('dotenv').config()
const config = require('./config')
const util = require('./util')
const options = {
  polling: true
}
const token = config.token
global.bot = new TelegramBot(token, options)
bot.commands = config.commands
bot.keyboard = [
  ['🔖 ID', 'ℹ️ INFO'],
  ['💳 BAYAR', '👤 ABOUT']
]
bot.waitForActions = []

bot.on('message', async (message, metadata) => {
  const text = message.text || message.caption || null
  const {from} = message
  const action = bot.waitForActions.find(
    x => 
      x.type === metadata.type &&
      x.memberId === from.id
  )

  if (action){
    // Handling message which found in bot.waitForActions
    await action.execute(message)
  }else if (
    metadata.type === 'text' &&
    text
  ) {
    // Receive text with slash prefix and execute it.
    if (text.startsWith('/')) {
      const args = text.substr(1).split(' ')
      const commandName = args.shift()
      const command = bot.commands.find(x => x.command === commandName)
      if (command) {
        command.execute(message, args)
      }
    }else if(isInKeyboard(text, bot.keyboard)){
      await _keyboardHandler(text, message)
    }
  }
})

async function _keyboardHandler(keyboard, message) {
  const {from, chat} = message
  switch (keyboard) {
    case '🔖 ID':
      await bot.sendMessage(chat.id, `🔖 ID Kamu: <code>${from.id}</code>`, {parse_mode: 'HTML'})
      break;
    case 'ℹ️ INFO':
      await bot.sendMessage(chat.id, `Masukkan ID Parkir`, {parse_mode: 'Markdown'})
      break;
    case '💳 BAYAR':
      await bot.sendMessage(chat.id, `Kirim Foto QRIS Parkir`, {parse_mode: 'Markdown'})
      bot.waitForActions.push({
        memberId: from.id,
        type: 'photo', // only execute message type 'photo'
        execute: async (message) => {
          const {chat, from} = message
          try {
            const photos = message.photo || null
            if (!photos.length) return
            // get largest format
            const photo = photos[photos.length-1]
            if (!photo) return
            // get photo url, it will expired in 1 hour
            const photoUrl = await bot.getFileLink(photo.file_id)
            if (!photoUrl) return
            const photoBuffer = await util.urlToBuffer(photoUrl)
            if (!photoBuffer) return
            const decodedQr = await util.qrDecode(photoBuffer)
            if (!decodedQr) return
            await bot.sendMessage(chat.id, `QRIS Link : ${decodedQr}`)
            _deleteAction(from.id)
          } catch (error) {
            // something happen when fetching file url
            console.error(error)
            return
          }
        }
      })
      break;
    case '👤 ABOUT':
    default:
      break;
  }
}

function _deleteAction(memberId) {
  if (!bot.waitForActions.length) return
  const index = bot.waitForActions.findIndex(x => x.memberId === memberId)
  if (index > -1){
    bot.waitForActions.splice(index, 1)
  }
}

function isInKeyboard(command, keyboard) {
  let i = 0;
  return (function next() {
    const x = keyboard[i++]
    if (!x) return false
    if (Array.isArray(x)){
      return isInKeyboard(command, x)
        ? true
        : next()
    }else if(typeof x === 'string' && x === command){
      return true
    }
    return next()
  })()
}

async function init() {
  await bot.setMyCommands(bot.commands)
}

init()