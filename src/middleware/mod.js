const { Composer } = require('grammy')
const { userMiddie } = require('./user')


const composer = new Composer();
composer.use(userMiddie);

module.exports = composer;