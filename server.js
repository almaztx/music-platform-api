const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// .env файлын жүктеу
dotenv.config();

// MongoDB-ға қосылу
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Маршруттарды қосу
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tracks", require("./routes/tracks"));
app.use("/api/artists", require("./routes/artists"));
app.use("/api/playlists", require("./routes/playlists"));

// Негізгі маршрут
app.get("/", (req, res) => {
    res.json({
        message: "🎵 Music Platform API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            tracks: "/api/tracks",
            artists: "/api/artists",
            playlists: "/api/playlists (қорғалған)",
            spotify: "/api/artists/spotify/top-tracks",
        },
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Сервер ${PORT} портында жұмыс істеп тұр`);
});

module.exports = app;
