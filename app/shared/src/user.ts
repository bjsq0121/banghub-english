import { z } from "zod";
import { childModeSchema } from "./content.js";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  difficulty: z.enum(["intro", "basic", "intermediate"]),
  selectedTracks: z.array(z.string()).min(1),
  isAdmin: z.boolean()
});

export const completionSchema = z.object({
  userId: z.string(),
  missionId: z.string(),
  childMode: childModeSchema,
  completedOn: z.string(),
  rewardId: z.string()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type Completion = z.infer<typeof completionSchema>;
