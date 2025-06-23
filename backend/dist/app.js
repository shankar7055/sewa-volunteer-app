import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
// Import routes
import attendanceRoutes from "./routes/attendance.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import volunteerRoutes from "./routes/volunteers.js";
// Load environment variables
dotenv.config();
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
// Initialize Prisma client
export const prisma = new PrismaClient();
// Middleware
app.use(cors());
app.use(express.json());
// API routes
app.use("/api/auth", authRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Handle graceful shutdown
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    console.log("Disconnected from database");
    process.exit(0);
});
//# sourceMappingURL=app.js.map