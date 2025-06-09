import express from "express"
import { prisma } from "../app"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Record attendance from QR code
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { qrData } = req.body

    if (!qrData) {
      return res.status(400).json({ message: "QR data is required" })
    }

    // Parse QR data
    let parsedData
    try {
      parsedData = JSON.parse(qrData)
    } catch (error) {
      return res.status(400).json({ message: "Invalid QR data format" })
    }

    const { id: volunteerId } = parsedData

    if (!volunteerId) {
      return res.status(400).json({ message: "Invalid QR data: missing volunteer ID" })
    }

    // Check if volunteer exists
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
    })

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" })
    }

    // Check if volunteer is already checked in
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        volunteerId,
        checkOutTime: null,
      },
      orderBy: {
        checkInTime: "desc",
      },
    })

    if (existingAttendance) {
      // Volunteer is already checked in, so check them out
      const checkOutTime = new Date()
      const checkInTime = new Date(existingAttendance.checkInTime)

      // Calculate duration in minutes
      const durationMs = checkOutTime.getTime() - checkInTime.getTime()
      const durationMinutes = Math.round(durationMs / (1000 * 60))

      // Update attendance record with check-out time
      const updatedAttendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkOutTime,
          duration: durationMinutes,
          status: "checked-out",
          recordedById: req.user?.id,
        },
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          type: "check-out",
          volunteerId,
          details: `Checked out after ${durationMinutes} minutes`,
          recordedById: req.user?.id,
        },
      })

      return res.json({
        message: "Volunteer checked out successfully",
        attendance: updatedAttendance,
        volunteerName: volunteer.name,
      })
    } else {
      // Volunteer is not checked in, so check them in
      const newAttendance = await prisma.attendance.create({
        data: {
          volunteerId,
          checkInTime: new Date(),
          status: "checked-in",
          recordedById: req.user?.id,
        },
      })

      // Create activity log
      await prisma.activity.create({
        data: {
          type: "check-in",
          volunteerId,
          details: "Checked in",
          recordedById: req.user?.id,
        },
      })

      return res.json({
        message: "Volunteer checked in successfully",
        attendance: newAttendance,
        volunteerName: volunteer.name,
      })
    }
  } catch (error) {
    next(error)
  }
})

// Get attendance records
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { volunteerId, startDate, endDate } = req.query

    // Build filter conditions
    const where: any = {}

    if (volunteerId) {
      where.volunteerId = volunteerId as string
    }

    if (startDate || endDate) {
      where.checkInTime = {}

      if (startDate) {
        where.checkInTime.gte = new Date(startDate as string)
      }

      if (endDate) {
        where.checkInTime.lte = new Date(endDate as string)
      }
    }

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        volunteer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        checkInTime: "desc",
      },
    })

    // Format response
    const formattedAttendances = attendances.map((attendance) => ({
      id: attendance.id,
      volunteerId: attendance.volunteerId,
      volunteerName: attendance.volunteer.name,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      duration: attendance.duration,
      status: attendance.status,
    }))

    res.json(formattedAttendances)
  } catch (error) {
    next(error)
  }
})

export default router
