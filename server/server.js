import express from "express";
import messagesRouter from "./routes/messages.js";
import answersRouter from "./routes/answers.js";

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});