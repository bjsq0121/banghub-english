import textToSpeech from "@google-cloud/text-to-speech";
import { childModeSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";
import { getStorageBucket } from "../../db/storage";
import { getConfig } from "../../config";
import { getMissionById } from "../content/content.service";

export type TtsScope = "targetWord" | "phrase" | "sentence";
type ValidChildMode = "age3" | "age6" | "together";

type TtsDeps = {
  generateAudio: (text: string) => Promise<Buffer>;
  readAudio: (storagePath: string) => Promise<Buffer>;
  writeAudio: (storagePath: string, data: Buffer, contentType: string) => Promise<void>;
};

const ttsClient = new textToSpeech.TextToSpeechClient();

const defaultDeps: TtsDeps = {
  async generateAudio(text: string) {
    const config = getConfig();
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: config.googleTtsLanguage,
        name: config.googleTtsVoice
      },
      audioConfig: {
        audioEncoding: "MP3"
      }
    });

    const content = response.audioContent;

    if (!content) {
      throw new Error("TTS generation returned no audio");
    }

    return Buffer.isBuffer(content) ? content : Buffer.from(content as Uint8Array);
  },

  async readAudio(storagePath: string) {
    const [contents] = await getStorageBucket().file(storagePath).download();
    return contents;
  },

  async writeAudio(storagePath: string, data: Buffer, contentType: string) {
    await getStorageBucket().file(storagePath).save(data, {
      contentType,
      resumable: false
    });
  }
};

let testDeps: Partial<TtsDeps> = {};

function getDeps(): TtsDeps {
  return {
    ...defaultDeps,
    ...testDeps
  };
}

export function setTtsTestDeps(deps: Partial<TtsDeps>) {
  testDeps = deps;
}

export function resetTtsTestDeps() {
  testDeps = {};
}

type TtsResult =
  | { status: "invalid" }
  | { status: "missing" }
  | { status: "ok"; contentType: string; body: Buffer };

function chooseMissionAudioText(
  mission: NonNullable<Awaited<ReturnType<typeof getMissionById>>>,
  childMode: ValidChildMode
) {
  if (childMode === "age6") {
    if (mission.sentence) {
      return { text: mission.sentence, scope: "sentence" as TtsScope };
    }

    if (mission.phrase) {
      return { text: mission.phrase, scope: "phrase" as TtsScope };
    }

    return { text: mission.targetWord, scope: "targetWord" as TtsScope };
  }

  if (mission.phrase) {
    return { text: mission.phrase, scope: "phrase" as TtsScope };
  }

  if (mission.targetWord) {
    return { text: mission.targetWord, scope: "targetWord" as TtsScope };
  }

  return { text: mission.sentence, scope: "sentence" as TtsScope };
}

export async function getMissionTts(
  missionId: string | undefined,
  childModeInput: string | undefined
): Promise<TtsResult> {
  const childMode = childModeSchema.safeParse(childModeInput);

  if (!missionId || !childMode.success) {
    return { status: "invalid" };
  }

  const mission = await getMissionById(missionId);

  if (!mission) {
    return { status: "missing" };
  }

  const db = getFirestoreClient();
  const config = getConfig();
  const contentType = "audio/mpeg";
  const storagePath = `tts/missions/${missionId}/primary.mp3`;
  const now = new Date().toISOString();
  const { text, scope } = chooseMissionAudioText(mission, childMode.data as ValidChildMode);
  const cacheRef = db.collection(COLLECTIONS.ttsCache).doc(missionId);
  const cacheDoc = await cacheRef.get();
  const deps = getDeps();

  if (cacheDoc.exists) {
    const cacheData = cacheDoc.data() as { storagePath?: string; contentType?: string } | undefined;

    if (cacheData?.storagePath) {
      const audio = await deps.readAudio(cacheData.storagePath);
      await cacheRef.set({ lastUsedAt: now }, { merge: true });
      return {
        status: "ok",
        contentType: cacheData.contentType ?? contentType,
        body: audio
      };
    }
  }

  const shouldGenerate = config.googleTtsEnabled || "generateAudio" in testDeps;
  const audio = shouldGenerate ? await deps.generateAudio(text) : Buffer.from(text);
  await deps.writeAudio(storagePath, audio, contentType);
  await cacheRef.set({
    missionId,
    text,
    scope,
    childModeStrategy: childMode.data,
    storagePath,
    contentType,
    createdAt: now,
    lastUsedAt: now
  });

  return {
    status: "ok",
    contentType,
    body: audio
  };
}
