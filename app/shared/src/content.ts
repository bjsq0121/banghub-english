import { z } from "zod";

export const difficultySchema = z.enum(["intro", "basic", "intermediate"]);
export const publishStatusSchema = z.enum(["draft", "published"]);
export const childModeSchema = z.enum(["age3", "age6", "together"]);
export const missionCharacterSchema = z.enum(["robo", "dino", "bunny"]);
export const missionActivityTypeSchema = z.enum(["tap-choice", "act-it-out", "repeat-after-me"]);

export const missionChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  imageUrl: z.string().optional(),
  isCorrect: z.boolean()
});

export const childMissionSchema = z
  .object({
    promptKo: z.string(),
    listenText: z.string(),
    activityType: missionActivityTypeSchema,
    choices: z.array(missionChoiceSchema),
    correctChoiceId: z.string().nullable()
  })
  .superRefine((mission, ctx) => {
    const correctChoices = mission.choices.filter((choice) => choice.isCorrect);

    if (mission.correctChoiceId === null) {
      if (correctChoices.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No choice may be marked correct when correctChoiceId is null",
          path: ["choices"]
        });
      }

      return;
    }

    if (correctChoices.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one choice must be marked correct when correctChoiceId is set",
        path: ["choices"]
      });
    }

    if (correctChoices[0]?.id !== mission.correctChoiceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "correctChoiceId must match the id of the correct choice",
        path: ["correctChoiceId"]
      });
    }
  });

export const missionImageSchema = z.object({
  url: z.string(),
  alt: z.string()
});

export const missionAudioSchema = z.object({
  wordUrl: z.string().nullable(),
  phraseUrl: z.string().nullable(),
  sentenceUrl: z.string().nullable()
});

export const dailyMissionSchema = z.object({
  id: z.string(),
  dateKey: z.string(),
  theme: z.string(),
  title: z.string(),
  character: missionCharacterSchema,
  targetWord: z.string(),
  phrase: z.string(),
  sentence: z.string(),
  dadGuideKo: z.string(),
  threeYearOld: childMissionSchema,
  sixYearOld: childMissionSchema,
  encouragement: z.string(),
  image: missionImageSchema,
  audio: missionAudioSchema,
  publishStatus: publishStatusSchema,
  isToday: z.boolean()
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type PublishStatus = z.infer<typeof publishStatusSchema>;
export type ChildMode = z.infer<typeof childModeSchema>;
export type MissionCharacter = z.infer<typeof missionCharacterSchema>;
export type MissionActivityType = z.infer<typeof missionActivityTypeSchema>;
export type MissionChoice = z.infer<typeof missionChoiceSchema>;
export type ChildMission = z.infer<typeof childMissionSchema>;
export type DailyMission = z.infer<typeof dailyMissionSchema>;
