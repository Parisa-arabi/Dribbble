const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://ftmekhvri:SHCHMgGexwVFy3V8@cluster0.g3npw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

const connectDB = async() => {
    try {
        await client.connect();
        const dbConnection = client.db('Dribble');
        console.log('MongoDB connected successfully');
        return dbConnection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; 
    }
};

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = {client , connectDB};