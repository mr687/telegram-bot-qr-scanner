const config = {
  /**
   * See .env file to set your token
   */
  token: process.env.TELEGRAM_TOKEN,
  /**
   * Add your bot commands in here
   * 
   * {
   *  command: 'command_name',
   *  description: 'command_description',
   *  execute: <function to be execute>
   * }
   * 
   */
  commands: [
    {
      command: 'start',
      description: 'Start bot',
      execute: require('./commands/start')
    },
  ],
}

module.exports = config