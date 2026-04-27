import { z } from "zod";
import { childModeSchema, dailyMissionSchema, difficultySchema } from "./content.js";
import { completionSchema, userProfileSchema } from "./user.js";

export const homeResponseSchema = z.object({
  viewer: userProfileSchema.nullable(),
  todayMission: dailyMissionSchema.nullable(),
  completions: z.array(completionSchema)
});

export const missionDetailResponseSchema = z.object({
  item: dailyMissionSchema
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const updatePreferencesSchema = z.object({
  difficulty: difficultySchema,
  selectedTracks: z.array(z.string()).min(1)
});

export const markCompletionSchema = z.object({
  missionId: z.string(),
  childMode: childModeSchema
});

export type HomeResponse = z.infer<typeof homeResponseSchema>;
export type MissionDetailResponse = z.infer<typeof missionDetailResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type UpdatePreferencesRequest = z.infer<typeof updatePreferencesSchema>;
export type MarkCompletionRequest = z.infer<typeof markCompletionSchema>;
