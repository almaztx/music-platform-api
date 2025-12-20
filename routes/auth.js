const express = require("express");
const router = express.Router();
const User = require("../models/User");

// @route   POST /api/auth/register
// @desc    Жаңа пайдаланушыны тіркеу
// @access  Public
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Пайдаланушы бар-жоғын тексеру
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                error: "Бұл email-мен пайдаланушы тіркелген",
            });
        }

        // Жаңа пайдаланушы құру
        user = await User.create({ username, email, password });

        // JWT токен генерациялау
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   POST /api/auth/login
// @desc    Пайдаланушыны жүйеге кіргізу
// @access  Public
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email және password бар-жоғын тексеру
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email және құпия сөзді енгізіңіз",
            });
        }

        // Пайдаланушыны табу (құпия сөзді қоса)
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Қате email немесе құпия сөз",
            });
        }

        // Құпия сөзді тексеру
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Қате email немесе құпия сөз",
            });
        }

        // Токен генерациялау
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// @route   GET /api/auth/me
// @desc    Ағымдағы пайдаланушы ақпаратын алу
// @access  Private
router.get("/me", require("../middleware/auth").protect, async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

module.exports = router;
