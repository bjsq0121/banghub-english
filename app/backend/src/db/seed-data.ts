export const seedConversationItems = [
  {
    id: "conversation-1",
    title: "Client meeting opener",
    difficulty: "basic",
    situation: "You are starting a weekly client call.",
    prompt: "Greet the client and confirm the agenda.",
    answer: "Thanks for joining. Shall we quickly confirm today's agenda?",
    alternatives: ["Thanks for making time today.", "Can we start by reviewing the agenda?"],
    ttsText: "Thanks for joining. Shall we quickly confirm today's agenda.",
    publishStatus: "published"
  }
];

export const seedNewsItems = [
  {
    id: "news-1",
    title: "Market update",
    difficulty: "basic",
    passage: "Stocks rose after the central bank kept rates unchanged.",
    vocabulary: [{ term: "unchanged", meaning: "not changed" }],
    question: "What happened to rates?",
    answer: "They stayed the same.",
    ttsText: "Stocks rose after the central bank kept rates unchanged.",
    publishStatus: "published"
  }
];
