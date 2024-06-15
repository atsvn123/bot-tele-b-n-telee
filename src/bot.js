const {
  Bot,
  session,
  MemorySessionStorage 
} = require("grammy");
const dotenv = require("dotenv").config()
const mongoose = require("mongoose")
const {
  hydrateReply,
  parseMode
} = require("@grammyjs/parse-mode");
const Middleware = require("./middleware/mod")
const Commands = require("./commands/mod")
const Menu = require("./menu/mod")
const {
  emojiParser
} = require("@grammyjs/emoji");
const {
  limit
} = require("@grammyjs/ratelimiter");
const path = require("path")
const {
  autoRetry
} = require("@grammyjs/auto-retry");

const {
  hydrate
} = require("@grammyjs/hydrate");

const {
  run,
  sequentialize
} = require("@grammyjs/runner");

const userModel = require("./models/userModel")

const {
  RedisAdapter
} = require("@grammyjs/storage-redis");
const Redis = require("ioredis");

const {
  chatMembers 
} = require("@grammyjs/chat-members");

const { CryptoPay, Assets, PaidButtonNames } = require('@foile/crypto-pay-api');

const appExpress = require("../admin/server")

const depositModel = require("./models/depositModel")
const bot = new Bot(process.env.BOT_TOKEN);

function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

bot.use(sequentialize(getSessionKey));

const adapter = new MemorySessionStorage();

bot.use(chatMembers(adapter));


// registering middleware of the i18n instance.
bot.use(
  session({
    initial: () => {
      return {
        currentAction: 'viewing'
      };
    },
    storage: new MemorySessionStorage()
  }),
);
bot.use(hydrate());


bot.api.config.use(autoRetry({
  maxRetryAttempts: 1, // only repeat requests once
  maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
  retryOnInternalServerErrors: 1
}));




// Register i18n middleware

// Install the plugin.
bot.use(hydrateReply);

// Set the default parse mode for ctx.reply.
bot.api.config.use(parseMode("MarkdownV2"));

bot.use(
  limit({
    // Allow only 3 messages to be handled every 2 seconds.
    timeFrame: 2000,
    limit: 3,

    // This is called when the limit is exceeded.
    onLimitExceeded: async (ctx) => {
      await ctx.replyWithHTML(ctx.t('spam'));
    },

    // Note that the key should be a number in string format such as "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },

  })
);


bot.use(emojiParser());


bot.use(Middleware, Menu, Commands);

bot.catch(console.log)

global.bot = bot

mongoose.connect(process.env.DATABASE_URL, {
}).then(async () => {
  await bot.start({
    drop_pending_updates: true,
    onStart: async () => {
      await console.log('Bot is Running');
    },
    allowed_updates: ['message', 'callback_query', 'chat_member']
  });

  await bot.api.setMyCommands([
    { command: "start", description: "Bắt đầu bot" },
    { command: "buy", description: "/deposit shortId amount" },
    { command: "deposit", description: "/deposit usdtAmount" },
  ]);

}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});


const cryptoPay = new CryptoPay(process.env.tokenCrypto, {
  webhook: {
    serverHostname: 'localhost',
    serverPort: 4200,
    path: '/okvip123'
  },
});

cryptoPay.on('invoice_paid', async (update) => {
  
  let idTele = update.payload

  let checkDeposit = await depositModel.findOne({
    txId: update.hash,
    status: "pending"
  })

  if (!checkDeposit) {
    return
  }

  let checkUser = await userModel.findOne({
    idTele
  })

  checkDeposit.status = "success"
  await checkDeposit.save()

  if (checkUser) {
    checkUser.balance += update.amount
    await checkUser.save()
  }

});

appExpress.listen(3000, () => {
  console.log(`Server is running at http://localhost:${3000}`);
});


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))