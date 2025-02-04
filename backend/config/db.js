const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let dbConnection = null;

const connectDB = async () => {
    try {
        await client.connect();
        dbConnection = client.db('Dribble'); // Your database name
        console.log('MongoDB connected successfully');
        return dbConnection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; // Let the calling code handle the error
    }
};

const getDB = () => {
    if (!dbConnection) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return dbConnection;
};

module.exports = {
    connectDB,
    getDB,
    client
};