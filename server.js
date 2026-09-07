import express from "express";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const messages = [];
const answers = [
  {
    category: "navn",
    keywords: ["navn", "hedder", "kaldes"],
    answer: "Sanne. Men ingame går jeg med navnet Fever"
  },
  {
    category: "alder",
    keywords: ["gammel", "alder", "år", "aar", "født"],
    answer: "26 år. Gammel nok til at vide bedre, ung nok til at blive oppe til kl. 2 for “én ranked mere”."
  },
  {
    category: "bosted",
    keywords: ["bor", "bo", "aarhus", "brabrand", "kollegie", "by"],
    answer: "På Aarhus kollegiet i Brabrand"
  },
  {
    category: "forhold",
    keywords: ["single", "kæreste", "kaereste", "forhold", "fransk"],
    answer: "Jeg har en fransk kæreste. Så ja, mit ordforråd rækker en lille smule længere end “croissant”."
  },
  {
    category: "spil",
    keywords: ["spil", "spiller", "gamer", "gaming", "valorant", "cs2"],
    answer: "Valorant og CS2 er hverdagen. Ellers spiller jeg stort set alt muligt."
  },
  {
    category: "livret",
    keywords: ["yndlings", "favorit", "singleplayer", "expedition", "33"],
    answer: "Clair Obscur: Expedition 33. Den slog mig bagover fuldstændig."
  },
  {
    category: "pc",
    keywords: ["pc", "computer", "bygger", "hardware"],
    answer: "Ja. Jeg har bygget omkring 7 stationære computere og er en lille hardware-nørd."
  },
  {
    category: "uddannelse",
    keywords: ["studie", "studeret", "uddannelse", "multimediedesign"],
    answer: "Multimediedesigner. Nu det så webudvikling — lad os se hvad det kan."
  }
];

const topicStats = {};

function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

function countMatches(keywords, normalizedQuestion) {
  return keywords.filter((keyword) => normalizedQuestion.includes(keyword)).length;
}

function findBestAnswer(question) {
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
    case "livret": return "⭐";
    case "pc": return "🖥️";
    case "uddannelse": return "🎓";
    default: return "🤖";
  }
}

app.get("/", (request, response) => {
  response.render("index", { messages, error: "", topicStats });
});


app.post("/ask", (request, response) => {
  const rawQuestion = request.body.question;
  const question = sanitizeQuestion(rawQuestion).trim();
  let error = "";
  
  if (!question) {
    error = "skriv et spørgsmål før det sendes";
  } else if (question.length > 200) {
    error = "spørgsmålet er for langt. Max 200 tegn.";
  } else {
    messages.push({ type: "question", text: question });
        const bestMatch = findBestAnswer(question);
    const answer = bestMatch ? bestMatch.answer : "Beklager, det kan jeg ikke svare på";
    const reaction = bestMatch ? reactionFor(bestMatch.category) : "🤔";
    if (bestMatch) {
      topicStats[bestMatch.category] = (topicStats[bestMatch.category] || 0) + 1;
    }
    messages.push({ type: "answer", text: `${reaction} ${answer}` });
  }
    
  

  response.render("index", { messages, error, topicStats });
});

app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  for (const category of Object.keys(topicStats)) delete topicStats[category];
  response.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});