import { loadMessages, saveMessages, loadTopicStats, saveTopicStats } from "../data/messages.js";
import { loadAnswers } from "../data/answers.js";
import { sanitizeQuestion, validateQuestion, findBestAnswer, reactionFor } from "../answerLogic.js";

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function getMessages(request, response) {
  const messages = await loadMessages();

  response.json(messages);
}

export async function getTopicStats(request, response) {
  const topicStats = await loadTopicStats();

  response.json(topicStats);
}

export async function createMessage(request, response) {
  const question = sanitizeQuestion(request.body.question ?? "").trim();

  const error = validateQuestion(question);
  if (error) {
    response.status(400).json({ error });
    return;
  }

  const messages = await loadMessages();
  const answers = await loadAnswers();
  const topicStats = await loadTopicStats();

  const message = { type: "question", text: escapeHtml(question), createdAt: new Date().toISOString() };
  messages.push(message);

  const bestMatch = findBestAnswer(question, answers);
  const answer = bestMatch ? bestMatch.answer : "Beklager, det kan jeg ikke svare på";
  const reaction = bestMatch ? reactionFor(bestMatch.category) : "🤔";

  if (bestMatch) {
    topicStats[bestMatch.category] = (topicStats[bestMatch.category] || 0) + 1;
  }

  const answerMessage = { type: "answer", text: escapeHtml(`${reaction} ${answer}`), createdAt: new Date().toISOString() };
  messages.push(answerMessage);

  await saveMessages(messages);
  await saveTopicStats(topicStats);

  response.status(201).json({ question: message, answer: answerMessage });
}

export async function deleteMessages(request, response) {
  await saveMessages([]);
  await saveTopicStats({});

  response.status(204).send();
}