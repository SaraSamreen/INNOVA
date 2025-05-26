const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

const mongoURI = process.env.ATLAS_URI;
console.log('Attempting to connect to MongoDB with URI:', 
  mongoURI ? `${mongoURI.substring(0, 20)}...` : 'No connection string found');

// Test MongoDB connection
async function testConnection() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log(`Connected to database: ${db.databaseName}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if Signup collection exists
    const signupCollection = collections.find(c => c.name === 'Signup');
    if (signupCollection) {
      console.log('✅ Signup collection found!');
      
      // Count documents in Signup collection
      const count = await db.collection('Signup').countDocuments();
      console.log(`There are ${count} documents in the Signup collection`);
      
      // Show a sample document (if any)
      if (count > 0) {
        const sample = await db.collection('Signup').findOne({});
        console.log('Sample document:', {
          id: sample._id,
          email: sample.email,
          // Don't log the password hash for security
          hasPassword: !!sample.password,
          fields: Object.keys(sample)
        });
      }
    } else {
      console.log('❌ Signup collection NOT found! It will be created when you add the first user.');
    }
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

testConnection();