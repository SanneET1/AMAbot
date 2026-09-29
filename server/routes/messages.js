import express from "express";
import { getMessages, createMessage, deleteMessages, getTopicStats } from "../controllers/messagesController.js";

const router = express.Router();

router.get("/", getMessages);
router.get("/stats", getTopicStats);
router.post("/", createMessage);
router.delete("/", deleteMessages);

export default router;