import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../app.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
// Register new user
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password, role = "user" } = req.body;
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET || "fallback_secret", {
            expiresIn: "7d",
        });
        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
            token,
        });
    }
    catch (error) {
        next(error);
    }
});
// Login user
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", {
            expiresIn: "7d",
        });
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: "Login successful",
            user: userWithoutPassword,
            token,
        });
    }
    catch (error) {
        next(error);
    }
});
// Get current user profile
router.get("/profile", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
// Update user profile
router.put("/profile", authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { name, email, currentPassword, newPassword } = req.body;
        // Get current user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Prepare update data
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email && email !== user.email) {
            // Check if email is already in use
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: "Email already in use" });
            }
            updateData.email = email;
        }
        // Update password if provided
        if (currentPassword && newPassword) {
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }
        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=auth.js.map