import express from "express";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const messages = [];
const answers = [
  {
    keywords: ["navn", "hedder", "kaldes"],
    answer: "Sanne. Men ingame går jeg med navnet Fever"
  },
  {
    keywords: ["gammel", "alder", "år", "aar", "født"],
    answer: "26 år. Gammel nok til at vide bedre, ung nok til at blive oppe til kl. 2 for “én ranked mere”."
  },
  {
    keywords: ["bor", "bo", "aarhus", "brabrand", "kollegie", "by"],
    answer: "På Aarhus kollegiet i Brabrand"
  },
  {
    keywords: ["single", "kæreste", "kaereste", "forhold", "fransk"],
    answer: "Jeg har en fransk kæreste. Så ja, mit ordforråd rækker en lille smule længere end “croissant”."
  },
  {
    keywords: ["spil", "spiller", "gamer", "gaming", "valorant", "cs2"],
    answer: "Valorant og CS2 er hverdagen. Ellers spiller jeg stort set alt muligt."
  },
  {
    keywords: ["yndlings", "favorit", "singleplayer", "expedition", "33"],
    answer: "Clair Obscur: Expedition 33. Den slog mig bagover fuldstændig."
  },
  {
    keywords: ["pc", "computer", "bygger", "hardware"],
    answer: "Ja. Jeg har bygget omkring 7 stationære computere og er en lille hardware-nørd."
  },
  {
    keywords: ["studie", "studeret", "uddannelse", "multimediedesign"],
    answer: "Multimediedesigner. Nu det så webudvikling — lad os se hvad det kan."
  }
];


function findAnswer(question) {
  const normalizedQuestion = question.toLowerCase();

  for (const answerGroup of answers) {
    const hasMatch = answerGroup.keywords.some((keyword) => normalizedQuestion.includes(keyword));
    if (hasMatch) {
      return answerGroup.answer;
    }
  }

  return "Det kender jeg ikke svaret på endnu.";
}

app.get("/", (request, response) => {
  response.render("index", { messages: [] });
});


app.post("/ask", (request, response) => {
  const question = request.body.question;
  let error = "";
  
  if (!question) {
    error = "skriv et spørgsmål før det sendes";
  } else {
    messages.push({ type: "question", text: question });
    const answer = findAnswer(question);
    messages.push({ type: "answer", text: answer });
  }

  

  response.render("index", { messages, error });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});