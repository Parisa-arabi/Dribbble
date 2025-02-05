const { MongoClient } = require('mongodb');  

const uri = 'mongodb+srv://ftmekhvri:SHCHMgGexwVFy3V8@cluster0.g3npw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // آدرس اتصال به دیتابیس  

const client = new MongoClient(uri);  

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })  
    .then(() => console.log('MongoDB connected'))  
    .catch(err => console.error('MongoDB connection error:', err));  

await client.connect();  

const database = client.db('dribble');  
const categoriesCollection = database.collection('users');  

module.exports = { client, database, categoriesCollection };