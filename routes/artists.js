const express = require("express");
const router = express.Router();
const Artist = require("../models/Artist");
const Track = require("../models/Track");
const spotifyService = require("../services/spotify");
const { protect } = require("../middleware/auth");

// @route   GET /api/artists
// @desc    Барлық артистерді алу
// @access  Public
router.get("/", async (req, res) => {
    try {
        const artists = await Artist.find();

        res.status(200).json({
            success: true,
            count: artists.length,
            data: artists,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   GET /api/artists/:id
// @desc    Нақты артистті алу
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                error: "Артист табылмады",
            });
        }

        // Артисттің тректерін алу
        const tracks = await Track.find({ artist: req.params.id });

        res.status(200).json({
            success: true,
            data: {
                artist,
                tracks,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   POST /api/artists
// @desc    Жаңа артист құру
// @access  Private
router.post("/", protect, async (req, res) => {
    try {
        const artist = await Artist.create(req.body);

        res.status(201).json({
            success: true,
            data: artist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   PUT /api/artists/:id
// @desc    Артистті жаңарту
// @access  Private
router.put("/:id", protect, async (req, res) => {
    try {
        const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!artist) {
            return res.status(404).json({
                success: false,
                error: "Артист табылмады",
            });
        }

        res.status(200).json({
            success: true,
            data: artist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   DELETE /api/artists/:id
// @desc    Артистті жою
// @access  Private
router.delete("/:id", protect, async (req, res) => {
    try {
        const artist = await Artist.findByIdAndDelete(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                error: "Артист табылмады",
            });
        }

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

// @route   GET /api/artists/spotify/top-tracks
// @desc    Spotify-дан артисттің топ-тректерін алу
// @access  Public
router.get("/spotify/top-tracks", async (req, res) => {
    try {
        const { artistName } = req.query;

        if (!artistName) {
            return res.status(400).json({
                success: false,
                error: "Артист атын көрсетіңіз (artistName параметрі)",
            });
        }

        const tracks = await spotifyService.getArtistTopTracks(artistName);

        res.status(200).json({
            success: true,
            count: tracks.length,
            data: tracks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   POST /api/artists/spotify/add/top-tracks
// @desc    Spotify-дан артисттің топ-тректерін алып, дерекқорға жазу
// @access  Private
router.post("/spotify/add/top-tracks", protect, async (req, res) => {
    try {
        const { artistName } = req.query;

        if (!artistName) {
            return res.status(400).json({
                success: false,
                error: "Артист атын көрсетіңіз (artistName параметрі)",
            });
        }

        // Spotify-дан артист ақпаратын алу
        const spotifyArtistData = await spotifyService.searchArtist(artistName);

        if (!spotifyArtistData) {
            return res.status(404).json({
                success: false,
                error: "Артист Spotify-да табылмады",
            });
        }

        // Артистті дерекқорда іздеу немесе құру
        let artist = await Artist.findOne({ spotifyId: spotifyArtistData.id });

        if (!artist) {
            artist = await Artist.create({
                name: spotifyArtistData.name,
                genres: spotifyArtistData.genres,
                spotifyId: spotifyArtistData.id,
                imageUrl: spotifyArtistData.images[0]?.url || null,
                bio: `Артист: ${
                    spotifyArtistData.name
                }. Жанрлар: ${spotifyArtistData.genres.join(", ")}`,
            });
        }

        // Spotify-дан топ-тректерді алу
        const spotifyTracks = await spotifyService.getArtistTopTracks(
            artistName
        );

        // Дерекқорға жазылған тректерді сақтау үшін массив
        const savedTracks = [];
        const skippedTracks = [];

        // Әр тректі дерекқорға жазу
        for (const spotifyTrack of spotifyTracks) {
            try {
                // Трек бұрын қосылған ба тексеру (spotifyId бойынша)
                let existingTrack = await Track.findOne({
                    spotifyId: spotifyTrack.spotifyId,
                });

                if (existingTrack) {
                    skippedTracks.push({
                        title: existingTrack.title,
                        reason: "Трек дерекқорда бар",
                    });
                    continue;
                }

                // Жаңа тректі құру
                const newTrack = await Track.create({
                    title: spotifyTrack.title,
                    artist: artist._id,
                    duration: spotifyTrack.duration,
                    album: spotifyTrack.album,
                    releaseYear: spotifyTrack.releaseYear,
                    spotifyId: spotifyTrack.spotifyId,
                    genre: "Other", // Spotify API жанр бермейді тректерге
                });

                savedTracks.push(newTrack);
            } catch (trackError) {
                skippedTracks.push({
                    title: spotifyTrack.title,
                    reason: trackError.message,
                });
            }
        }

        res.status(201).json({
            success: true,
            message: `${savedTracks.length} трек сәтті қосылды`,
            data: {
                artist: {
                    id: artist._id,
                    name: artist.name,
                    spotifyId: artist.spotifyId,
                },
                savedTracks: savedTracks,
                skippedTracks: skippedTracks,
                summary: {
                    total: spotifyTracks.length,
                    saved: savedTracks.length,
                    skipped: skippedTracks.length,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
