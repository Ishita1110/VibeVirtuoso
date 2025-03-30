const Music = require("./models/music.model");

// Save music logic
const saveMusic = async (req, res) => {
  const { userEmail, songId, title, instruments } = req.body;

  try {
    const existingMusic = await Music.findOne({ songId });
    if (existingMusic) return res.status(400).json({ message: "Music already exists" });

    const newMusic = new Music({ userEmail, songId, title, instruments });
    await newMusic.save();

    res.status(201).json({ message: `Music '${title}' saved successfully!`, musicId: newMusic._id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve music logic
const getMusic = async (req, res) => {
  const { userEmail } = req.query;

  try {
    const recordings = await Music.find({ userEmail });
    res.status(200).json(recordings);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete music logic
const deleteMusic = async (req, res) => {
  const { userEmail, songId } = req.body;

  try {
    const result = await Music.deleteOne({ userEmail, songId });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: `Music with ID '${songId}' deleted successfully!` });
    } else {
      res.status(404).json({ message: "Music not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { saveMusic, getMusic, deleteMusic };
