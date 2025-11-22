import { pool } from "../config/postgres.js";
import notificationQueries from "../db/notificationQueries.js";

// Get notifications for a user
export async function getUserNotifications(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Get page and limit from query parameters, with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const client = await pool.connect();
        const result = await client.query(notificationQueries.getNotificationsForUser, [
            userId,
            limit,
            offset
        ]);
        client.release();

        res.json({
            notifications: result.rows,
            page,
            limit,
            total: result.rows.length
        });
    } catch (err) {
        console.error("getUserNotifications error", err);
        res.status(500).json({ error: "Server error" });
    }
}

// Mark notification as read
export async function markNotificationAsRead(req, res) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const client = await pool.connect();

        // First, verify the notification belongs to the user
        const notificationResult = await client.query(
            "SELECT * FROM notifications WHERE id = $1 AND user_id = $2",
            [id, userId]
        );

        if (notificationResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: "Notification not found" });
        }

        // Mark as read
        await client.query(notificationQueries.markNotificationAsRead, [id]);
        client.release();

        res.json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("markNotificationAsRead error", err);
        res.status(500).json({ error: "Server error" });
    }
}

// Get unread notifications count
export async function getUnreadNotificationsCount(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const client = await pool.connect();
        const result = await client.query(notificationQueries.getUnreadNotificationsCount, [userId]);
        client.release();

        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error("getUnreadNotificationsCount error", err);
        res.status(500).json({ error: "Server error" });
    }
}

// Get notification by ID
export async function getNotificationById(req, res) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const client = await pool.connect();
        const result = await client.query(
            "SELECT * FROM notifications WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({ notification: result.rows[0] });
    } catch (err) {
        console.error("getNotificationById error", err);
        res.status(500).json({ error: "Server error" });
    }
}