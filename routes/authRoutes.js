const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

const {
    registerUser,
    loginUser,
    updateUserProfile
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", verifyToken, async (req, res) => {
    try {
        const [users] = await db.promise().query(
            "SELECT id, name, email, phone, bio FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Authenticated successfully",
            user: users[0]
        });

    } catch (error) {
        console.error("Fetching user error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.put("/profile", verifyToken, updateUserProfile);

module.exports = router;