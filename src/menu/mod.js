const { Composer } = require('grammy')
const { startMenu } = require('./start')

const composer = new Composer();

composer.use(startMenu)

module.exports = composer;