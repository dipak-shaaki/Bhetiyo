import express from "express";
import { createItem, listItems, getItem } from "../controllers/itemController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", listItems);
router.get("/:id", getItem);
router.post("/", authMiddleware, upload.single("image"), createItem);

export default router;
