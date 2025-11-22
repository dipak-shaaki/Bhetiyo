import express from "express";
import {
    getUserNotifications,
    markNotificationAsRead,
    getUnreadNotificationsCount,
    getNotificationById
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's notifications (with pagination)
router.get("/", getUserNotifications);

// Get unread notifications count
router.get("/unread-count", getUnreadNotificationsCount);

// Get specific notification by ID
router.get("/:id", getNotificationById);

// Mark notification as read
router.put("/:id/read", markNotificationAsRead);

export default router;