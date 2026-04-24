type SpeechOptions = {
  rate?: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

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

async function fetchServerTtsAudio(text: string): Promise<HTMLAudioElement | null> {
  try {
    const response = await fetch(`${API_BASE}/api/tts?text=${encodeURIComponent(text)}`);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    return new Audio(URL.createObjectURL(blob));
  } catch {
    return null;
  }
}

function playAudioWithFallback(
  audio: HTMLAudioElement,
  fallbackText: string,
  options: SpeechOptions
) {
  let didFallback = false;
  const fallback = () => {
    if (!didFallback) {
      didFallback = true;
      speak(fallbackText, options);
    }
  };

  audio.addEventListener("error", fallback, { once: true });
  void audio.play().catch(fallback);
}

export function playMissionAudio(
  audioUrl: string | null | undefined,
  fallbackText: string,
  options: SpeechOptions = {}
) {
  if (audioUrl) {
    playAudioWithFallback(new Audio(audioUrl), fallbackText, options);
    return true;
  }

  void fetchServerTtsAudio(fallbackText).then((serverAudio) => {
    if (serverAudio) {
      playAudioWithFallback(serverAudio, fallbackText, options);
    } else {
      speak(fallbackText, options);
    }
  });
  return true;
}
