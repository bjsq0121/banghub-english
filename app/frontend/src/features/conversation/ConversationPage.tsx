import type { UserProfile } from "@banghub/shared";
import { speak } from "../../lib/tts";
import { CompletionButton } from "../common/CompletionButton";

type ConversationItem = {
  id?: string;
  track?: string;
  difficulty?: string;
  title: string;
  situation: string;
  prompt: string;
  answer: string;
  alternatives: string[];
  ttsText: string;
  publishStatus?: string;
  isToday?: boolean;
};

type ConversationPageProps = {
  item: ConversationItem;
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

export function ConversationPage({ item, viewer, onComplete }: ConversationPageProps) {
  return (
    <main className="page">
      <h1>{item.title}</h1>
      <p>{item.situation}</p>
      <p>{item.prompt}</p>
      <button onClick={() => speak(item.ttsText)}>Listen</button>
      <section>
        <h2>Suggested answer</h2>
        <p>{item.answer}</p>
        <ul>
          {item.alternatives.map((alternative) => (
            <li key={alternative}>{alternative}</li>
          ))}
        </ul>
      </section>
      <CompletionButton viewer={viewer} onComplete={onComplete} />
    </main>
  );
}
