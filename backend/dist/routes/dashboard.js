import express from "express";
import { prisma } from "../app.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
// Get dashboard statistics
router.get("/stats", authenticateToken, async (req, res, next) => {
    try {
        // Get total volunteers count
        const totalVolunteers = await prisma.volunteer.count();
        // Get active volunteers count
        const activeVolunteers = await prisma.volunteer.count({
            where: { status: "active" },
        });
        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        // Get total hours this month
        const attendances = await prisma.attendance.findMany({
            where: {
                checkInTime: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
                duration: {
                    not: null,
                },
            },
            select: {
                duration: true,
            },
        });
        const totalMinutes = attendances.reduce((total, attendance) => {
            return total + (attendance.duration || 0);
        }, 0);
        const totalHoursThisMonth = Math.round(totalMinutes / 60);
        // Calculate attendance rate (percentage of active volunteers who checked in this month)
        const volunteersWithAttendance = await prisma.attendance.findMany({
            where: {
                checkInTime: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            select: {
                volunteerId: true,
            },
            distinct: ["volunteerId"],
        });
        const attendanceRate = activeVolunteers > 0 ? Math.round((volunteersWithAttendance.length / activeVolunteers) * 100) : 0;
        res.json({
            totalVolunteers,
            activeVolunteers,
            totalHoursThisMonth,
            attendanceRate,
        });
    }
    catch (error) {
        next(error);
    }
});
// Get recent activity
router.get("/activity", authenticateToken, async (req, res, next) => {
    try {
        // Get recent activities
        const activities = await prisma.activity.findMany({
            include: {
                volunteer: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                timestamp: "desc",
            },
            take: 20,
        });
        // Format activities
        const formattedActivities = activities.map((activity) => ({
            id: activity.id,
            type: activity.type,
            volunteerId: activity.volunteerId,
            volunteerName: activity.volunteer?.name,
            timestamp: activity.timestamp,
            details: activity.details,
        }));
        res.json(formattedActivities);
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=dashboard.js.map