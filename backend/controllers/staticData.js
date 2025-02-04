const { MongoClient, ObjectId } = require('mongodb');

// Replace with your actual connection string  
const uri = 'mongodb+srv://ftmekhvri:SHCHMgGexwVFy3V8@cluster0.g3npw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Array of designers, using ObjectId for each designer
const admins = [

    {
        email:"admin@email.com",
        password:"admin123"

    }
];

async function run() {
    try {
        // Connect to the MongoDB cluster  
        await client.connect();

        // Specify the database and collection  
        const database = client.db('Dribble'); // Change 'Dribble' to your database name
        const collection = database.collection('admins'); // Change 'designers' to your collection name


        // Insert the new designers array into the collection  
        const result = await collection.insertMany(admins);

        console.log(`${result.insertedCount} designers were inserted with the following IDs:`);
        console.log(result.insertedIds);
    } catch (error) {
        console.error('Error inserting designers:', error);
    } finally {
        // Close the connection after the operation  
        await client.close();
    }
}

run().catch(console.error);
