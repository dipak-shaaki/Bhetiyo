import { pool } from "../config/postgres.js";

export async function listMatchesForUser(req, res) {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT m.id, m.lost_item_id, m.found_item_id, m.score, m.created_at, n.message
      FROM matches m
      LEFT JOIN notifications n ON n.match_id = m.id
      WHERE m.lost_item_id IN (
        SELECT _id::text FROM items WHERE ownerId = $1
      )
      ORDER BY m.created_at DESC
      LIMIT 100
    `;
    // Note: above assumes a Postgres view or items stored in Postgres; if items are only in Mongo,
    // we should query matches table by lost_item_id and then fetch items from Mongo separately.
    res.json({ message: "Implement listMatchesForUser - depends on your approach" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
