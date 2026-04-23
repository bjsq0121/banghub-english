export function speak(text: string) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
