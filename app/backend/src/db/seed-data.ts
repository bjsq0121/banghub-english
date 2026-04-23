import type { DailyMission } from "@banghub/shared";

type SeedDailyMission = Omit<DailyMission, "isToday">;

function tapMission(
  mission: Omit<SeedDailyMission, "threeYearOld" | "sixYearOld" | "audio" | "publishStatus">,
  distractor = { label: "not this one", imageUrl: "/assets/missions/blue-block.svg" }
): SeedDailyMission {
  return {
    ...mission,
    threeYearOld: {
      promptKo: `${mission.phrase} 그림을 눌러요.`,
      listenText: mission.phrase,
      activityType: "tap-choice",
      choices: [
        {
          id: `${mission.id}-correct`,
          label: mission.phrase,
          imageUrl: mission.image.url,
          isCorrect: true
        },
        {
          id: `${mission.id}-other`,
          label: distractor.label,
          imageUrl: distractor.imageUrl,
          isCorrect: false
        }
      ],
      correctChoiceId: `${mission.id}-correct`
    },
    sixYearOld: {
      promptKo: `문장을 듣고 따라 말해요: ${mission.sentence}`,
      listenText: mission.sentence,
      activityType: "repeat-after-me",
      choices: [],
      correctChoiceId: null
    },
    audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
    publishStatus: "published"
  };
}

export const seedDailyMissions: SeedDailyMission[] = [
  tapMission({
    id: "mission-red-car",
    dateKey: "2026-01-01",
    theme: "toy forest",
    title: "Find the red car",
    character: "robo",
    targetWord: "car",
    phrase: "red car",
    sentence: "I see a red car.",
    dadGuideKo: "아이와 함께 빨간 장난감 자동차를 찾아보세요.",
    encouragement: "Great finding!",
    image: { url: "/assets/missions/red-car.svg", alt: "A red toy car" }
  }),
  tapMission({
    id: "mission-sleeping-bear",
    dateKey: "2026-01-02",
    theme: "quiet room",
    title: "Wake the sleeping bear",
    character: "bunny",
    targetWord: "bear",
    phrase: "sleeping bear",
    sentence: "The bear is sleeping.",
    dadGuideKo: "곰이 자고 있는 척하며 작은 목소리로 표현을 말해 보세요.",
    encouragement: "Soft voice, nice work!",
    image: { url: "/assets/missions/sleeping-bear.svg", alt: "A sleeping bear" }
  }),
  tapMission({
    id: "mission-green-dino",
    dateKey: "2026-01-03",
    theme: "dino park",
    title: "Spot the green dino",
    character: "dino",
    targetWord: "dino",
    phrase: "green dino",
    sentence: "The green dino is big.",
    dadGuideKo: "초록 공룡을 가리키며 문장을 함께 말해 보세요.",
    encouragement: "Big dino voice!",
    image: { url: "/assets/missions/green-dino.svg", alt: "A green dinosaur" }
  }),
  tapMission({
    id: "mission-yellow-star",
    dateKey: "2026-01-04",
    theme: "night sky",
    title: "Touch the yellow star",
    character: "robo",
    targetWord: "star",
    phrase: "yellow star",
    sentence: "I like the yellow star.",
    dadGuideKo: "공중에 별 모양을 그리며 표현을 말해 보세요.",
    encouragement: "Shiny sentence!",
    image: { url: "/assets/missions/yellow-star.svg", alt: "A yellow star" }
  }),
  tapMission({
    id: "mission-jump",
    dateKey: "2026-01-05",
    theme: "move time",
    title: "Jump with Robo",
    character: "robo",
    targetWord: "jump",
    phrase: "jump up",
    sentence: "Let's jump.",
    dadGuideKo: "문장을 말한 뒤 아이와 함께 한 번 점프해 보세요.",
    encouragement: "Nice jump!",
    image: { url: "/assets/missions/jump.svg", alt: "Robo jumping" }
  }),
  tapMission({
    id: "mission-apple",
    dateKey: "2026-01-06",
    theme: "snack table",
    title: "Pick the apple",
    character: "bunny",
    targetWord: "apple",
    phrase: "red apple",
    sentence: "I want an apple.",
    dadGuideKo: "사과를 집어 먹는 흉내를 내며 표현을 연습해 보세요.",
    encouragement: "Yummy words!",
    image: { url: "/assets/missions/apple.svg", alt: "A red apple" }
  }),
  tapMission(
    {
      id: "mission-blue-block",
      dateKey: "2026-01-07",
      theme: "block tower",
      title: "Find the blue block",
      character: "dino",
      targetWord: "block",
      phrase: "blue block",
      sentence: "This is a blue block.",
      dadGuideKo: "표현을 말한 뒤 블록을 하나 쌓아 보세요.",
      encouragement: "Strong tower!",
      image: { url: "/assets/missions/blue-block.svg", alt: "A blue block" }
    },
    { label: "yellow star", imageUrl: "/assets/missions/yellow-star.svg" }
  )
];
