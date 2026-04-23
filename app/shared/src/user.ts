import { z } from "zod";
import { difficultySchema, trackSchema } from "./content";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  difficulty: difficultySchema,
  selectedTracks: z.array(trackSchema),
  isAdmin: z.boolean()
});

export const completionSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  completedOn: z.string()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type Completion = z.infer<typeof completionSchema>;
