import express from "express";
import { getAnswers, getAnswer, createAnswer, updateAnswer, deleteAnswer } from "../controllers/answersController.js";

const router = express.Router();

router.get("/", getAnswers);
router.get("/:category", getAnswer);
router.post("/", createAnswer);
router.put("/:category", updateAnswer);
router.delete("/:category", deleteAnswer);

export default router;