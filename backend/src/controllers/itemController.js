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

    // Handle image URLs
    let imageUrl = "";
    let thumbnailUrl = "";

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      if (req.thumbnail) {
        thumbnailUrl = req.thumbnail.path;
      }
    }

    // create item first without embedding to get _id
    const item = await Item.create({
      ownerId,
      type,
      title,
      description,
      locationText,
      imageUrl,
      thumbnailUrl
    });

    // generate embedding from title + description
    const text = `${title}. ${description || ""}`;
    try {
      const embedding = await embeddingService.getTextEmbedding(text);
      if (embedding && embedding.length) {
        item.embedding = embedding;
        await item.save();
      }
    } catch (embeddingErr) {
      console.error("Failed to generate embedding:", embeddingErr);
      // Continue without embedding rather than failing the request
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

// update item
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { title, description, locationText, status } = req.body;
    const ownerId = req.user?.id;

    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

    // Find the item and check ownership
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: "Forbidden: You don't own this item" });
    }

    // Update fields
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (locationText !== undefined) item.locationText = locationText;
    if (status !== undefined) item.status = status;

    // Handle image update
    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
      if (req.thumbnail) {
        item.thumbnailUrl = req.thumbnail.path;
      }
    }

    // Regenerate embedding if title or description changed
    if (title !== undefined || description !== undefined) {
      const text = `${item.title}. ${item.description || ""}`;
      try {
        const embedding = await embeddingService.getTextEmbedding(text);
        if (embedding && embedding.length) {
          item.embedding = embedding;
        }
      } catch (embeddingErr) {
        console.error("Failed to generate embedding:", embeddingErr);
        // Continue without embedding rather than failing the request
      }
    }

    await item.save();
    res.json({ item });
  } catch (err) {
    console.error("updateItem error", err);
    res.status(500).json({ error: "Server error" });
  }
}

// delete item
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id;

    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

    // Find the item and check ownership
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: "Forbidden: You don't own this item" });
    }

    await Item.findByIdAndDelete(id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("deleteItem error", err);
    res.status(500).json({ error: "Server error" });
  }
}

// get user's items
export async function getUserItems(req, res) {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

    const items = await Item.find({ ownerId }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    console.error("getUserItems error", err);
    res.status(500).json({ error: "Server error" });
  }
}