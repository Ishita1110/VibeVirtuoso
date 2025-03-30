const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://user2:User2@gesture.kdizmwb.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true, // Ensure indexing is enabled
      useFindAndModify: false, // Disable deprecated findAndModify methods
    });
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;
