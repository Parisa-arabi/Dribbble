const jwt = require('jsonwebtoken');
const { client } = require('../config/db'); 
const { ObjectId } = require('mongodb');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            console.log("No token provided");
            return res.redirect('/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const database = client.db('Dribble'); 
        const designersCollection = database.collection('designers');
        
        const designer = await designersCollection.findOne({ 
            _id: new ObjectId(decoded.id)
        });

        if (!designer) {
            console.log('No designer found with ID:', decoded.id);
            return res.redirect('/auth/login');
        }

        req.designer = designer;
        next();
        
    } catch (error) {
        console.error('Token verification error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message
        });
        return res.redirect('/auth/login');
    }
};

module.exports = verifyToken;