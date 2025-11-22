import express from "express";
import { createItem, listItems, getItem, updateItem, deleteItem, getUserItems } from "../controllers/itemController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload, { processImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", listItems);
router.get("/my", authMiddleware, getUserItems);
router.get("/:id", getItem);
router.post("/", authMiddleware, upload.single("image"), processImage, createItem);
router.put("/:id", authMiddleware, upload.single("image"), processImage, updateItem);
router.delete("/:id", authMiddleware, deleteItem);

export default router;