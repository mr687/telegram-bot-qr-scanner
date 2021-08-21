module.exports = (message) => {
  const {from, chat} = message
  const text = 'Selamat Datang di Sistem Parkir\n\nSilakan pilih menu keyboard'
  bot.sendMessage(chat.id, text, {
    reply_markup: {
      keyboard: bot.keyboard
    }
  })
}