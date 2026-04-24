import { FormEvent, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function getKoreaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

const missionExample = {
  id: "mission-admin-example",
  dateKey: getKoreaDateKey(),
  theme: "toy forest",
  title: "Find the red car",
  character: "robo",
  targetWord: "car",
  phrase: "red car",
  sentence: "I see a red car.",
  dadGuideKo: "Find the red toy car together.",
  threeYearOld: {
    promptKo: "Tap the red car.",
    listenText: "red car",
    activityType: "tap-choice",
    choices: [
      {
        id: "red-car",
        label: "red car",
        imageUrl: "/assets/missions/red-car.svg",
        isCorrect: true
      },
      {
        id: "blue-block",
        label: "blue block",
        imageUrl: "/assets/missions/blue-block.svg",
        isCorrect: false
      }
    ],
    correctChoiceId: "red-car"
  },
  sixYearOld: {
    promptKo: "Listen and repeat.",
    listenText: "I see a red car.",
    activityType: "repeat-after-me",
    choices: [],
    correctChoiceId: null
  },
  encouragement: "Great finding!",
  image: {
    url: "/assets/missions/red-car.svg",
    alt: "A red toy car"
  },
  audio: {
    wordUrl: null,
    phraseUrl: null,
    sentenceUrl: null
  },
  publishStatus: "published",
  isToday: true
};

export function AdminPage() {
  const [message, setMessage] = useState("");
  const [missionJson, setMissionJson] = useState(() => JSON.stringify(missionExample, null, 2));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const payload = JSON.parse(missionJson);
      const response = await fetch(`${API_BASE}/api/admin/missions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setMessage(response.ok ? "Saved." : "Save failed.");
    } catch {
      setMessage("Save failed.");
    }
  }

  return (
    <main className="page">
      <h1>Admin publishing</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          aria-label="Mission JSON"
          value={missionJson}
          onChange={(event) => setMissionJson(event.target.value)}
          rows={28}
        />
        <button type="submit">Publish today</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
