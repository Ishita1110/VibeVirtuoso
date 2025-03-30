const mongoose = require('mongoose');

// Define the schema for the Music model
const musicSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true, // Links music to a user via email
  },
  songId: {
    type: String,
    required: true,
    unique: true, // Ensures unique song IDs
  },
  title: {
    type: String,
    required: true, // Title of the song
  },
  instruments: {
    type: [String], // Array of strings to store instruments used in the music
    default: [], // Default value is an empty array
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the Music model
const Music = mongoose.model('Music', musicSchema);

module.exports = Music;
