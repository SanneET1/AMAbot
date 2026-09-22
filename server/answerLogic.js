export function sanitizeQuestion(input) {
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

export function validateQuestion(question) {
  if (!question) return "Skriv et spørgsmål, før du sender.";
  if (question.length > 200) return "Spørgsmålet er for langt. Max 200 tegn.";
  if (!endsWithQuestionMark(question)) return "Spørgsmålet skal slutte med et spørgsmålstegn (?)";
  if (!startsWithQuestionWord(question)) return "Prøv at starte spørgsmålet med hvad, hvor, hvem eller er";
  return "";
}

export function findBestAnswer(question, answers) {
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

export function reactionFor(category) {
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