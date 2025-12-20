const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Трек атауын енгізіңіз"],
        trim: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
        required: [true, "Артистті көрсетіңіз"],
    },
    duration: {
        type: Number,
        required: [true, "Трек ұзақтығын енгізіңіз (секунд)"],
    },
    album: {
        type: String,
        default: "Unknown Album",
    },
    releaseYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear(),
    },
    genre: {
        type: String,
        enum: [
            "Pop",
            "Rock",
            "Hip-Hop",
            "Jazz",
            "Classical",
            "Electronic",
            "Other",
        ],
        default: "Other",
    },
    spotifyId: {
        type: String,
        unique: true,
        sparse: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Track", TrackSchema);
