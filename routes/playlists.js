const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");
const { protect } = require("../middleware/auth");

// Барлық маршруттар қорғалған (protect middleware)
router.use(protect);

// @route   GET /api/playlists
// @desc    Пайдаланушының барлық плейлисттерін алу
// @access  Private
router.get("/", async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user.id })
            .populate("tracks", "title duration album")
            .populate("owner", "username email");

        res.status(200).json({
            success: true,
            count: playlists.length,
            data: playlists,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   GET /api/playlists/:id
// @desc    Нақты плейлистті алу
// @access  Private
router.get("/:id", async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate("tracks", "title duration album artist")
            .populate({
                path: "tracks",
                populate: { path: "artist", select: "name" },
            });

        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: "Плейлист табылмады",
            });
        }

        // Плейлист иесі немесе public екенін тексеру
        if (playlist.owner.toString() !== req.user.id && !playlist.isPublic) {
            return res.status(403).json({
                success: false,
                error: "Бұл плейлистке қолжетімділік жоқ",
            });
        }

        res.status(200).json({
            success: true,
            data: playlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   POST /api/playlists
// @desc    Жаңа плейлист құру
// @access  Private
router.post("/", async (req, res) => {
    try {
        req.body.owner = req.user.id;

        const playlist = await Playlist.create(req.body);

        res.status(201).json({
            success: true,
            data: playlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   PUT /api/playlists/:id
// @desc    Плейлистті жаңарту
// @access  Private
router.put("/:id", async (req, res) => {
    try {
        let playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: "Плейлист табылмады",
            });
        }

        // Тек иесі ғана өзгерте алады
        if (playlist.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: "Өзгерту құқығыңыз жоқ",
            });
        }

        playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: playlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   DELETE /api/playlists/:id
// @desc    Плейлистті жою
// @access  Private
router.delete("/:id", async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: "Плейлист табылмады",
            });
        }

        // Тек иесі ғана жоя алады
        if (playlist.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: "Жою құқығыңыз жоқ",
            });
        }

        await playlist.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   PUT /api/playlists/:id/tracks/:trackId
// @desc    Плейлистке трек қосу
// @access  Private
router.put("/:id/tracks/:trackId", async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: "Плейлист табылмады",
            });
        }

        if (playlist.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: "Өзгерту құқығыңыз жоқ",
            });
        }

        // Трек қосылғанын тексеру
        if (playlist.tracks.includes(req.params.trackId)) {
            return res.status(400).json({
                success: false,
                error: "Бұл трек плейлистте бар",
            });
        }

        playlist.tracks.push(req.params.trackId);
        await playlist.save();

        res.status(200).json({
            success: true,
            data: playlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   DELETE /api/playlists/:id/tracks/:trackId
// @desc    Плейлисттен тректі жою
// @access  Private
router.delete("/:id/tracks/:trackId", async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: "Плейлист табылмады",
            });
        }

        if (playlist.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: "Өзгерту құқығыңыз жоқ",
            });
        }

        playlist.tracks = playlist.tracks.filter(
            (track) => track.toString() !== req.params.trackId
        );

        await playlist.save();

        res.status(200).json({
            success: true,
            data: playlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
