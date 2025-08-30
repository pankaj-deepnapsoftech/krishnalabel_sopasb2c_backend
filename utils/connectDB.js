const mongoose = require("mongoose");

exports.connectDB = async ()=>{
    try {
        console.log("Connecting to database...", process.env.MONGODB_URL);
        await mongoose.connect(process.env.MONGODB_URL);
        const dbHost = new URL(process.env.MONGODB_URL).hostname;
        console.log(`Database connected successfully to: ${dbHost}`);
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}