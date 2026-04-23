import { useMemo, useState } from "react";
import type { ChildMission, ChildMode, DailyMission, UserProfile } from "@banghub/shared";
import { getChildModeLabel } from "../../lib/api";
import { playMissionAudio } from "../../lib/tts";

type MissionPageProps = {
  mission: DailyMission;
  childMode: ChildMode;
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

function getChildMission(mission: DailyMission, childMode: ChildMode): ChildMission {
  if (childMode === "age3") {
    return mission.threeYearOld;
  }

  return mission.sixYearOld;
}

function getAudioUrl(mission: DailyMission, childMode: ChildMode) {
  if (childMode === "age3") {
    return mission.audio.wordUrl;
  }

  if (childMode === "age6") {
    return mission.audio.sentenceUrl ?? mission.audio.phraseUrl ?? mission.audio.wordUrl;
  }

  return mission.audio.phraseUrl ?? mission.audio.sentenceUrl ?? mission.audio.wordUrl;
}

export function MissionPage({ mission, childMode, viewer, onComplete }: MissionPageProps) {
  const childMission = useMemo(() => getChildMission(mission, childMode), [mission, childMode]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedChoice = childMission.choices.find((choice) => choice.id === selectedChoiceId);
  const canComplete = childMission.correctChoiceId === null || selectedChoice?.isCorrect === true;
  const fallbackText = childMode === "age3" ? childMission.listenText : mission.sentence;
  const speechRate = childMode === "age3" ? 0.6 : 0.82;

  return (
    <main className="page mission-page">
      <header className="hero mission-hero">
        <p>{mission.theme}</p>
        <h1>{mission.title}</h1>
        <p>
          {mission.character} · {getChildModeLabel(childMode)}
        </p>
      </header>

      <section className="grid">
        <article className="track-card mission-character">
          <img src={mission.image.url} alt={mission.image.alt} width="320" />
          <h2>Listen</h2>
          <p className="english-line">{childMission.listenText}</p>
          <button onClick={() => playMissionAudio(getAudioUrl(mission, childMode), fallbackText, { rate: speechRate })}>
            Listen
          </button>
        </article>

        <article className="track-card mission-panel dad-guide">
          <h2>아빠 가이드</h2>
          <p>{mission.dadGuideKo}</p>
        </article>

        <article className="track-card mission-panel reward-panel">
          <h2>{childMode === "together" ? "같이 해보기" : "아이 활동"}</h2>
          <p>{childMission.promptKo}</p>

          {childMission.choices.length > 0 ? (
            <div className="choice-grid">
              {childMission.choices.map((choice) => (
                <button
                  key={choice.id}
                  className={`choice${choice.id === selectedChoiceId ? " selected" : ""}`}
                  type="button"
                  aria-pressed={choice.id === selectedChoiceId}
                  onClick={() => {
                    setSelectedChoiceId(choice.id);
                    setMessage(choice.isCorrect ? "" : "다시 한 번 골라볼까요?");
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <p>{mission.phrase}</p>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={async () => {
              if (isSaving) {
                return;
              }

              if (!canComplete) {
                setMessage("정답을 고른 뒤 완료해 주세요.");
                return;
              }

              setIsSaving(true);
              try {
                if (viewer) {
                  await onComplete();
                }

                setIsComplete(true);
                setMessage(mission.encouragement);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? "저장 중" : "완료"}
          </button>

          {viewer ? null : <p>로그인하지 않아도 오늘 활동을 마칠 수 있어요.</p>}
          {message ? <p>{message}</p> : null}
          {isComplete ? <strong>{mission.targetWord}</strong> : null}
        </article>
      </section>
    </main>
  );
}
