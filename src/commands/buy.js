const { Composer } = require("grammy");
const { Menu } = require("@grammyjs/menu");
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const accountModel = require("../models/accountModel")

const ShortUniqueId = require('short-unique-id');
const { randomUUID } = new ShortUniqueId({ length: 10 });

const composer = new Composer();

composer.command("buy", async (ctx) => {
    
    // Extract the arguments from the command
    const args = ctx.match?.split(" ");

    // Check if exactly two arguments are provided
    if (!args || args.length !== 2) {
        return ctx.replyWithHTML("Error: The /buy command requires exactly two arguments: <strong>shortId</strong> and <strong>amount</strong>.");
    }

    const [shortId, amount] = args;

    // Validate the types of the arguments
    if (typeof shortId !== "string" || Number(amount) < 1) {
        return ctx.replyWithHTML("Error: The first argument must be a string (<strong>shortId</strong>) and the second argument must be a floor number greater than 1 (<strong>amount</strong>).");
    }

    try {
        // Check if the shortId exists in the productModel
        const product = await productModel.findOne({ shortId });
        if (!product) {
            return ctx.replyWithHTML("Error: The specified shortId does not exist.");
        }

        // Validate the amount against minBuy and maxBuy
        if (amount < product.minBuy || amount > product.maxBuy) {
            return ctx.replyWithHTML(`Error: The amount must be between <strong>${product.minBuy}</strong> and <strong>${product.maxBuy}</strong>.`);
        }

        // Get user info from userModel using idTele from ctx.dataUser
        const userIdTele = ctx.from?.id.toString(); // Assuming ctx.from.id is the Telegram user ID
        const user = await userModel.findOne({ idTele: userIdTele });
        if (!user) {
            return ctx.replyWithHTML("Error: User not found.");
        }

        // Check if user has enough balance for the order
        const totalCost = Number(amount) * product?.price; // Assuming each unit costs 1 for simplicity, adjust as needed
        if (user.balance < totalCost) {
            return ctx.replyWithHTML("Error: Insufficient balance for the order.");
        }

        let getAmount = await accountModel.countDocuments({
            productShortId: product?.shortId,
            isBuy: false
        })

        if (getAmount < Number(amount)) {
            return ctx.replyWithHTML("Error: Storage doesnt have enough for this order.");
        }

        let orderId = randomUUID()

        user.balance -= totalCost;

        // Save the updated user document
        await user.save();

        // 1. Find and select documents
        const selectedDocs = await accountModel.find({ productShortId: product?.shortId,
            isBuy: false })
        .limit(Math.floor(Number(amount)))
        .exec();

        // 2. Get document IDs
        const docIds = selectedDocs.map(doc => doc._id);

        // 3. Update matching documents
        const updateResult = await accountModel.updateMany(
        { _id: { $in: docIds } },
        { $set: { isBuy: true, orderId, idTele: user?.idTele } } // Update operation
        );

        const datas = selectedDocs.map((doc, index) => `${index + 1}. ${doc.data}`).join(`
`);

        await ctx.replyWithHTML(datas);


        // If validation passes, proceed with the command logic
        await ctx.replyWithHTML(`Purchase successful! shortId: ${shortId}, amount: ${amount}`);



    } catch (error) {
        console.error(error);
        ctx.replyWithHTML("Error: An unexpected error occurred. Please try again later.");
    }

});

module.exports = composer