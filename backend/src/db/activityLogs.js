// Activity logs queries for PostgreSQL

// Insert a new activity log
const insertActivityLog = `
  INSERT INTO activity_logs (user_id, action, item_id, details, created_at)
  VALUES ($1, $2, $3, $4, NOW())
  RETURNING id
`;

// Get activity logs for a user
const getActivityLogsForUser = `
  SELECT * FROM activity_logs 
  WHERE user_id = $1 
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
`;

// Get activity logs by action type
const getActivityLogsByAction = `
  SELECT * FROM activity_logs 
  WHERE action = $1 
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
`;

export default {
    insertActivityLog,
    getActivityLogsForUser,
    getActivityLogsByAction
};