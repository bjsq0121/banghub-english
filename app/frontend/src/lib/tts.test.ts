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

  it("requests cached mission audio before falling back to browser speech", async () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const audioMock = vi.fn(() => ({
      addEventListener: vi.fn(),
      play: playMock
    }));

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["audio-bytes"], { type: "audio/mpeg" })
    }));
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:audio")
    });
    vi.stubGlobal("Audio", audioMock);

    await playMissionAudio(
      {
        missionId: "mission-red-car",
        childMode: "together",
        fallbackText: "red car"
      },
      { rate: 0.82 }
    );

    expect(fetch).toHaveBeenCalledWith("/api/tts?missionId=mission-red-car&childMode=together");
    expect(audioMock).toHaveBeenCalledWith("blob:audio");
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to browser speech when server audio request fails", async () => {
    const speakMock = vi.fn();

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    vi.stubGlobal("SpeechSynthesisUtterance", TestUtterance);
    vi.stubGlobal("speechSynthesis", {
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
      speak: speakMock
    });

    await playMissionAudio(
      {
        missionId: "mission-red-car",
        childMode: "together",
        fallbackText: "red car"
      },
      { rate: 0.82 }
    );

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
