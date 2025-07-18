import jwt from "jsonwebtoken";
import { prisma } from "../app.js";
// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ message: "Server configuration error" });
        }
        const decoded = jwt.verify(token, jwtSecret);
        // Check if user exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        // Attach user to request object
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        next(error);
    }
};
// Check if user has admin role
export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};
// Check if user has admin or manager role
export const requireManagerOrAdmin = (req, res, next) => {
    if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        return res.status(403).json({ message: "Manager or admin access required" });
    }
    next();
};
//# sourceMappingURL=auth.js.map