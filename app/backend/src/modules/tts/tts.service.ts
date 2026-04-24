import { createHash } from "node:crypto";
import { getConfig } from "../../config";

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

type TtsProvider = (text: string, voice: string, language: string) => Promise<Buffer>;

async function googleCloudProvider(text: string, voice: string, language: string): Promise<Buffer> {
  const { TextToSpeechClient } = await import("@google-cloud/text-to-speech");
  const client = new TextToSpeechClient();
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: language, name: voice },
    audioConfig: { audioEncoding: "MP3" }
  });

  if (!response.audioContent) {
    throw new Error("Cloud TTS returned empty audio");
  }

  return Buffer.from(response.audioContent as Uint8Array);
}

let provider: TtsProvider = googleCloudProvider;

export function __setTtsProviderForTests(override: TtsProvider | null) {
  provider = override ?? googleCloudProvider;
}

export function __clearTtsCacheForTests() {
  cache.clear();
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
