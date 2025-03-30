const mongoose = require("mongoose");
const User = require("./models/user.model");
const Music = require("./models/music.model");

const testDatabaseHits = async () => {
  try {
    // Connect to the database
    await mongoose.connect("mongodb+srv://user2:User2@gesture.kdizmwb.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");

    // Test user creation
    const newUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: "hashed_password",
    });
    await newUser.save();
    console.log("User saved successfully!");

    // Test music creation
    const newMusic = new Music({
      userEmail: "test@example.com",
      songId: "song123",
      title: "Test Song",
      instruments: ["guitar", "piano"],
    });
    await newMusic.save();
    console.log("Music saved successfully!");

    // Disconnect from the database
    await mongoose.disconnect();
    console.log("MongoDB disconnected!");
  } catch (error) {
    console.error("Error during database hit test:", error);
  }
};

// Run the test
testDatabaseHits();
