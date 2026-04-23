import { z } from "zod";

export const difficultySchema = z.enum(["intro", "basic", "intermediate"]);
export const trackSchema = z.enum(["conversation", "news"]);
export const publishStatusSchema = z.enum(["draft", "published"]);

export const conversationItemSchema = z.object({
  id: z.string(),
  track: z.literal("conversation"),
  difficulty: difficultySchema,
  title: z.string(),
  situation: z.string(),
  prompt: z.string(),
  answer: z.string(),
  alternatives: z.array(z.string()),
  ttsText: z.string(),
  publishStatus: publishStatusSchema,
  isToday: z.boolean()
});

export const newsItemSchema = z.object({
  id: z.string(),
  track: z.literal("news"),
  difficulty: difficultySchema,
  title: z.string(),
  passage: z.string(),
  vocabulary: z.array(
    z.object({
      term: z.string(),
      meaning: z.string()
    })
  ),
  question: z.string(),
  answer: z.string(),
  ttsText: z.string(),
  publishStatus: publishStatusSchema,
  isToday: z.boolean()
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type Track = z.infer<typeof trackSchema>;
export type ConversationItem = z.infer<typeof conversationItemSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
