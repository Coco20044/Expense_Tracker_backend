const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        const [existingUsers] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.promise().query(
            `INSERT INTO users (name, email, password_hash)
             VALUES (?, ?, ?)`,
            [
                name.trim(),
                email.trim().toLowerCase(),
                passwordHash
            ]
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: result.insertId,
                name: name.trim(),
                email: email.trim().toLowerCase()
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, email, phone, bio } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUsers] = await db.promise().query(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            [normalizedEmail, req.user.id]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email is already in use"
            });
        }

        await db.promise().query(
            `UPDATE users
             SET name = ?, email = ?, phone = ?, bio = ?
             WHERE id = ?`,
            [
                name.trim(),
                normalizedEmail,
                phone ? phone.trim() : null,
                bio ? bio.trim() : null,
                req.user.id
            ]
        );

        const [users] = await db.promise().query(
            "SELECT id, name, email, phone, bio FROM users WHERE id = ?",
            [req.user.id]
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user: users[0]
        });

    } catch (error) {
        console.error("Profile update error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile
};