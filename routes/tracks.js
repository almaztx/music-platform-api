const express = require("express");
const router = express.Router();
const Track = require("../models/Track");
const { protect } = require("../middleware/auth");

// @route   GET /api/tracks
// @desc    Барлық тректерді алу
// @access  Public
router.get("/", async (req, res) => {
    try {
        const tracks = await Track.find().populate("artist", "name genres");

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

// @route   GET /api/tracks/:id
// @desc    Нақты тректі алу
// @access  Public
router.get("/:id", async (req, res) => {
    try {
        const track = await Track.findById(req.params.id).populate(
            "artist",
            "name genres"
        );

        if (!track) {
            return res.status(404).json({
                success: false,
                error: "Трек табылмады",
            });
        }

        res.status(200).json({
            success: true,
            data: track,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   POST /api/tracks
// @desc    Жаңа трек құру
// @access  Private
router.post("/", protect, async (req, res) => {
    try {
        const track = await Track.create(req.body);

        res.status(201).json({
            success: true,
            data: track,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   PUT /api/tracks/:id
// @desc    Тректі жаңарту
// @access  Private
router.put("/:id", protect, async (req, res) => {
    try {
        const track = await Track.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!track) {
            return res.status(404).json({
                success: false,
                error: "Трек табылмады",
            });
        }

        res.status(200).json({
            success: true,
            data: track,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   DELETE /api/tracks/:id
// @desc    Тректі жою
// @access  Private
router.delete("/:id", protect, async (req, res) => {
    try {
        const track = await Track.findByIdAndDelete(req.params.id);

        if (!track) {
            return res.status(404).json({
                success: false,
                error: "Трек табылмады",
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

module.exports = router;
