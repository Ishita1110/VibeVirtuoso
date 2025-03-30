const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const MONGO_URI = "mongodb+srv://user1:User1@gesture.kdizmwb.mongodb.net/";

// Connect to MongoDB Atlas
async function connectToMongoDB() {
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    return client;
}

// Save recording function
async function saveRecording(recordingData) {
    const client = await connectToMongoDB();
    const db = client.db('music_system');
    const recordingsCollection = db.collection('recordings');
    
    try {
        // Insert the recording data into the collection
        const result = await recordingsCollection.insertOne(recordingData);
        console.log("Recording saved successfully! ID:", result.insertedId);
        return result.insertedId.toString();
    } catch (err) {
        console.error("An error occurred while saving the recording:", err);
        return null;
    } finally {
        await client.close();
    }
}

// Example Usage
(async () => {
    // Define a sample recording
    const sampleRecording = {
        song_id: "1234567891111",
        title: "My First Song",
        tempo: 1200,
        effects: ["reverb", "echo"],
        instruments: [
            { instrument: "drums", notes: [{ timestamp: 0.5, note: "kick" }] },
            { instrument: "guitar", notes: [{ timestamp: 0.5, chord: "C" }] }
        ]
    };

    // Save the recording to the database
    await saveRecording(sampleRecording);
})();
