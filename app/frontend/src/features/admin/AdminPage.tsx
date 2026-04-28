import { FormEvent, useState } from "react";
import { API_BASE } from "../../lib/api";

function getKoreaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

type AdminMissionFormState = {
  id: string;
  dateKey: string;
  title: string;
  theme: string;
  character: "robo" | "dino" | "bunny";
  targetWord: string;
  phrase: string;
  sentence: string;
  dadGuideKo: string;
  promptKo: string;
  choiceOne: string;
  choiceTwo: string;
  correctChoice: "choice1" | "choice2";
  encouragement: string;
  imageUrl: string;
  imageAlt: string;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createInitialState(): AdminMissionFormState {
  return {
    id: "",
    dateKey: getKoreaDateKey(),
    title: "Find the red car",
    theme: "toy forest",
    character: "robo",
    targetWord: "car",
    phrase: "red car",
    sentence: "I see a red car.",
    dadGuideKo: "아이와 함께 빨간 장난감 자동차를 찾아보세요.",
    promptKo: "red car 그림을 눌러요.",
    choiceOne: "red car",
    choiceTwo: "not this one",
    correctChoice: "choice1",
    encouragement: "Great finding!",
    imageUrl: "/assets/missions/red-car.svg",
    imageAlt: "A red toy car"
  };
}

function buildMissionPayload(state: AdminMissionFormState) {
  const baseId = state.id.trim() || `mission-${state.dateKey}-${slugify(state.targetWord || state.title)}`;
  const firstChoiceId = `${baseId}-choice-1`;
  const secondChoiceId = `${baseId}-choice-2`;
  const correctChoiceId = state.correctChoice === "choice1" ? firstChoiceId : secondChoiceId;

  return {
    id: baseId,
    dateKey: state.dateKey,
    theme: state.theme,
    title: state.title,
    character: state.character,
    targetWord: state.targetWord,
    phrase: state.phrase,
    sentence: state.sentence,
    dadGuideKo: state.dadGuideKo,
    threeYearOld: {
      promptKo: state.promptKo,
      listenText: state.phrase || state.targetWord,
      activityType: "tap-choice" as const,
      choices: [
        {
          id: firstChoiceId,
          label: state.choiceOne,
          isCorrect: state.correctChoice === "choice1"
        },
        {
          id: secondChoiceId,
          label: state.choiceTwo,
          isCorrect: state.correctChoice === "choice2"
        }
      ],
      correctChoiceId
    },
    sixYearOld: {
      promptKo: state.promptKo,
      listenText: state.sentence || state.phrase || state.targetWord,
      activityType: "tap-choice" as const,
      choices: [
        {
          id: firstChoiceId,
          label: state.choiceOne,
          isCorrect: state.correctChoice === "choice1"
        },
        {
          id: secondChoiceId,
          label: state.choiceTwo,
          isCorrect: state.correctChoice === "choice2"
        }
      ],
      correctChoiceId
    },
    encouragement: state.encouragement,
    image: {
      url: state.imageUrl,
      alt: state.imageAlt
    },
    audio: {
      wordUrl: null,
      phraseUrl: null,
      sentenceUrl: null
    },
    publishStatus: "published" as const,
    isToday: true
  };
}

export function AdminPage() {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<AdminMissionFormState>(() => createInitialState());

  function updateField<K extends keyof AdminMissionFormState>(key: K, value: AdminMissionFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const payload = buildMissionPayload(form);
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
      <h1>오늘 미션 발행</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="grid">
          <label>
            미션 ID
            <input value={form.id} onChange={(event) => updateField("id", event.target.value)} />
          </label>
          <label>
            날짜
            <input
              type="date"
              value={form.dateKey}
              onChange={(event) => updateField("dateKey", event.target.value)}
            />
          </label>
          <label>
            캐릭터
            <select
              value={form.character}
              onChange={(event) =>
                updateField("character", event.target.value as AdminMissionFormState["character"])
              }
            >
              <option value="robo">Robo</option>
              <option value="dino">Dino</option>
              <option value="bunny">Bunny</option>
            </select>
          </label>
          <label>
            테마
            <input value={form.theme} onChange={(event) => updateField("theme", event.target.value)} />
          </label>
          <label>
            미션 제목
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>
          <label>
            핵심 단어
            <input
              value={form.targetWord}
              onChange={(event) => updateField("targetWord", event.target.value)}
            />
          </label>
          <label>
            짧은 구
            <input value={form.phrase} onChange={(event) => updateField("phrase", event.target.value)} />
          </label>
          <label>
            짧은 문장
            <input value={form.sentence} onChange={(event) => updateField("sentence", event.target.value)} />
          </label>
          <label>
            아빠 가이드
            <textarea
              rows={3}
              value={form.dadGuideKo}
              onChange={(event) => updateField("dadGuideKo", event.target.value)}
            />
          </label>
          <label>
            활동 프롬프트
            <textarea
              rows={3}
              value={form.promptKo}
              onChange={(event) => updateField("promptKo", event.target.value)}
            />
          </label>
          <label>
            선택지 1
            <input value={form.choiceOne} onChange={(event) => updateField("choiceOne", event.target.value)} />
          </label>
          <label>
            선택지 2
            <input value={form.choiceTwo} onChange={(event) => updateField("choiceTwo", event.target.value)} />
          </label>
          <label>
            정답 선택
            <select
              value={form.correctChoice}
              onChange={(event) =>
                updateField("correctChoice", event.target.value as AdminMissionFormState["correctChoice"])
              }
            >
              <option value="choice1">선택지 1</option>
              <option value="choice2">선택지 2</option>
            </select>
          </label>
          <label>
            칭찬 문구
            <input
              value={form.encouragement}
              onChange={(event) => updateField("encouragement", event.target.value)}
            />
          </label>
          <label>
            이미지 URL
            <input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} />
          </label>
          <label>
            이미지 설명
            <input value={form.imageAlt} onChange={(event) => updateField("imageAlt", event.target.value)} />
          </label>
        </section>

        <div className="home-hero-actions">
          <button className="secondary-action" type="button" onClick={() => setForm(createInitialState())}>
            임시 저장
          </button>
          <button className="primary-action" type="submit">
            오늘 미션으로 발행
          </button>
        </div>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
