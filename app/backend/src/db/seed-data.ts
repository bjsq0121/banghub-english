import type { ChildMission, DailyMission, MissionChoice } from "@banghub/shared";

type SeedDailyMission = Omit<DailyMission, "isToday">;
type MissionBase = Omit<
  SeedDailyMission,
  "threeYearOld" | "sixYearOld" | "audio" | "publishStatus"
>;

function actItOut(promptKo: string, listenText: string): ChildMission {
  return {
    promptKo,
    listenText,
    activityType: "act-it-out",
    choices: [],
    correctChoiceId: null
  };
}

function repeatAfterMe(sentence: string, promptKo?: string): ChildMission {
  return {
    promptKo: promptKo ?? `문장을 듣고 따라 말해요: ${sentence}`,
    listenText: sentence,
    activityType: "repeat-after-me",
    choices: [],
    correctChoiceId: null
  };
}

function tapChoice(
  promptKo: string,
  listenText: string,
  choices: MissionChoice[]
): ChildMission {
  const correct = choices.find((choice) => choice.isCorrect);
  if (!correct) {
    throw new Error("tapChoice requires exactly one correct choice");
  }
  return {
    promptKo,
    listenText,
    activityType: "tap-choice",
    choices,
    correctChoiceId: correct.id
  };
}

function compose(
  base: MissionBase,
  threeYearOld: ChildMission,
  sixYearOld: ChildMission
): SeedDailyMission {
  return {
    ...base,
    threeYearOld,
    sixYearOld,
    audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
    publishStatus: "published"
  };
}

function tapMission(
  mission: MissionBase,
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
  ),
  compose(
    {
      id: "mission-clap-hands",
      dateKey: "2026-01-08",
      theme: "move time",
      title: "Clap with Dino",
      character: "dino",
      targetWord: "clap",
      phrase: "clap hands",
      sentence: "I clap my hands.",
      dadGuideKo: "아이와 눈을 맞추고 박수를 세 번 치며 \"clap hands\"를 말해 보세요.",
      encouragement: "Clap clap clap!",
      image: { url: "/assets/missions/clap-hands.svg", alt: "Two hands clapping" }
    },
    actItOut("박수를 세 번 쳐요.", "clap hands"),
    actItOut("문장을 말하며 박수를 쳐요.", "I clap my hands.")
  ),
  compose(
    {
      id: "mission-big-bubble",
      dateKey: "2026-01-09",
      theme: "bubble play",
      title: "Pop the big bubble",
      character: "robo",
      targetWord: "bubble",
      phrase: "big bubble",
      sentence: "It is a big bubble.",
      dadGuideKo: "손으로 큰 원과 작은 원을 그리며 \"big bubble\"을 크게 말해 보세요.",
      encouragement: "Pop! Nice bubble!",
      image: { url: "/assets/missions/big-bubble.svg", alt: "A big bubble" }
    },
    tapChoice("큰 비눗방울을 눌러요.", "big bubble", [
      {
        id: "mission-big-bubble-correct",
        label: "big bubble",
        imageUrl: "/assets/missions/big-bubble.svg",
        isCorrect: true
      },
      {
        id: "mission-big-bubble-other",
        label: "small bubble",
        imageUrl: "/assets/missions/small-bubble.svg",
        isCorrect: false
      }
    ]),
    tapChoice("큰 비눗방울 문장을 골라요.", "It is a big bubble.", [
      {
        id: "mission-big-bubble-sentence-correct",
        label: "It is a big bubble.",
        isCorrect: true
      },
      {
        id: "mission-big-bubble-sentence-other",
        label: "It is a small bubble.",
        isCorrect: false
      }
    ])
  ),
  compose(
    {
      id: "mission-sleepy-moon",
      dateKey: "2026-01-10",
      theme: "night sky",
      title: "Whisper to the sleepy moon",
      character: "bunny",
      targetWord: "moon",
      phrase: "sleepy moon",
      sentence: "The moon is sleepy.",
      dadGuideKo: "작은 목소리로 달을 가리키며 \"sleepy moon\"을 속삭여 보세요.",
      encouragement: "Sleepy and sweet!",
      image: { url: "/assets/missions/sleepy-moon.svg", alt: "A sleepy crescent moon" }
    },
    tapChoice("달을 눌러요.", "moon", [
      {
        id: "mission-sleepy-moon-correct",
        label: "moon",
        imageUrl: "/assets/missions/sleepy-moon.svg",
        isCorrect: true
      },
      {
        id: "mission-sleepy-moon-other",
        label: "sun",
        imageUrl: "/assets/missions/sun.svg",
        isCorrect: false
      }
    ]),
    repeatAfterMe("The moon is sleepy.")
  ),
  compose(
    {
      id: "mission-hop-bunny",
      dateKey: "2026-01-11",
      theme: "forest fun",
      title: "Hop like a bunny",
      character: "bunny",
      targetWord: "hop",
      phrase: "hop hop",
      sentence: "Hop like a bunny.",
      dadGuideKo: "제자리에서 두 번 뛰며 아이와 함께 \"hop hop\"을 말해 보세요.",
      encouragement: "Great hop!",
      image: { url: "/assets/missions/hop-bunny.svg", alt: "A bunny hopping" }
    },
    actItOut("제자리에서 두 번 뛰어요.", "hop hop"),
    actItOut("문장을 말하며 토끼처럼 뛰어요.", "Hop like a bunny.")
  ),
  compose(
    {
      id: "mission-rain-drop",
      dateKey: "2026-01-12",
      theme: "weather",
      title: "Catch the rain drop",
      character: "dino",
      targetWord: "rain",
      phrase: "rain drop",
      sentence: "Rain falls down.",
      dadGuideKo: "손가락을 위에서 아래로 떨어뜨리며 \"rain\"을 천천히 말해 보세요.",
      encouragement: "Splash splash!",
      image: { url: "/assets/missions/rain-drop.svg", alt: "A blue rain drop" }
    },
    tapChoice("비를 눌러요.", "rain", [
      {
        id: "mission-rain-drop-correct",
        label: "rain",
        imageUrl: "/assets/missions/rain-drop.svg",
        isCorrect: true
      },
      {
        id: "mission-rain-drop-other",
        label: "sun",
        imageUrl: "/assets/missions/sun.svg",
        isCorrect: false
      }
    ]),
    tapChoice("비 내리는 문장을 골라요.", "Rain falls down.", [
      {
        id: "mission-rain-drop-sentence-correct",
        label: "Rain falls down.",
        isCorrect: true
      },
      {
        id: "mission-rain-drop-sentence-other",
        label: "Sun shines up.",
        isCorrect: false
      }
    ])
  ),
  compose(
    {
      id: "mission-happy-balloon",
      dateKey: "2026-01-13",
      theme: "feelings",
      title: "Float the happy balloon",
      character: "robo",
      targetWord: "happy",
      phrase: "happy balloon",
      sentence: "I like a happy balloon.",
      dadGuideKo: "웃는 얼굴을 지으며 \"happy\"를 길게 말해 보세요.",
      encouragement: "So happy!",
      image: { url: "/assets/missions/happy-balloon.svg", alt: "A smiling balloon" }
    },
    tapChoice("웃는 풍선을 눌러요.", "happy balloon", [
      {
        id: "mission-happy-balloon-correct",
        label: "happy balloon",
        imageUrl: "/assets/missions/happy-balloon.svg",
        isCorrect: true
      },
      {
        id: "mission-happy-balloon-other",
        label: "sad balloon",
        imageUrl: "/assets/missions/sad-balloon.svg",
        isCorrect: false
      }
    ]),
    repeatAfterMe("I like a happy balloon.")
  ),
  compose(
    {
      id: "mission-good-night",
      dateKey: "2026-01-14",
      theme: "goodnight",
      title: "Say good night",
      character: "bunny",
      targetWord: "night",
      phrase: "good night",
      sentence: "Good night, forest friends.",
      dadGuideKo: "손을 부드럽게 흔들며 \"good night\"을 속삭여 보세요.",
      encouragement: "Sweet dreams!",
      image: { url: "/assets/missions/good-night.svg", alt: "A starry good night scene" }
    },
    actItOut("손을 흔들며 인사해요.", "good night"),
    repeatAfterMe("Good night, forest friends.")
  )
];
