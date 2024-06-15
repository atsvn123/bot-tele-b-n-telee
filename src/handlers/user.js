const botUsers = require("../models/userModel")
const productModel = require("../models/productModel")
const accountModel = require("../models/accountModel")
const {
    Menu
} = require("@grammyjs/menu");


let viewShop = async (ctx) => {

    let products = await productModel.find({})


    let productText = await Promise.all((products.map(async ({ shortId, title, price }) => {

        let getAmount = await accountModel.countDocuments({
            productShortId: shortId,
            isBuy: false
        })

        return `<code>${shortId}</code>`+" - <strong>"+title+"</strong> ("+price+" USD) - In stock : "+getAmount
    })))

    let text = `Products:
${productText.join(`
`)}
How to buy: <strong>/buy</strong> shortId amount`

  await ctx.replyWithHTML(text)

}

let deposit = async (ctx) => {

    let products = await productModel.find({})

    let text = `You can deposit using command: <strong>/deposit</strong> amountUSDT`

  await ctx.replyWithHTML(text)

}



module.exports = {
    viewShop,
    deposit
}