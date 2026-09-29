import express from "express";
import cors from "cors";
import messagesRouter from "./routes/messages.js";
import answersRouter from "./routes/answers.js";

const app = express();
const port = 3000;

app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());

app.use("/messages", messagesRouter);
app.use("/answers", answersRouter);

app.get("/debug", (request, response) => {
  console.log(request.query);
  response.send(request.query);
});

app.get("/debug/:name", (request, response) => {
  console.log(request.params);
  response.send(request.params);
});

app.use((request, response) => {
  response.status(404).json({ error: "Ukendt sti." });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: error.message });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});