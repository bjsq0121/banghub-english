import type { ChildMode } from "@banghub/shared";

type SpeechOptions = {
  rate?: number;
};

type MissionAudioRequest = {
  missionId: string;
  childMode: ChildMode;
  fallbackText: string;
};

function selectEnglishVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

function speakNow(text: string, options: SpeechOptions = {}) {
  const utterance = new SpeechSynthesisUtterance(text);
  const englishVoice = selectEnglishVoice();

  utterance.lang = englishVoice?.lang ?? "en-US";
  utterance.rate = options.rate ?? 0.82;
  utterance.pitch = 1;
  utterance.voice = englishVoice ?? null;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function speak(text: string, options: SpeechOptions = {}) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  if (selectEnglishVoice()) {
    speakNow(text, options);
    return true;
  }

  if ("addEventListener" in window.speechSynthesis) {
    const speakAfterVoicesLoad = () => speakNow(text, options);
    window.speechSynthesis.addEventListener("voiceschanged", speakAfterVoicesLoad, { once: true });
    return true;
  }

  speakNow(text, options);
  return true;
}

async function fetchMissionAudioBlob(missionId: string, childMode: ChildMode) {
  const response = await fetch(`/api/tts?missionId=${encodeURIComponent(missionId)}&childMode=${childMode}`);

  if (!response.ok) {
    throw new Error("Server TTS failed");
  }

  return response.blob();
}

export async function playMissionAudio(request: MissionAudioRequest, options: SpeechOptions = {}) {
  try {
    const audioBlob = await fetchMissionAudioBlob(request.missionId, request.childMode);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
    return true;
  } catch {
    return speak(request.fallbackText, options);
  }
}
