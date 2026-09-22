import express from "express";
import fs from "node:fs/promises";

/*Save AMAbot before splitting into routes and data modules*/

const app = express();
const port = 3000;

app.use(express.json());


async function loadMessages() {
  const data = await fs.readFile("./data/messages.json", "utf8");
  return JSON.parse(data);
}

async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}
/*saving the stats*/

async function loadTopicStats() {
  const data = await fs.readFile("./data/topic-stats.json", "utf8");
  return JSON.parse(data);
}

async function saveTopicStats(topicStats) {
  const json = JSON.stringify(topicStats, null, 2);
  await fs.writeFile("./data/topic-stats.json", json);
}
/**/ 

async function loadAnswers() {
  const data = await fs.readFile("./data/answers.json", "utf8");
  return JSON.parse(data);
}

async function saveAnswers(answers) {
  const json = JSON.stringify(answers, null, 2);
  await fs.writeFile("./data/answers.json", json);
}



function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

function countMatches(keywords, normalizedQuestion) {
  return keywords.filter((keyword) => {
    const pattern = new RegExp(`\\b${keyword}\\b`, "i");
    return pattern.test(normalizedQuestion);
  }).length;
}


function startsWithQuestionWord(question) {
  const q = question.trim().toLowerCase();
  return q.startsWith("hvad") || q.startsWith("hvor") || q.startsWith("hvem") || q.startsWith("er") || q.startsWith("har") || q.startsWith("hvilke");
}

function endsWithQuestionMark(question) {
  return question.trim().endsWith("?");
}

function findBestAnswer(question, answers) {
  const normalizedQuestion = question.toLowerCase();
  let bestMatch = null;

  for (const answerGroup of answers) {
    const score = countMatches(answerGroup.keywords, normalizedQuestion);
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { ...answerGroup, score };
    }
  }

  return bestMatch;
}

function reactionFor(category) {
  switch (category) {
    case "navn": return "👋";
    case "alder": return "🎂";
    case "bosted": return "🏠";
    case "forhold": return "💛";
    case "spil": return "🎮";
    case "favorit": return "⭐";
    case "pc": return "🖥️";
    case "uddannelse": return "🎓";
    case "energidrikke": return "⚡";
    case "sprog": return "🗣️";
    default: return "🤖";
  }
}


app.get("/messages", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

app.post("/messages", async (request, response) => {
  const messages = await loadMessages();
  const question = sanitizeQuestion(request.body.question ?? "").trim();

  if (!question) {
    response.json({ error: "Skriv et spørgsmål, før du sender." });
    return;
  }
  if (question.length > 200) {
    response.json({ error: "Spørgsmålet er for langt. Max 200 tegn." });
    return;
  }
  if (!endsWithQuestionMark(question)) {
    response.json({ error: "Spørgsmålet skal slutte med et spørgsmålstegn (?)" });
    return;
  }
  if (!startsWithQuestionWord(question)) {
    response.json({ error: "Prøv at starte spørgsmålet med hvad, hvor, hvem eller er" });
    return;
  }

  const topicStats = await loadTopicStats();

  const answers = await loadAnswers();

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

app.delete("/messages", async (request, response) => {
  await saveMessages([]);
  await saveTopicStats({});

  response.send();
});

app.get("/answers", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

app.get("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find((a) => a.category === request.params.category);

  response.json(answerRule);
});

app.post("/answers", async (request, response) => {
  const answers = await loadAnswers();

  const newAnswerRule = {
    category: request.body.category,
    keywords: request.body.keywords,
    answer: request.body.answer,
    sample: request.body.sample,
  };

  answers.push(newAnswerRule);
  await saveAnswers(answers);

  response.json(newAnswerRule);
});

app.put("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find((a) => a.category === request.params.category);

  answerRule.keywords = request.body.keywords;
  answerRule.answer = request.body.answer;
  answerRule.sample = request.body.sample;

  await saveAnswers(answers);

  response.json(answerRule);
});

app.delete("/answers/:category", async (request, response) => {
  const answers = await loadAnswers();
  const remainingAnswers = answers.filter((a) => a.category !== request.params.category);

  await saveAnswers(remainingAnswers);

  response.send();
});

app.get("/debug", (request, response) => {
  console.log(request.query);
  response.send(request.query);
});

app.get("/debug/:name", (request, response) => {
  console.log(request.params);
  response.send(request.params);
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});