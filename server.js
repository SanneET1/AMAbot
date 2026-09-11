import express from "express";
import fs from "node:fs/promises";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

/*
async function loadMessages() {
  const data = await fs.readFile("./data/messages.json", "utf8");
  return JSON.parse(data);
}

async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}
  */

const messages = [];
const answers = [
  {
    category: "navn",
    keywords: ["navn", "hedder", "kaldes"],
    answer: "Sanne. Men ingame går jeg med navnet Fever",
    sample: "Hvad hedder du?",
  },
  {
    category: "alder",
    keywords: ["gammel", "alder", "år", "aar", "født"],
    answer: "26 år. Gammel nok til at vide bedre, ung nok til at blive oppe til kl. 2 for “én ranked mere”.",
    sample: "Hvor gammel er du?",
  },
  {
    category: "bosted",
    keywords: ["bor", "bo", "aarhus", "brabrand", "kollegie", "by"],
    answer: "På Aarhus kollegiet i Brabrand",
    sample: "Hvor bor du?"
  },
  {
    category: "forhold",
    keywords: ["kæreste", "kaereste", "forhold", "fransk"],
    answer: "Jeg har en fransk kæreste. Så ja, mit ordforråd rækker en lille smule længere end “croissant”.",
    sample: "Har du en kæreste?"
  },
  {
    category: "spil",
    keywords: ["spil", "spiller", "gamer", "gaming", "valorant", "cs2"],
    answer: "Valorant og CS2 er hverdagen. Ellers spiller jeg stort set alt muligt.",
     sample: "Hvilke spil spiller du?"
  },
  {
    category: "favorit",
    keywords: ["yndlings", "favorit", "singleplayer", "expedition", "33", "yndlingsspil", "favoritspil"],
    answer: "Clair Obscur: Expedition 33. Den slog mig bagover fuldstændig.",
    sample: "Hvad er dit yndlingsspil?"
  },
  {
    category: "pc",
    keywords: ["pc", "computer", "bygger", "hardware, computer, stationær, computere, bygget"],
    answer: "Ja. Jeg har bygget omkring 7 stationære computere og er en lille hardware-nørd.",
    sample: "Har du bygget computer før?"
  },
  {
    category: "uddannelse",
    keywords: ["studie", "studeret", "uddannelse", "multimediedesign"],
    answer: "Multimediedesigner. Nu det så webudvikling så lad os se hvad det kan.",
    sample: "Hvilken uddannelse har du?"
  },
  {
    category: "energidrikke",
    keywords: ["energi", "drikke", "monster", "yndlingsenergidrikke"],
    answer: "Jeg er skiftes mellem redbull eller hvid monster, ja redbull er lidt blandet hvad folk synes!",
    sample: "Hvad er din yndlingsenergidrikke?"
  },
  {
    category: "sprog",
    keywords: ["sprog", "taler", "sproget", "snakker"],
    answer: "Jeg taler dansk, engelsk samt jeg prøver at lære fransk nogen gange.",
    sample: "Hvor mange sprog snakker du?"
  }
];

const topicStats = {};

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
    case "favorit": return "⭐";
    case "pc": return "🖥️";
    case "uddannelse": return "🎓";
    case "energidrikke": return "⚡";
    case "sprog": return "🗣️";
    default: return "🤖";
  }
}

app.get("/", (request, response) => {
  response.render("index", { messages, error: "", topicStats, answers });
});


app.post("/ask", (request, response) => {
  const rawQuestion = request.body.question;
  const question = sanitizeQuestion(rawQuestion).trim();
  let error = "";
  
  if (!question) {
    error = "skriv et spørgsmål før det sendes";
  } else if (question.length > 200) {
    error = "spørgsmålet er for langt. Max 200 tegn.";
  } else if (!endsWithQuestionMark(question)) {
    error = "spørgsmålet skal slutte med et spørgsmålstegn (?)";
  } else if (!startsWithQuestionWord(question)) {
    error = "prøv at starte spørgsmålet med hvad, hvor, hvem eller er";
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
    
  

  response.render("index", { messages, error, topicStats, answers });
});

app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  for (const category of Object.keys(topicStats)) delete topicStats[category];
  response.redirect("/");
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