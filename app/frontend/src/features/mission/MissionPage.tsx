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

type StepId = "story" | "listen" | "dad" | "action" | "reward";

function getChildMission(mission: DailyMission, childMode: ChildMode): ChildMission {
  if (childMode === "age6") {
    return mission.sixYearOld;
  }

  return mission.threeYearOld;
}

function getAudioUrl(mission: DailyMission, childMode: ChildMode) {
  if (childMode === "age3") {
    return mission.audio.wordUrl;
  }

  if (childMode === "age6") {
    return mission.audio.sentenceUrl ?? mission.audio.phraseUrl ?? mission.audio.wordUrl;
  }

  return mission.audio.phraseUrl ?? mission.audio.wordUrl ?? mission.audio.sentenceUrl;
}

function getCharacterName(character: DailyMission["character"]) {
  if (character === "robo") {
    return "Robo";
  }

  if (character === "dino") {
    return "Dino";
  }

  return "Bunny";
}

function getStepGuide(step: StepId, mission: DailyMission, childMission: ChildMission) {
  if (step === "story") {
    return mission.dadGuideKo;
  }

  if (step === "listen") {
    return `${childMission.listenText}를 두 번 같이 들어보세요.`;
  }

  if (step === "dad") {
    return mission.dadGuideKo;
  }

  if (step === "action") {
    return childMission.promptKo;
  }

  return `${mission.targetWord}를 찾았다고 크게 칭찬해 주세요.`;
}

const steps: StepId[] = ["story", "listen", "dad", "action", "reward"];

export function MissionPage({ mission, childMode, viewer, onComplete }: MissionPageProps) {
  const childMission = useMemo(() => getChildMission(mission, childMode), [mission, childMode]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const selectedChoice = childMission.choices.find((choice) => choice.id === selectedChoiceId);
  const canFinishAction = childMission.correctChoiceId === null || selectedChoice?.isCorrect === true;
  const step = steps[currentStep];
  const fallbackText = childMode === "age6" ? mission.sentence : childMission.listenText;
  const speechRate = childMode === "age3" ? 0.6 : 0.82;
  const characterName = getCharacterName(mission.character);
  const stepGuide = getStepGuide(step, mission, childMission);
  const showPrevious = currentStep > 0;
  const isRewardStep = step === "reward";

  async function handleComplete() {
    if (isSaving) {
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
  }

  function handleNext() {
    if (step === "action" && !canFinishAction) {
      setMessage("하나를 고른 뒤 다음으로 가요.");
      return;
    }

    setMessage("");
    setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
  }

  return (
    <main className="page mission-player-page">
      <header className="mission-player-hero">
        <div>
          <p className="hero-kicker">
            {characterName} · {getChildModeLabel(childMode)}
          </p>
          <h1>{mission.title}</h1>
          <p className="mission-player-progress">
            <strong>{currentStep + 1} / 5</strong>
            <span>{mission.theme}</span>
          </p>
        </div>
        <img src={mission.image.url} alt={mission.image.alt} width="280" />
      </header>

      <section className="mission-player-shell">
        <div className="step-strip" aria-label="Mission steps">
          {steps.map((item, index) => (
            <span
              key={item}
              className={`step-pill${index === currentStep ? " active" : ""}`}
            >
              {index + 1}
            </span>
          ))}
        </div>

        <article className="dad-guide-banner">
          <p className="support-label">아빠 가이드</p>
          <strong>{stepGuide}</strong>
        </article>

        <article className="mission-stage">
          {step === "story" ? (
            <div className="stage-copy">
              <p className="support-label">Story</p>
              <h2>{characterName} introduces today&apos;s game.</h2>
              <p className="english-line">{mission.phrase}</p>
              <p>{mission.targetWord}를 찾는 짧은 영어 놀이를 시작해요.</p>
            </div>
          ) : null}

          {step === "listen" ? (
            <div className="stage-copy">
              <p className="support-label">Listen</p>
              <h2>듣고 같이 말해봐요.</h2>
              <p className="english-line">{childMission.listenText}</p>
              <button
                type="button"
                className="primary-stage-button"
                onClick={() => playMissionAudio(getAudioUrl(mission, childMode), fallbackText, { rate: speechRate })}
              >
                듣기
              </button>
            </div>
          ) : null}

          {step === "dad" ? (
            <div className="stage-copy">
              <p className="support-label">Dad guide</p>
              <h2>아빠가 먼저 보여줄 차례예요.</h2>
              <p>아이와 같은 그림을 가리키고 짧게 따라 말해보세요.</p>
              <p className="english-line">{mission.phrase}</p>
            </div>
          ) : null}

          {step === "action" ? (
            <div className="stage-copy">
              <p className="support-label">Kid action</p>
              <h2>{childMission.promptKo}</h2>
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
                <p className="english-line">{mission.phrase}</p>
              )}
            </div>
          ) : null}

          {step === "reward" ? (
            <div className="stage-copy">
              <p className="support-label">Reward</p>
              <h2>잘했어요!</h2>
              <p className="english-line">{mission.targetWord}</p>
              <p>{message || "오늘 배운 말을 다시 한 번 크게 말해봐요."}</p>
              {viewer ? null : <p>로그인하지 않아도 오늘 활동을 마칠 수 있어요.</p>}
            </div>
          ) : null}
        </article>

        <div className="mission-player-controls">
          <button
            type="button"
            className="secondary-action"
            onClick={() => playMissionAudio(getAudioUrl(mission, childMode), fallbackText, { rate: speechRate })}
          >
            다시 듣기
          </button>

          <div className="mission-player-nav">
            {showPrevious ? (
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setMessage("");
                  setCurrentStep((value) => Math.max(value - 1, 0));
                }}
              >
                이전
              </button>
            ) : null}

            {isRewardStep ? (
              <button
                type="button"
                className="primary-action"
                disabled={isSaving}
                onClick={handleComplete}
              >
                {isSaving ? "저장 중" : "완료"}
              </button>
            ) : (
              <button type="button" className="primary-action" onClick={handleNext}>
                다음
              </button>
            )}
          </div>
        </div>

        {message && !isRewardStep ? <p className="mission-player-message">{message}</p> : null}
      </section>
    </main>
  );
}
