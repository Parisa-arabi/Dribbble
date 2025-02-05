const bcrypt = require('bcryptjs');
const Buyer = require('../models/Buyer'); 
const { getBuyers, createBuyer } = require('../models/Buyer'); 
const { client } = require('../db'); 


const getDatabase = async () => {
    await client.connect();

    const database = client.db('Dribble'); 
    const collection = database.collection('buyers');   
    return collection;
};

exports.authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt; 
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.log('Error verifying token:', err);  
                return res.sendStatus(403);  
            }
            req.user = user;  
            console.log(req.user);
            next();
        });
    } else {
        res.sendStatus(401); 
    }
};

exports.getDesigns = async (req, res) => {
    await client.connect();

    const database = client.db('Dribble'); 
    const collection = database.collection('designs'); 

    try {
        const designs = await collection.find({}).toArray(); 
        res.render('designs', { designs: designs });
    } catch (error) {
        console.error('Error fetching designs:', error);
        res.status(500).send('Server Error');
    }
};

exports.buyDesign = async (req, res) => {
    res.send('Design purchased'); 
};

exports.getPurchases = async (req, res) => {
    const { id } = req.params; 

    const collection = await getDatabase();

    try {
        const purchases = await collection.find({ buyerId: id }).toArray();
        res.json(purchases); 
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).send('Server Error');
    }
};

exports.addBalance = async (req, res) => {

    const userId = req.user?.id; 
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }


    const collection = await getDatabase(); 

    try {
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { newBalance } = req.body;

        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { AccountBalance: newBalance } }
        );

        res.json({ success: true, message: 'Balance updated successfully' });

    } catch (error) {
        console.error("Error processing balance:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv'); 
const JWT_SECRET = 'g$7^b4jP&9hZpu!2xY#A6@mQ3tV8raC5ZxJ7LqW0'
dotenv.config(); 


exports.loginBuyer = async (req, res) => {
    const { email, password } = req.body;  
    const collection = await getDatabase(); 

    try {
        const trimmedEmail = email.trim().toLowerCase(); 
        const buyer = await collection.findOne({ Email: trimmedEmail });


        if (buyer) {
            if (password === buyer.Password) { 
            
                const tokenPayload = {
                    id: buyer._id, 
                    email: buyer.Email,
                    role: 'buyer'
                };

                const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); 

                res.cookie('jwt', token, { httpOnly: true }); 
                return res.json({ message: 'Login successful' }); 
            } else {
                return res.status(401).json({ message: 'Invalid password.' });
            }
        } else {
            return res.status(404).json({ message: 'Email not found.' });   
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' }); 
    }
};
exports.registerBuyer = async (req, res) => {
    const { BuyerID, Password, Email } = req.body;

    const hashedPassword = await bcrypt.hash(Password, 10);
    const newBuyer = { BuyerID, Password: hashedPassword, Email };

    const collection = await getDatabase();

    try {
        await collection.insertOne(newBuyer);  
        res.redirect('/buyer/login');  
    } catch (error) {
        req.flash('message', 'Error creating buyer: ' + error.message);
        res.redirect('/buyer/register');
    }
};



const { ObjectId } = require('mongodb');


exports.createPurchase = async (req, res) => {

    const cart = req.body; 
    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ message: "Invalid cart data." });
    }

    const userId = req.user?.id; 
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }

    console.log("User ID:", userId);

    const collection = await getDatabase(); 

    try {
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        console.log("User Found:", user);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.PurchasesList) {
            user.PurchasesList = [];
        }

        user.PurchasesList.push(...cart);

        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { PurchasesList: user.PurchasesList } }
        );

        return res.status(200).json({ message: "Purchases added successfully." });
    } catch (error) {
        console.error("Error processing purchase:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


exports.buyerInfo = async (req, res) => {
    const userId = req.user?.id; 
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }


    const collection = await getDatabase(); 

    try {
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }


        res.json({ user: user });  
    } catch (error) {
        console.error("Error fetching buyer info:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.userbalance = async (req, res) => {
    const userId = req.user?.id; 
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }


    const collection = await getDatabase(); 

    try {
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }


        res.json({ balance: user.AccountBalance });  
    } catch (error) {
        console.error("Error fetching buyer info:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}


