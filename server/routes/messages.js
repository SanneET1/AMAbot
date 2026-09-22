import express from "express";
import { loadMessages, saveMessages, loadTopicStats, saveTopicStats } from "../data/messages.js";
import { loadAnswers } from "../data/answers.js";
import { sanitizeQuestion, validateQuestion, findBestAnswer, reactionFor } from "../answerLogic.js";

const router = express.Router();

router.get("/", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

router.post("/", async (request, response) => {
  const question = sanitizeQuestion(request.body.question ?? "").trim();

  const error = validateQuestion(question);
  if (error) {
    response.json({ error });
    return;
  }

  const messages = await loadMessages();
  const answers = await loadAnswers();
  const topicStats = await loadTopicStats();

  const message = { type: "question", text: question, createdAt: new Date().toISOString() };
  messages.push(message);

  const bestMatch = findBestAnswer(question, answers);
  const answer = bestMatch ? bestMatch.answer : "Beklager, det kan jeg ikke svare på";
  const reaction = bestMatch ? reactionFor(bestMatch.category) : "🤔";

  if (bestMatch) {
    topicStats[bestMatch.category] = (topicStats[bestMatch.category] || 0) + 1;
  }

  const answerMessage = { type: "answer", text: `${reaction} ${answer}`, createdAt: new Date().toISOString() };
  messages.push(answerMessage);

  await saveMessages(messages);
  await saveTopicStats(topicStats);

  response.json({ question: message, answer: answerMessage });
});

router.delete("/", async (request, response) => {
  await saveMessages([]);
  await saveTopicStats({});

  response.send();
});

export default router;