import type { HomeResponse } from "@banghub/shared";
import { EmptyState } from "../common/EmptyState";
import { TrackCard } from "../common/TrackCard";

type HomePageProps = {
  data: HomeResponse;
};

export function HomePage({ data }: HomePageProps) {
  return (
    <main className="page">
      <header className="hero">
        <p>Daily 10-minute routine</p>
        <h1>Today's English</h1>
      </header>

      <section className="grid">
        {data.todayConversation ? (
          <TrackCard
            heading="Today's Conversation"
            title={data.todayConversation.title}
            description={data.todayConversation.situation}
            to={`/conversation/${data.todayConversation.id}`}
          />
        ) : (
          <EmptyState title="Today's Conversation" body="Conversation content will appear here." />
        )}

        {data.todayNews ? (
          <TrackCard
            heading="Today's News"
            title={data.todayNews.title}
            description={data.todayNews.passage}
            to={`/news/${data.todayNews.id}`}
          />
        ) : (
          <EmptyState title="Today's News" body="News content will appear here." />
        )}
      </section>
    </main>
  );
}
