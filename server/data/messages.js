import fs from "node:fs/promises";

export async function loadMessages() {
  try {
    const data = await fs.readFile("./data/messages.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error("Kunne ikke hente beskeder. data/messages.json mangler eller er ugyldig.");
  }
}

export async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}

export async function loadTopicStats() {
  try {
    const data = await fs.readFile("./data/topic-stats.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error("Kunne ikke hente emnestatistik. data/topic-stats.json mangler eller er ugyldig.");
  }
}

export async function saveTopicStats(topicStats) {
  const json = JSON.stringify(topicStats, null, 2);
  await fs.writeFile("./data/topic-stats.json", json);
}
