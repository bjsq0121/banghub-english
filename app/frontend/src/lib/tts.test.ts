import { afterEach, describe, expect, it, vi } from "vitest";
import { playMissionAudio, speak } from "./tts";

class TestUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe("playMissionAudio", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to speech when audio playback rejects", async () => {
    const speakMock = vi.fn();

    vi.stubGlobal("SpeechSynthesisUtterance", TestUtterance);
    vi.stubGlobal("speechSynthesis", {
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
      speak: speakMock
    });
    vi.stubGlobal(
      "Audio",
      vi.fn(() => ({
        addEventListener: vi.fn(),
        play: vi.fn().mockRejectedValue(new Error("play failed"))
      }))
    );

    playMissionAudio("/audio/sentence.mp3", "I see a little train.");
    await Promise.resolve();

    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it("uses an English voice that loads after voiceschanged", async () => {
    const speakMock = vi.fn();
    let voicesChanged: (() => void) | undefined;
    const englishVoice = { lang: "en-US" } as SpeechSynthesisVoice;
    const getVoices = vi.fn()
      .mockReturnValueOnce([])
      .mockReturnValue([englishVoice]);

    vi.stubGlobal("SpeechSynthesisUtterance", TestUtterance);
    vi.stubGlobal("speechSynthesis", {
      cancel: vi.fn(),
      getVoices,
      speak: speakMock,
      addEventListener: vi.fn((event: string, listener: () => void) => {
        if (event === "voiceschanged") {
          voicesChanged = listener;
        }
      }),
      removeEventListener: vi.fn()
    });

    speak("red car");
    expect(voicesChanged).toBeDefined();
    voicesChanged?.();

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0]?.[0]).toMatchObject({ voice: englishVoice, rate: 0.82 });
  });
});
