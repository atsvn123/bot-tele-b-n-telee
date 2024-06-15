const { Composer } = require("grammy");
const start = require("./start")
const buy = require("./buy")
const deposit = require("./deposit")

const composer = new Composer();

composer.use(start);
composer.use(buy);
composer.use(deposit);

module.exports = composer
