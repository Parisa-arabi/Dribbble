
const jwt = require('jsonwebtoken');

const { connectDB } = require('../db'); 
const { ObjectId } = require('mongodb');

/* ------------ Authentication related ------------ */

exports.getLoginPage = (req, res) => {
    res.render('admin/login', { errorMessage: null });
};
exports.dashboard = (req, res) => {
    res.render('layout', {
        title: 'Admin Dashboard',
        content: 'admin/dashboard' // Path to dashboard.ejs inside views/admin
    });
};
exports.postLogin = async(req, res) => {
    const { email, password } = req.body;
    console.log("Received login request:", req.body); // Check if data is received

    try {
        const db = await connectDB(); // Get DB connection
        const collection = db.collection('admins'); // Access the 'admin' collection

        // Fetch the admin document by email
        const admin = await collection.findOne({ email: email });
        console.log("Admin found:", admin); // Debug log

        if (!admin) {
            return res.render('admin/login', { errorMessage: 'Invalid email' });
        }

        // Compare the password
        if (password != admin.password) {
            return res.render('admin/login', { errorMessage: 'Invalid email or password' });
        }

        // Create JWT Token
        const token = jwt.sign({ adminId: admin._id }, 'secret_key', { expiresIn: '1h' });

        // Store token in session
        req.session.token = token;
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
};

exports.getDashboard = (req, res) => {
    res.render('layout', {
        title: 'Admin Dashboard',
        content: 'admin/dashboard'
    });
};

/* ------------------ Design Management ---------------------- */

exports.getDesigns = async(req, res) => {
    try {
        const db = await connectDB(); // Get DB connection
        const collection = db.collection('designs'); // Access the 'designs' collection
        const designs = await collection.find().toArray(); // Fetch all designs from the collection

        res.render('layout', {
            title: 'Design Management',
            content: 'admin/design_management',
            designs: designs // Pass designs to the view
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
// Edit design
//        res.redirect('/admin/designs'); // Redirect to the designs list page

exports.editDesign = async(req, res) => {
    const { id } = req.params; // Get the 'id' from the URL
    const { title, price, category, designerId, designerEmail, description, purchase, createdAt } = req.body;

    try {
        const db = await connectDB(); // Get DB connection
        const collection = db.collection('designs'); // Access the 'designs' collection

        // Find the design by its _id (convert string ID to ObjectId)
        const design = await collection.findOne({ _id: new ObjectId(id) });
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        // Prepare updated design object
        const updatedDesign = {
            title: title || design.title,
            price: price || design.price,
            category: category || design.category,
            designerId: designerId || design.designerId,
            designerEmail: designerEmail || design.designerEmail,
            description: description || design.description,
            purchase: purchase !== undefined ? purchase : design.purchase, // Boolean check
            createdAt: createdAt ? new Date(createdAt) : design.createdAt // Convert string to Date
        };

        // Update the design in the collection
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedDesign });

        res.status(200).json({ message: 'Design updated successfully', design: updatedDesign });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete design
exports.deleteDesign = async(req, res) => {
    const { id } = req.params; // Get the design ID from the URL

    try {
        const db = await connectDB(); // Get DB connection
        const collection = db.collection('designs'); // Access the 'designs' collection

        const design = await collection.findOne({ _id: new ObjectId(id) });
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        // Delete the design
        await collection.deleteOne({ _id: new ObjectId(id) });

        res.status(200).json({ message: 'Design deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};




/* ------------ Designer Management ------------ */

exports.getDesigners = async(req, res) => {
    try {
        const db = await connectDB(); // Get DB connection
        const collection = db.collection('designers'); // Access 'designers' collection
        const designers = await collection.find().toArray(); // Fetch all designers

        res.render('layout', {
            title: 'Designers',
            content: 'admin/designers',
            designers
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Create Designer
exports.createDesigner = async(req, res) => {
    const { name, email, password, title, designs, income } = req.body;

    try {
        const db = await connectDB();
        const collection = db.collection('designers');

        // Hash password before storing

        const newDesigner = {
            name,
            email,
            password,
            title,
            designs: designs || [],
            income: income || 0
        };

        await collection.insertOne(newDesigner);
        res.status(201).json({ message: 'Designer created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Edit Designer
exports.editDesigner = async(req, res) => {
    const { id } = req.params;
    const { name, email, password, title, designs, income } = req.body;

    try {
        const db = await connectDB();
        const collection = db.collection('designers');

        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (password) updateFields.password = password;
        if (title) updateFields.title = title;
        if (designs) updateFields.designs = designs;
        if (income) updateFields.income = income;

        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Designer not found' });
        }

        res.status(200).json({ message: 'Designer updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete Designer
exports.deleteDesigner = async(req, res) => {
    const { id } = req.params;

    try {
        const db = await connectDB();
        const collection = db.collection('designers');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Designer not found' });
        }

        res.status(200).json({ message: 'Designer deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
/* ------------ Buyer Management ------------ */

// Create a new buyer
exports.createBuyer = async(req, res) => {
    try {
        const { BuyerID, Password, Email, PurchasesList, AccountBalance } = req.body;

        const db = await connectDB(); // Get DB connection
        const collection = db.collection('buyers'); // Access the 'buyers' collection

        const existingBuyer = await collection.findOne({ Email });
        if (existingBuyer) {
            return res.status(400).json({ message: "Buyer already exists" });
        }

        const newBuyer = {
            BuyerID,
            Password,
            Email,
            PurchasesList: PurchasesList || [],
            AccountBalance: AccountBalance || 0
        };

        // Insert the new buyer into the collection
        await collection.insertOne(newBuyer);
        res.status(201).json({ message: "Buyer created successfully", buyer: newBuyer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Edit a buyer
exports.editBuyer = async(req, res) => {
    try {
        const { id } = req.params; // MongoDB ObjectId
        const { Email, Password, PurchasesList, AccountBalance } = req.body;

        const db = await connectDB(); // Get DB connection
        const collection = db.collection('buyers'); // Access the 'buyers' collection

        // Find the buyer by _id
        const buyer = await collection.findOne({ _id: new ObjectId(id) });
        if (!buyer) {
            return res.status(404).json({ message: "Buyer not found" });
        }

        // Update the buyer's information
        const updatedBuyer = {
            Email: Email || buyer.Email,
            Password: Password || buyer.Password,
            PurchasesList: PurchasesList || buyer.PurchasesList,
            AccountBalance: AccountBalance || buyer.AccountBalance
        };

        // Update the buyer in the collection
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedBuyer });

        res.status(200).json({ message: "Buyer updated successfully", buyer: updatedBuyer });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a buyer
exports.deleteBuyer = async(req, res) => {
    const { id } = req.params; // Get the buyer ID from the URL

    try {
        const db = await connectDB(); // Get DB connection
        const collection = db.collection('buyers'); // Access the 'buyers' collection

        // Delete the buyer from the collection
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        res.status(200).json({ message: 'Buyer deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete buyer', error });
    }
};


exports.getBuyers = async(req, res) => {
    try {
        const db = await connectDB(); // Get DB connection
        const collection = db.collection('buyers'); // Access the 'buyers' collection

        const buyers = await collection.find().toArray(); // Fetch all buyers from the collection

        res.render('layout', {
            title: 'Buyers',
            content: 'admin/buyers',
            buyers: buyers // Pass buyers data to the view
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
/*------------------purchases---------------------*/
exports.getPurchases = async(req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection('buyers');

        // Fetch all buyers and their purchases
        const buyers = await collection.find().toArray();

        // Create an array of buyer details with name, id, and their purchases
        const buyerPurchases = buyers.map(buyer => {
            return {
                id: buyer.BuyerID, // Buyer ID
                email: buyer.Email, // Assuming 'name' is a field in your buyer document
                purchases: buyer.PurchasesList || [] // Array of purchases
            };
        });

        // Render purchases.ejs and pass the buyerPurchases array
        res.render('layout', {
            title: 'purchases',
            content: 'admin/purchases',
            buyerPurchases
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};