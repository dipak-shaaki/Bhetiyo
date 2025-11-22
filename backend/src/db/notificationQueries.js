// Notification queries for PostgreSQL

// Insert a new notification
const insertNotification = `
  INSERT INTO notifications (user_id, match_id, subject, message, created_at)
  VALUES ($1, $2, $3, $4, NOW())
  RETURNING id
`;

// Get notifications for a user
const getNotificationsForUser = `
  SELECT * FROM notifications 
  WHERE user_id = $1 
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
`;

// Mark notification as read
const markNotificationAsRead = `
  UPDATE notifications 
  SET read = TRUE 
  WHERE id = $1
`;

// Get unread notifications count for a user
const getUnreadNotificationsCount = `
  SELECT COUNT(*) as count FROM notifications 
  WHERE user_id = $1 AND read = FALSE
`;

export default {
    insertNotification,
    getNotificationsForUser,
    markNotificationAsRead,
    getUnreadNotificationsCount
};