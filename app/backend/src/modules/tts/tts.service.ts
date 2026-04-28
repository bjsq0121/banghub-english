import { createHash } from "node:crypto";
import textToSpeech from "@google-cloud/text-to-speech";
import { childModeSchema } from "@banghub/shared";
import { getConfig } from "../../config.js";
import { COLLECTIONS } from "../../db/collections.js";
import { getFirestoreClient } from "../../db/firestore.js";
import { getStorageBucket } from "../../db/storage.js";
import { getMissionById } from "../content/content.service.js";

export class TtsNotConfiguredError extends Error {
  constructor() {
    super("Cloud TTS is not configured. Set GOOGLE_TTS_ENABLED=true with valid Google credentials.");
    this.name = "TtsNotConfiguredError";
  }
}

type SynthesizeOptions = {
  voice?: string;
  language?: string;
};

type TtsScope = "targetWord" | "phrase" | "sentence";
type ValidChildMode = "age3" | "age6" | "together";

type TtsDeps = {
  generateAudio: (text: string) => Promise<Buffer>;
  readAudio: (storagePath: string) => Promise<Buffer>;
  writeAudio: (storagePath: string, data: Buffer, contentType: string) => Promise<void>;
};

type TtsResult =
  | { status: "invalid" }
  | { status: "missing" }
  | { status: "ok"; contentType: string; body: Buffer };

type TtsProvider = (text: string, voice: string, language: string) => Promise<Buffer>;

const CACHE_MAX_ENTRIES = 256;
const cache = new Map<string, Buffer>();

function cacheKey(text: string, voice: string, language: string) {
  return createHash("sha1").update(`${language}|${voice}|${text}`).digest("hex");
}

function rememberInCache(key: string, audio: Buffer) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(key, audio);
}

async function googleCloudProvider(text: string, voice: string, language: string): Promise<Buffer> {
  const client = new textToSpeech.TextToSpeechClient();
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: language, name: voice },
    audioConfig: { audioEncoding: "MP3" }
  });

  if (!response.audioContent) {
    throw new Error("Cloud TTS returned empty audio");
  }

  return Buffer.isBuffer(response.audioContent)
    ? response.audioContent
    : Buffer.from(response.audioContent as Uint8Array);
}

let provider: TtsProvider = googleCloudProvider;
let testDeps: Partial<TtsDeps> = {};

const defaultDeps: TtsDeps = {
  async generateAudio(text: string) {
    const config = getConfig();
    return provider(text, config.googleTtsVoice, config.googleTtsLanguage);
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

function getDeps(): TtsDeps {
  return {
    ...defaultDeps,
    ...testDeps
  };
}

export function __setTtsProviderForTests(override: TtsProvider | null) {
  provider = override ?? googleCloudProvider;
}

export function __clearTtsCacheForTests() {
  cache.clear();
}

export function setTtsTestDeps(deps: Partial<TtsDeps>) {
  testDeps = deps;
}

export function resetTtsTestDeps() {
  testDeps = {};
}

export async function synthesize(text: string, options: SynthesizeOptions = {}) {
  const config = getConfig();

  if (!config.googleTtsEnabled) {
    throw new TtsNotConfiguredError();
  }

  const voice = options.voice ?? config.googleTtsVoice;
  const language = options.language ?? config.googleTtsLanguage;
  const key = cacheKey(text, voice, language);

  const hit = cache.get(key);
  if (hit) {
    return hit;
  }

  const audio = await provider(text, voice, language);
  rememberInCache(key, audio);
  return audio;
}

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

  const canGenerateAudio = config.googleTtsEnabled || "generateAudio" in testDeps;

  if (!canGenerateAudio) {
    throw new TtsNotConfiguredError();
  }

  const audio = await deps.generateAudio(text);
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
