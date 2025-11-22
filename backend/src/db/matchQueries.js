// Match queries for PostgreSQL

// Insert a new match
const insertMatch = `
  INSERT INTO matches (lost_item_id, found_item_id, text_score, location_score, combined_score, created_at)
  VALUES ($1, $2, $3, $4, $5, NOW())
  RETURNING id
`;

// Get matches for a lost item
const getMatchesForLostItem = `
  SELECT * FROM matches 
  WHERE lost_item_id = $1 
  ORDER BY combined_score DESC
`;

// Get matches for a found item
const getMatchesForFoundItem = `
  SELECT * FROM matches 
  WHERE found_item_id = $1 
  ORDER BY combined_score DESC
`;

// Get all matches (with pagination)
const getAllMatches = `
  SELECT * FROM matches 
  ORDER BY created_at DESC
  LIMIT $1 OFFSET $2
`;

export default {
    insertMatch,
    getMatchesForLostItem,
    getMatchesForFoundItem,
    getAllMatches
};