type SpeechOptions = {
  rate?: number;
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

export function playMissionAudio(
  audioUrl: string | null | undefined,
  fallbackText: string,
  options: SpeechOptions = {}
) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    let didFallback = false;
    const fallback = () => {
      if (!didFallback) {
        didFallback = true;
        speak(fallbackText, options);
      }
    };

    audio.addEventListener("error", fallback, { once: true });
    void audio.play().catch(fallback);
    return true;
  }

  return speak(fallbackText, options);
}
