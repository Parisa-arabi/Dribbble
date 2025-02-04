const bcrypt = require('bcrypt');
const Buyer = require('../models/Buyer'); // Replace with your actual model path  
const { getBuyers, createBuyer } = require('../models/Buyer'); // Assuming you have these functions defined in the model
const { client } = require('../db'); // وارد کردن فایل db.js  


// Function to get the database and collection  
const getDatabase = async () => {
    await client.connect();

    // Specify the database and collection  
    const database = client.db('Dribble'); // Change 'dribble' to your database name  
    const collection = database.collection('buyers'); // Change 'users' to your collection name  
    return collection;
};

exports.authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt; // Assuming your JWT is stored in a cookie named "jwt"  
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.log('Error verifying token:', err);  // Log the error to understand it better
                return res.sendStatus(403);  // Forbidden if token is invalid or expired
            }
            req.user = user;  // Save user info for use in routes
            console.log(req.user);
            next();
        });
    } else {
        res.sendStatus(401); // No token provided  
    }
};

// Get designs (this should be implemented according to your database logic)  
exports.getDesigns = async (req, res) => {
    // Connect to the collection  
    await client.connect();

    // Specify the database and collection  
    const database = client.db('Dribble'); // Change 'dribble' to your database name  
    const collection = database.collection('designs'); // Change 'users' to your collection name

    try {
        // Fetch designs logic from collection  
        const designs = await collection.find({}).toArray(); // Assuming you have designs in the 'users' collection  
        res.render('designs', { designs: designs });
    } catch (error) {
        console.error('Error fetching designs:', error);
        res.status(500).send('Server Error');
    }
};

// Handle buying a design  
exports.buyDesign = async (req, res) => {
    // Logic for buying a design  
    res.send('Design purchased'); // Placeholder response  
};

// Get purchases for a given buyer  
exports.getPurchases = async (req, res) => {
    const { id } = req.params; // Buyer ID from the route  
    // Connect to the collection  
    const collection = await getDatabase();

    try {
        // Fetch purchases from the database here  
        // Assuming you have a field to filter purchases by buyer ID  
        const purchases = await collection.find({ buyerId: id }).toArray();
        res.json(purchases); // Send purchases as JSON response  
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).send('Server Error');
    }
};

// Add balance to buyer account  
exports.addBalance = async (req, res) => {

    const userId = req.user?.id; // Extract user ID  
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }


    const collection = await getDatabase(); // Get database connection  

    try {
        // Convert userId to ObjectId  
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { newBalance } = req.body;

        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { AccountBalance: newBalance } }
        );

        // Respond with success
        res.json({ success: true, message: 'Balance updated successfully' });

    } catch (error) {
        console.error("Error processing balance:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
const jwt = require('jsonwebtoken'); // Import jsonwebtoken  
const dotenv = require('dotenv'); // Import dotenv if you're using an .env file for config  
const JWT_SECRET = 'g$7^b4jP&9hZpu!2xY#A6@mQ3tV8raC5ZxJ7LqW0'
dotenv.config(); // Load environment variables from .env file  


// Handle buyer login  
exports.loginBuyer = async (req, res) => {
    const { email, password } = req.body; // Capture email and password from the request body  
    const collection = await getDatabase(); // Connect to the database  

    try {
        // Log all buyers to verify the connection and data  
        // Query to find the buyer by email  
        const trimmedEmail = email.trim().toLowerCase(); // Normalize email  
        const buyer = await collection.findOne({ Email: trimmedEmail });


        if (buyer) {
            // Directly compare the provided password with the stored password  
            if (password === buyer.Password) { // Note: Hash passwords in production  
                // Create a token payload  
                const tokenPayload = {
                    id: buyer._id, // Include user ID or other identifiers  
                    email: buyer.Email,
                    role: 'buyer'
                };

                // Generate a JWT token  
                const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Set expiration time  

                // Set the JWT in a cookie  
                res.cookie('jwt', token, { httpOnly: true }); // Ensure cookie is HTTP only  
                return res.json({ message: 'Login successful' }); // Send JSON response  
            } else {
                return res.status(401).json({ message: 'Invalid password.' }); // Respond with JSON error  
            }
        } else {
            return res.status(404).json({ message: 'Email not found.' }); // Respond with JSON error for email not found  
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' }); // Respond with a generic error for server issues  
    }
};
// Handle buyer registration  
exports.registerBuyer = async (req, res) => {
    const { BuyerID, Password, Email } = req.body;

    // Hash the password  
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newBuyer = { BuyerID, Password: hashedPassword, Email };

    const collection = await getDatabase();

    try {
        await collection.insertOne(newBuyer); // Insert new buyer into the collection  
        res.redirect('/buyer/login'); // Redirect to login after successful registration  
    } catch (error) {
        req.flash('message', 'Error creating buyer: ' + error.message);
        res.redirect('/buyer/register');
    }
};



const { ObjectId } = require('mongodb');


// Function to handle purchase creation  
exports.createPurchase = async (req, res) => {

    const cart = req.body; // Get purchase data from request body  
    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ message: "Invalid cart data." });
    }

    const userId = req.user?.id; // Extract user ID  
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }

    console.log("User ID:", userId);

    const collection = await getDatabase(); // Get database connection  

    try {
        // Convert userId to ObjectId  
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        console.log("User Found:", user);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Initialize PurchasesList if it doesn't exist  
        if (!user.PurchasesList) {
            user.PurchasesList = [];
        }

        // Push new purchases to user's list  
        user.PurchasesList.push(...cart);

        // Update user in the database  
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
    const userId = req.user?.id; // Extract user ID  
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }


    const collection = await getDatabase(); // Get database connection  

    try {
        // Convert userId to ObjectId  
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }


        res.json({ user: user });  // Make sure this is JSON, not an HTML page
    } catch (error) {
        console.error("Error fetching buyer info:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.userbalance = async (req, res) => {
    const userId = req.user?.id; // Extract user ID  
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID found." });
    }


    const collection = await getDatabase(); // Get database connection  

    try {
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }


        res.json({ balance: user.AccountBalance });  // Make sure this is JSON, not an HTML page
    } catch (error) {
        console.error("Error fetching buyer info:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}


