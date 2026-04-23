import type { UserProfile } from "@banghub/shared";
import { speak } from "../../lib/tts";
import { CompletionButton } from "../common/CompletionButton";

type NewsItem = {
  id?: string;
  track?: string;
  difficulty?: string;
  title: string;
  passage: string;
  vocabulary: Array<{ term: string; meaning: string }>;
  question: string;
  answer: string;
  ttsText: string;
  publishStatus?: string;
  isToday?: boolean;
};

type NewsPageProps = {
  item: NewsItem;
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

export function NewsPage({ item, viewer, onComplete }: NewsPageProps) {
  return (
    <main className="page">
      <h1>{item.title}</h1>
      <p>{item.passage}</p>
      <button onClick={() => speak(item.ttsText)}>Listen</button>
      <section>
        <h2>Vocabulary</h2>
        <ul>
          {item.vocabulary.map((entry) => (
            <li key={entry.term}>
              {entry.term}: {entry.meaning}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Check</h2>
        <p>{item.question}</p>
        <p>{item.answer}</p>
      </section>
      <CompletionButton viewer={viewer} onComplete={onComplete} />
    </main>
  );
}
