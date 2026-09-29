import { loadAnswers, saveAnswers } from "../data/answers.js";

export async function getAnswers(request, response) {
  const answers = await loadAnswers();

  response.json(answers);
}

export async function getAnswer(request, response) {
  const answers = await loadAnswers();
  const answerRule = answers.find((a) => a.category === request.params.category);

  if (!answerRule) {
    response.status(404).json({ error: "Ingen svarregel med den kategori findes." });
    return;
  }

  response.json(answerRule);
}

export async function createAnswer(request, response) {
  const answers = await loadAnswers();

  if (!request.body.category || !request.body.keywords || !request.body.answer) {
    response.status(400).json({ error: "category, keywords og answer skal alle udfyldes." });
    return;
  }

  const newAnswerRule = {
    category: request.body.category,
    keywords: request.body.keywords,
    answer: request.body.answer,
    sample: request.body.sample,
  };

  answers.push(newAnswerRule);
  await saveAnswers(answers);

  response.status(201).json(newAnswerRule);
}

export async function updateAnswer(request, response) {
  const answers = await loadAnswers();
  const answerRule = answers.find((a) => a.category === request.params.category);

  if (!answerRule) {
    response.status(404).json({ error: "Ingen svarregel med den kategori findes." });
    return;
  }

  if (!request.body.keywords || !request.body.answer) {
    response.status(400).json({ error: "keywords og answer skal begge udfyldes." });
    return;
  }

  answerRule.keywords = request.body.keywords;
  answerRule.answer = request.body.answer;
  answerRule.sample = request.body.sample;

  await saveAnswers(answers);

  response.json(answerRule);
}

export async function deleteAnswer(request, response) {
  const answers = await loadAnswers();
  const answerRule = answers.find((a) => a.category === request.params.category);

  if (!answerRule) {
    response.status(404).json({ error: "Ingen svarregel med den kategori findes." });
    return;
  }

  const remainingAnswers = answers.filter((a) => a.category !== request.params.category);

  await saveAnswers(remainingAnswers);

  response.status(204).send();
}
