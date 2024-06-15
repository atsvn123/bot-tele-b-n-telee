const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const path = require('path');
const ShortUniqueId = require('short-unique-id');

// Require Mongoose models
const productModel = require("../src/models/productModel");
const userModel = require("../src/models/userModel");
const accountModel = require("../src/models/accountModel");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Basic Authentication
app.use(basicAuth({
    users: { 'admin': '123345a' },
    challenge: true
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory to 'views'
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the admin page
app.get('/admin', async (req, res) => {
    try {
        const products = await productModel.find({}, 'shortId title');
        const accounts = await accountModel.find({}, 'shortId isBuy idTele data').limit(1000);
        res.render('admin', { products, accounts, showButton: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle form submissions
app.post('/admin/action', async (req, res) => {
    const action = req.body.action;
    const data = req.body;

    switch (action) {
        case 'addAccount':
            try {
                const product = await productModel.findOne({ shortId: data.product });
                if (!product) {
                    return res.status(404).send('Product not found');
                }

                const lines = data.accountDetails.split('\n').filter(line => line.trim() !== '');
                const accounts = lines.map(line => ({
                    productShortId: product.shortId,
                    isBuy: false,
                    data: line.trim()
                }));

                await accountModel.insertMany(accounts);
                console.log('Accounts added:', accounts);
                res.send(`<h1 style="text-align: center; margin-top: 50vh; transform: translateY(-50%);">Accounts added successfully!</h1>`);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
            break;
        case 'deleteAccount':
            try {
                const lines = data.accountDetails.split('\n').filter(line => line.trim() !== '');
                const deleteResults = await accountModel.deleteMany({ data: { $in: lines } });
                console.log('Accounts deleted:', deleteResults.deletedCount);
                res.send(`<h1 style="text-align: center; margin-top: 50vh; transform: translateY(-50%);">Accounts deleted successfully!</h1>`);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
            break;
        case 'addProduct':
            try {
                const uid = new ShortUniqueId({ length: 10 });
                const shortId = uid.randomUUID();
                const newProduct = new productModel({
                    title: data.title,
                    price: data.price,
                    shortId: shortId,
                    minBuy: data.minBuy,
                    maxBuy: data.maxBuy
                });

                await newProduct.save();
                console.log('Product created:', newProduct);
                res.send(`<h1 style="text-align: center; margin-top: 50vh; transform: translateY(-50%);">Product created successfully!</h1>`);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
            break;
        case 'delete':
            case 'edit':
            try {
                if (data.action === 'delete') {
                    const deleteResult = await productModel.deleteOne({ shortId: data.product });
                    if (deleteResult.deletedCount === 0) {
                        return res.status(404).send('Product not found');
                    }
                    console.log('Product deleted:', data.product);
                    res.send(`<h1 style="text-align: center; margin-top: 50vh; transform: translateY(-50%);">Product deleted successfully!</h1>`);
                } else {
                    const updatedProduct = await productModel.findOneAndUpdate(
                        { shortId: data.product },
                        {
                            title: data.title,
                            price: data.price,
                            minBuy: data.minBuy,
                            maxBuy: data.maxBuy
                        },
                        { new: true }
                    );
                    if (!updatedProduct) {
                        return res.status(404).send('Product not found');
                    }
                    console.log('Product updated:', updatedProduct);
                    res.send(`<h1 style="text-align: center; margin-top: 50vh; transform: translateY(-50%);">Product updated successfully!</h1>`);
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
            break;
        default:
            console.log('Unknown action:', action);
            res.status(400).send('Unknown action');
    }
});

// Export the app module
module.exports = app;