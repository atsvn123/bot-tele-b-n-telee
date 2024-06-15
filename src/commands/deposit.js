const { Composer } = require("grammy");
const { Menu } = require("@grammyjs/menu");
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const depositModel = require("../models/depositModel")
const accountModel = require("../models/accountModel")
const { CryptoPay, Assets, PaidButtonNames } = require('@foile/crypto-pay-api');


const ShortUniqueId = require('short-unique-id');
const { randomUUID } = new ShortUniqueId({ length: 10 });

const composer = new Composer();

composer.command("deposit", async (ctx) => {
    
    // Extract the arguments from the command
    const args = ctx.match?.split(" ");

    // Check if exactly two arguments are provided
    if (!args || args.length !== 1) {
        return ctx.replyWithHTML("Error: The /deposit command requires exactly one arguments: <strong>amount</strong>");
    }

    const [amount] = args;

    // Validate the types of the arguments
    if (isNaN(amount)) {
        return ctx.replyWithHTML("Error: The argument must be a number (<strong>amount</strong>)");
    }

    try {

        const cryptoPay = new CryptoPay(process.env.tokenCrypto);

        let invoice = await cryptoPay.createInvoice(Assets.USDT, amount, {
            description: 'Thanh toán bot telegram',
            paid_btn_name: PaidButtonNames.OPEN_BOT,
            paid_btn_url: 'https://t.me/sellaccounfdtbot',
            payload: ctx?.dataUser.idTele
        });


        if (!invoice.status === 1) {

            return await ctx.reply('Failed')
    
        }
    
        
        if (invoice?.pay_url) {

            let createDeposit = await depositModel.create({
                amount,
                status: "pending",
                txId: invoice?.hash,
                idTele: ctx.dataUser?.idTele
            })
    
            await ctx.replyWithHTML(`You can create payment with this link: ${invoice.pay_url}`)
        
    
        }

    } catch (err) {
        return ctx.replyWithHTML("Error: The payment system is having issues.");
    }

    



    

});

module.exports = composer