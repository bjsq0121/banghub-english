export function speak(text: string) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

  utterance.lang = englishVoice?.lang ?? "en-US";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  utterance.voice = englishVoice ?? null;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function playMissionAudio(audioUrl: string | null | undefined, fallbackText: string) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    let didFallback = false;
    const fallback = () => {
      if (!didFallback) {
        didFallback = true;
        speak(fallbackText);
      }
    };

    audio.addEventListener("error", fallback, { once: true });
    void audio.play().catch(fallback);
    return true;
  }

  return speak(fallbackText);
}
