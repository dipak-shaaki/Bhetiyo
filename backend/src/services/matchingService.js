import Item from "../models/Item.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { pool } from "../config/postgres.js"; // ensure exported pool
import notificationAI from "./notificationAI.js";

// threshold tuning: for text-only embeddings, 0.75-0.85 is typical; start with 0.75
const THRESHOLD = 0.75;

async function checkMatchesForFoundItem(foundItem) {
  // find candidate lost items that are open
  const lostItems = await Item.find({ type: "lost", status: "open", embedding: { $ne: [] } }).lean();

  const matches = [];

  for (const lost of lostItems) {
    const score = cosineSimilarity(foundItem.embedding, lost.embedding);
    if (score >= THRESHOLD) {
      matches.push({ lostId: lost._id.toString(), foundId: foundItem._id.toString(), score });
    }
  }

  // persist matches into Postgres and generate notification
  for (const m of matches) {
    try {
      // insert match into Postgres
      const insertMatchSQL = `
        INSERT INTO matches (lost_item_id, found_item_id, score, created_at)
        VALUES ($1,$2,$3,NOW()) RETURNING id
      `;
      const client = await pool.connect();
      const res = await client.query(insertMatchSQL, [m.lostId, m.foundId, m.score]);
      const matchId = res.rows[0].id;

      // create notification message via LLM
      const lostItem = await Item.findById(m.lostId);
      const foundItem = foundItem; // already have
      const notification = await notificationAI.generateMatchNotification({
        lostItem,
        foundItem,
        score: m.score
      });

      // store notification in Postgres
      const insertNotifSQL = `
        INSERT INTO notifications (user_id, match_id, message, created_at)
        VALUES ($1,$2,$3,NOW())
      `;
      await client.query(insertNotifSQL, [lostItem.ownerId.toString(), matchId, notification.message]);

      client.release();

    } catch (err) {
      console.error("matchingService persist error", err);
    }
  }

  return matches;
}

export default { checkMatchesForFoundItem, THRESHOLD };
