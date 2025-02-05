const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://ftmekhvri:SHCHMgGexwVFy3V8@cluster0.g3npw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

const admins = [

    {
        email:"admin@email.com",
        password:"admin123"

    }
];

async function run() {
    try {
        await client.connect();

        const database = client.db('Dribble'); 
        const collection = database.collection('admins'); 


        const result = await collection.insertMany(admins);

        console.log(`${result.insertedCount} designers were inserted with the following IDs:`);
        console.log(result.insertedIds);
    } catch (error) {
        console.error('Error inserting designers:', error);
    } finally {
        await client.close();
    }
}

run().catch(console.error);
