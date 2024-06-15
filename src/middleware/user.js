const botUsers = require("../models/userModel")
const moment = require("moment")


exports.userMiddie = async (ctx, next) => {

    const { user } = await ctx.getAuthor();

    let checkUser = await botUsers.findOneAndUpdate({ idTele: user.id }, { lastOnline: moment().toDate() })

    if (!checkUser) {


        const newUsers = await new botUsers({
            idTele: user.id,
            isBanned: false,
            balance: 0,
            total_recharge: 0,            
        }).save();

        

    }


    let check = await botUsers.findOne({ idTele: user.id })


    if (check?.isBanned === true){

        await ctx.replyWithMarkdownV2("Tài khoản của bạn đã bị khóa");

        return false

    }

    ctx.dataUser = check
    ctx.dataTele = user

    return next()


}