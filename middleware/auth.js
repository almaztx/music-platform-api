const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT токенін тексеру және пайдаланушыны аутентификациялау
exports.protect = async (req, res, next) => {
    let token;

    // Authorization header-нен токенді алу
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Токен жоқ екенін тексеру
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Кіруге рұқсат жоқ. Токен жіберілмеді",
        });
    }

    try {
        // Токенді верификациялау
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Пайдаланушыны табу
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Пайдаланушы табылмады",
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Токен жарамсыз немесе мерзімі өткен",
        });
    }
};
