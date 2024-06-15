const { Composer } = require("grammy");
const { Menu } = require("@grammyjs/menu");

const userHandler = require("../handlers/user")

const { startMenu } = require("../menu/start")


const composer = new Composer();

composer.command("start", async (ctx) => {
    
  let sendRootMenu = await ctx.replyWithHTML(`Welcome : <strong>${ctx.dataTele.id}</strong>
Balance: <strong>${ctx.dataUser.balance}</strong>`, { reply_markup: startMenu });

});

module.exports = composer