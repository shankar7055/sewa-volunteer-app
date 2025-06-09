import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

// Import routes
import authRoutes from "./routes/auth"
import volunteerRoutes from "./routes/volunteers"
import attendanceRoutes from "./routes/attendance"
import dashboardRoutes from "./routes/dashboard"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// Initialize Prisma client
export const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/volunteers", volunteerRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  console.log("Disconnected from database")
  process.exit(0)
})
