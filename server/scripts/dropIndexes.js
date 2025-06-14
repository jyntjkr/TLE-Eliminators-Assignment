const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');
        
        // Get the students collection
        const studentsCollection = mongoose.connection.collection('students');
        
        // Drop all indexes
        await studentsCollection.dropIndexes();
        console.log('Dropped all indexes from students collection');
        
        // Create new indexes
        await studentsCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
        await studentsCollection.createIndex({ codeforcesHandle: 1 }, { unique: true });
        console.log('Created new indexes');
        
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

dropIndexes(); 