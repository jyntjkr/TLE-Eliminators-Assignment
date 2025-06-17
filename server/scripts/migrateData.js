const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the correct path
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');

async function migrateData() {
    try {
        console.log('Starting data migration...');
        console.log('Environment variables loaded:', {
            MONGO_URI: process.env.MONGO_URI ? 'Set (hidden for security)' : 'Not set',
            NODE_ENV: process.env.NODE_ENV
        });
        
        // Check if MONGO_URI is set
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set');
        }
        
        // Connect to MongoDB Atlas
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB Atlas successfully');
        
        // Get all students
        const students = await Student.find({});
        console.log(`Found ${students.length} students to migrate`);
        
        // Migrate each student
        for (const student of students) {
            console.log(`Migrating student: ${student.name}`);
            
            // Create CodeforcesData document if student has contest or submission history
            if (student.contestHistory?.length > 0 || student.submissionHistory?.length > 0) {
                await CodeforcesData.findOneAndUpdate(
                    { studentId: student._id, handle: student.codeforcesHandle },
                    {
                        studentId: student._id,
                        handle: student.codeforcesHandle,
                        contests: student.contestHistory || [],
                        submissions: student.submissionHistory || [],
                        lastUpdated: student.lastUpdated || new Date()
                    },
                    { upsert: true }
                );
            }
            
            // Update student document with new fields
            await Student.findByIdAndUpdate(student._id, {
                $set: {
                    lastDataSync: student.lastUpdated,
                    isDataSyncing: false
                },
                $unset: {
                    contestHistory: 1,
                    submissionHistory: 1,
                    lastUpdated: 1
                }
            });
        }
        
        console.log('Data migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
        if (error.message.includes('environment variable')) {
            console.error('\nPlease ensure:');
            console.error('1. The .env file exists in the server directory');
            console.error('2. The MONGO_URI variable is set in the .env file');
            console.error('3. The .env file is in the correct format: MONGO_URI=your_connection_string');
        }
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB Atlas');
        }
    }
}

// Run migration
migrateData(); 