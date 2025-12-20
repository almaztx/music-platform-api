const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Плейлист атауын енгізіңіз"],
        trim: true,
    },
    description: {
        type: String,
        maxlength: [300, "Сипаттама 300 символдан аспауы керек"],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tracks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Track",
        },
    ],
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Playlist", PlaylistSchema);
