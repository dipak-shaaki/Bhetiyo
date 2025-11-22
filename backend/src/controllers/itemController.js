import Item from "../models/Item.js";
import User from "../models/User.js";
import embeddingService from "../services/embeddingService.js";
import matchingService from "../services/matchingService.js";

// create item
export async function createItem(req, res) {
  try {
    const { type, title, description, locationText } = req.body;
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });
    if (!type || !title) return res.status(400).json({ error: "Missing fields" });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    // create item first without embedding to get _id
    const item = await Item.create({
      ownerId,
      type,
      title,
      description,
      locationText,
      imageUrl,
    });

    // generate embedding from title + description
    const text = `${title}. ${description || ""}`;
    const embedding = await embeddingService.getTextEmbedding(text);
    if (embedding && embedding.length) {
      item.embedding = embedding;
      await item.save();
    }

    // Fire-and-forget matching if item is found type
    if (type === "found") {
      matchingService.checkMatchesForFoundItem(item).catch((err) => {
        console.error("Error running matching for found item", err);
      });
    }

    res.status(201).json({ item });
  } catch (err) {
    console.error("createItem error", err);
    res.status(500).json({ error: "Server error" });
  }
}

// list items with optional filters
export async function listItems(req, res) {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const items = await Item.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ items });
  } catch (err) {
    console.error("listItems error", err);
    res.status(500).json({ error: "Server error" });
  }
}

// get single item
export async function getItem(req, res) {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  } catch (err) {
    console.error("getItem error", err);
    res.status(500).json({ error: "Server error" });
  }
}
