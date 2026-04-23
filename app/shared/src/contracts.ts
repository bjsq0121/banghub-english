import { z } from "zod";
import { completionSchema, userProfileSchema } from "./user";
import { conversationItemSchema, difficultySchema, newsItemSchema, trackSchema } from "./content";

export const homeResponseSchema = z.object({
  viewer: userProfileSchema.nullable(),
  todayConversation: conversationItemSchema.nullable(),
  todayNews: newsItemSchema.nullable(),
  completions: z.array(completionSchema)
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const updatePreferencesSchema = z.object({
  difficulty: difficultySchema,
  selectedTracks: z.array(trackSchema).min(1)
});

export const markCompletionSchema = z.object({
  contentId: z.string()
});

export type HomeResponse = z.infer<typeof homeResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type UpdatePreferencesRequest = z.infer<typeof updatePreferencesSchema>;
export type MarkCompletionRequest = z.infer<typeof markCompletionSchema>;
