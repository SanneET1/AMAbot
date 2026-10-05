const API_URL = "http://localhost:3000";

const messagesContainer = document.querySelector("#messages");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const clearMessagesButton = document.querySelector("#clear-messages-button");
const questionSelect = document.querySelector(".question-select");
const topicStatsSection = document.querySelector("#topic-stats");
const topicStatsList = document.querySelector("#topic-stats-list");
const errorMessage = document.querySelector("#error-message");

function displayMessage(message) {
  const html = /*html*/ `
    <div class="bubble ${message.type === "question" ? "user" : "bot"}">${message.text}</div>`;

  messagesContainer.insertAdjacentHTML("beforeend", html);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function getMessages() {
  const response = await fetch(`${API_URL}/messages`);
  const messages = await response.json();

  for (const message of messages) {
    displayMessage(message);
  }
}

getMessages();

questionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();

  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  const data = await response.json();

  // Serveren svarer 400 med { error }, fx hvis spørgsmålet mangler "?"
  if (!response.ok) {
    errorMessage.textContent = data.error;
    errorMessage.hidden = false;
    return;
  }

  errorMessage.hidden = true;

  displayMessage(data.question);
  displayMessage(data.answer);

  questionInput.value = "";

  getTopicStats();
});

clearMessagesButton.addEventListener("click", async () => {
  await fetch(`${API_URL}/messages`, { method: "DELETE" });
  messagesContainer.innerHTML = "";

  getTopicStats();
});

// "Mest spurgte emner", hentet fra GET /messages/stats
async function getTopicStats() {
  const response = await fetch(`${API_URL}/messages/stats`);
  const topicStats = await response.json();

  const sortedTopics = Object.entries(topicStats).sort((a, b) => b[1] - a[1]);

  topicStatsList.innerHTML = "";

  for (const [category, count] of sortedTopics) {
    const html = /*html*/ `
      <li><span class="stat-topic">${category}</span><span class="stat-count">${count}</span></li>`;
    topicStatsList.insertAdjacentHTML("beforeend", html);
  }

  topicStatsSection.hidden = sortedTopics.length === 0;
}

getTopicStats();

// Dropdown med eksempel-spørgsmål, hentet fra GET /answers
async function getAnswers() {
  const response = await fetch(`${API_URL}/answers`);
  const answers = await response.json();

  for (const answer of answers) {
    const html = /*html*/ `<option value="${answer.sample}">${answer.sample}</option>`;
    questionSelect.insertAdjacentHTML("beforeend", html);
  }
}

getAnswers();

function askFromDropdown(select) {
  questionInput.value = select.value;
  select.selectedIndex = 0;
  questionForm.requestSubmit();
}
