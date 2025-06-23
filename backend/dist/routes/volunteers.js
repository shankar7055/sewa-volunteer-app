import express from "express";
import { prisma } from "../app.js";
import { authenticateToken, requireManagerOrAdmin } from "../middleware/auth.js";
import { generateQRCode } from "../services/qrService.js";
const router = express.Router();
// Get all volunteers
router.get("/", authenticateToken, async (req, res, next) => {
    try {
        const volunteers = await prisma.volunteer.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(volunteers);
    }
    catch (error) {
        next(error);
    }
});
// Get volunteer by ID
router.get("/:id", authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const volunteer = await prisma.volunteer.findUnique({
            where: { id },
            include: {
                attendances: {
                    orderBy: { checkInTime: "desc" },
                    take: 10,
                },
            },
        });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        res.json(volunteer);
    }
    catch (error) {
        next(error);
    }
});
// Create new volunteer
router.post("/", authenticateToken, requireManagerOrAdmin, async (req, res, next) => {
    try {
        const { name, email, phone, address, skills, availability, status } = req.body;
        // Check if email already exists
        const existingVolunteer = await prisma.volunteer.findUnique({
            where: { email },
        });
        if (existingVolunteer) {
            return res.status(400).json({ message: "Email already in use" });
        }
        // Create new volunteer
        const newVolunteer = await prisma.volunteer.create({
            data: {
                name,
                email,
                phone,
                address,
                skills,
                availability,
                status,
                createdById: req.user?.id,
            },
        });
        res.status(201).json(newVolunteer);
    }
    catch (error) {
        next(error);
    }
});
// Update volunteer
router.put("/:id", authenticateToken, requireManagerOrAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, skills, availability, status } = req.body;
        // Check if volunteer exists
        const volunteer = await prisma.volunteer.findUnique({
            where: { id },
        });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        // Check if email is already in use by another volunteer
        if (email && email !== volunteer.email) {
            const existingVolunteer = await prisma.volunteer.findUnique({
                where: { email },
            });
            if (existingVolunteer && existingVolunteer.id !== id) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }
        // Update volunteer
        const updatedVolunteer = await prisma.volunteer.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
                skills,
                availability,
                status,
                updatedById: req.user?.id,
            },
        });
        res.json(updatedVolunteer);
    }
    catch (error) {
        next(error);
    }
});
// Delete volunteer
router.delete("/:id", authenticateToken, requireManagerOrAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if volunteer exists
        const volunteer = await prisma.volunteer.findUnique({
            where: { id },
        });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        // Delete volunteer
        await prisma.volunteer.delete({
            where: { id },
        });
        res.json({ message: "Volunteer deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// Generate QR code for volunteer
router.get("/:id/qr", authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if volunteer exists
        const volunteer = await prisma.volunteer.findUnique({
            where: { id },
        });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        // Generate QR code data
        const qrData = JSON.stringify({
            id: volunteer.id,
            name: volunteer.name,
            timestamp: new Date().toISOString(),
        });
        // Generate QR code image
        const qrCodeImage = await generateQRCode(qrData);
        // Update volunteer with QR code
        const updatedVolunteer = await prisma.volunteer.update({
            where: { id },
            data: {
                qrCode: qrCodeImage,
                qrCodeData: qrData,
            },
        });
        res.json({
            message: "QR code generated successfully",
            qrCode: updatedVolunteer.qrCode,
            qrData: updatedVolunteer.qrCodeData,
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=volunteers.js.map