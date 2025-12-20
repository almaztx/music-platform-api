const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Артист атын енгізіңіз"],
        unique: true,
        trim: true,
    },
    bio: {
        type: String,
        maxlength: [500, "Биография 500 символдан аспауы керек"],
    },
    genres: [
        {
            type: String,
        },
    ],
    spotifyId: {
        type: String,
        unique: true,
        sparse: true,
    },
    imageUrl: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Artist", ArtistSchema);
