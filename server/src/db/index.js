const mongoose = require('mongoose');
const DB_NAME = require('../constants.js');


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect('mongodb://localhost:27017/test');
        // const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection Failed: ", error);
        process.exit(1);
    }
}
const mockConnectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect('mongodb://localhost:27017/temp');
        // const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection Failed: ", error);
        process.exit(1);
    }
}

module.exports = mockConnectDB,connectDB;
