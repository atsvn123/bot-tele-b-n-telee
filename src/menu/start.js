const { Composer } = require("grammy");
const { Menu } = require("@grammyjs/menu");

const userHandler = require("../handlers/user")

const startMenu = new Menu("start-menu")
  .text("View products", userHandler.viewShop).row()
  .text("Deposit (USDT)", userHandler.deposit).row()
;

module.exports = {
  startMenu,
}