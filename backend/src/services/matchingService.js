import Item from "../models/Item.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { pool } from "../config/postgres.js"; // ensure exported pool
import notificationAI from "./notificationAI.js";
import matchQueries from "../db/matchQueries.js";
import notificationQueries from "../db/notificationQueries.js";

// threshold tuning: for text-only embeddings, 0.75-0.85 is typical; start with 0.75
const THRESHOLD = 0.75;
// Location similarity threshold
const LOCATION_THRESHOLD = 0.5;

// Simple location similarity function (placeholder for more sophisticated implementation)
function locationSimilarity(loc1, loc2) {
  if (!loc1 || !loc2) return 0;

  // Simple string similarity (could be enhanced with geocoding and distance calculation)
  const lowerLoc1 = loc1.toLowerCase();
  const lowerLoc2 = loc2.toLowerCase();

  // If one location contains the other, consider it a match
  if (lowerLoc1.includes(lowerLoc2) || lowerLoc2.includes(lowerLoc1)) {
    return 1;
  }

  // Simple word overlap calculation
  const words1 = lowerLoc1.split(/\s+/);
  const words2 = lowerLoc2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));

  return commonWords.length / Math.max(words1.length, words2.length);
}

async function checkMatchesForFoundItem(foundItem) {
  try {
    // find candidate lost items that are open
    const lostItems = await Item.find({
      type: "lost",
      status: "open",
      embedding: { $ne: [] }
    }).lean();

    console.log(`Found ${lostItems.length} candidate lost items for matching`);

    const matches = [];

    for (const lost of lostItems) {
      try {
        // Calculate text similarity
        const textScore = cosineSimilarity(foundItem.embedding, lost.embedding);

        // Calculate location similarity
        const locationScore = locationSimilarity(foundItem.locationText, lost.locationText);

        // Combined score (weighted average)
        // Text similarity is more important than location similarity
        const combinedScore = (textScore * 0.8) + (locationScore * 0.2);

        if (combinedScore >= THRESHOLD) {
          matches.push({
            lostId: lost._id.toString(),
            foundId: foundItem._id.toString(),
            textScore,
            locationScore,
            combinedScore
          });
        }
      } catch (err) {
        console.error(`Error calculating similarity for item ${lost._id}:`, err);
      }
    }

    console.log(`Found ${matches.length} potential matches`);

    // Sort matches by combined score (highest first)
    matches.sort((a, b) => b.combinedScore - a.combinedScore);

    // persist matches into Postgres and generate notification
    for (const m of matches) {
      try {
        // insert match into Postgres
        const client = await pool.connect();
        const res = await client.query(matchQueries.insertMatch, [
          m.lostId,
          m.foundId,
          m.textScore,
          m.locationScore,
          m.combinedScore
        ]);
        const matchId = res.rows[0].id;

        // create notification message via LLM
        const lostItem = await Item.findById(m.lostId);
        const foundItemObj = await Item.findById(m.foundId);

        const notification = await notificationAI.generateMatchNotification({
          lostItem,
          foundItem: foundItemObj,
          score: m.combinedScore
        });

        // store notification in Postgres
        await client.query(notificationQueries.insertNotification, [
          lostItem.ownerId.toString(),
          matchId,
          notification.subject,
          notification.message
        ]);

        client.release();

        console.log(`Created match ${matchId} for lost item ${m.lostId} and found item ${m.foundId}`);
      } catch (err) {
        console.error("matchingService persist error", err);
      }
    }

    return matches;
  } catch (err) {
    console.error("matchingService checkMatchesForFoundItem error", err);
    throw err;
  }
}

// Function to check matches for a lost item (reverse matching)
async function checkMatchesForLostItem(lostItem) {
  try {
    // find candidate found items that are open
    const foundItems = await Item.find({
      type: "found",
      status: "open",
      embedding: { $ne: [] }
    }).lean();

    console.log(`Found ${foundItems.length} candidate found items for matching`);

    const matches = [];

    for (const found of foundItems) {
      try {
        // Calculate text similarity
        const textScore = cosineSimilarity(lostItem.embedding, found.embedding);

        // Calculate location similarity
        const locationScore = locationSimilarity(lostItem.locationText, found.locationText);

        // Combined score (weighted average)
        const combinedScore = (textScore * 0.8) + (locationScore * 0.2);

        if (combinedScore >= THRESHOLD) {
          matches.push({
            lostId: lostItem._id.toString(),
            foundId: found._id.toString(),
            textScore,
            locationScore,
            combinedScore
          });
        }
      } catch (err) {
        console.error(`Error calculating similarity for item ${found._id}:`, err);
      }
    }

    console.log(`Found ${matches.length} potential matches`);

    // Sort matches by combined score (highest first)
    matches.sort((a, b) => b.combinedScore - a.combinedScore);

    // persist matches into Postgres and generate notification
    for (const m of matches) {
      try {
        // insert match into Postgres
        const client = await pool.connect();
        const res = await client.query(matchQueries.insertMatch, [
          m.lostId,
          m.foundId,
          m.textScore,
          m.locationScore,
          m.combinedScore
        ]);
        const matchId = res.rows[0].id;

        // create notification message via LLM
        const lostItem = await Item.findById(m.lostId);
        const foundItem = await Item.findById(m.foundId);

        const notification = await notificationAI.generateMatchNotification({
          lostItem,
          foundItem,
          score: m.combinedScore
        });

        // store notification in Postgres
        await client.query(notificationQueries.insertNotification, [
          lostItem.ownerId.toString(),
          matchId,
          notification.subject,
          notification.message
        ]);

        client.release();

        console.log(`Created match ${matchId} for lost item ${m.lostId} and found item ${m.foundId}`);
      } catch (err) {
        console.error("matchingService persist error", err);
      }
    }

    return matches;
  } catch (err) {
    console.error("matchingService checkMatchesForLostItem error", err);
    throw err;
  }
}

// Function to get matches for a user
async function getUserMatches(userId) {
  try {
    const client = await pool.connect();
    const query = `
      SELECT m.*, 
             l.title as lost_item_title,
             f.title as found_item_title,
             n.subject as notification_subject,
             n.message as notification_message,
             n.created_at as notification_created_at
      FROM matches m
      JOIN items l ON m.lost_item_id = l.id
      JOIN items f ON m.found_item_id = f.id
      LEFT JOIN notifications n ON m.id = n.match_id
      WHERE l.owner_id = $1
      ORDER BY m.created_at DESC
    `;
    const res = await client.query(query, [userId]);
    client.release();

    return res.rows;
  } catch (err) {
    console.error("matchingService getUserMatches error", err);
    throw err;
  }
}

export default {
  checkMatchesForFoundItem,
  checkMatchesForLostItem,
  getUserMatches,
  THRESHOLD
};